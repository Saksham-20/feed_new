// src/components/dashboard/InteractiveDashboard.js - Enhanced interactive dashboard
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import realtimeService from '../../services/realtimeService';
import { STORAGE_KEYS } from '../../utils/constants';
import { theme } from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const InteractiveDashboard = ({ userRole, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeMetric, setActiveMetric] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMetricDetails, setShowMetricDetails] = useState(false);

  useEffect(() => {
    initializeDashboard();
    setupRealtimeConnection();
    animateEntrance();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchNotifications(),
        connectRealtime()
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      Alert.alert('Error', 'Failed to initialize dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      let response;
      
      switch (userRole) {
        case 'admin':
          response = await apiService.getAdminDashboard();
          break;
        case 'client':
          response = await apiService.getClientDashboard();
          break;
        case 'sales_purchase':
          response = await apiService.getSalesDashboard();
          break;
        case 'marketing':
          response = await apiService.getMarketingDashboard();
          break;
        case 'office':
          response = await apiService.getOfficeDashboard();
          break;
        default:
          throw new Error('Invalid user role');
      }

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      throw error;
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications({ limit: 10 });
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  };

  const connectRealtime = async () => {
    const connected = await realtimeService.connect();
    if (connected) {
      setupRealtimeListeners();
    }
  };

  const setupRealtimeConnection = () => {
    // Connection status monitoring
    realtimeService.on('connected', () => {
      setConnectionStatus('connected');
      animateConnectionStatus('connected');
    });

    realtimeService.on('disconnected', () => {
      setConnectionStatus('disconnected');
      animateConnectionStatus('disconnected');
    });

    realtimeService.on('connectionError', () => {
      setConnectionStatus('error');
      animateConnectionStatus('error');
    });
  };

  const setupRealtimeListeners = () => {
    // Subscribe to real-time updates
    const unsubscribeNotifications = realtimeService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      animateNotificationReceived();
    });

    const unsubscribeOrderUpdates = realtimeService.subscribeToOrderUpdates((orderData) => {
      setRealTimeData(prev => ({ ...prev, lastOrderUpdate: orderData }));
      updateDashboardMetrics('orders', orderData);
    });

    const unsubscribeSystemAlerts = realtimeService.subscribeToSystemAlerts((alert) => {
      Alert.alert('System Alert', alert.message);
    });

    // Store unsubscribe functions for cleanup
    window.realtimeUnsubscribers = [
      unsubscribeNotifications,
      unsubscribeOrderUpdates,
      unsubscribeSystemAlerts
    ];
  };

  const updateDashboardMetrics = (type, data) => {
    setDashboardData(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'orders':
          if (updated.orders) {
            updated.orders.recent = [data, ...(updated.orders.recent || []).slice(0, 4)];
            updated.orders.totalOrders = (updated.orders.totalOrders || 0) + 1;
          }
          break;
        // Add more cases as needed
      }
      
      return updated;
    });
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateNotificationReceived = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateConnectionStatus = (status) => {
    // Visual feedback for connection status changes
    const statusColors = {
      connected: '#10B981',
      disconnected: '#EF4444',
      error: '#F59E0B'
    };
    
    // You could animate status indicator color here
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchNotifications()
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const cleanup = () => {
    if (window.realtimeUnsubscribers) {
      window.realtimeUnsubscribers.forEach(unsubscribe => unsubscribe());
    }
    realtimeService.removeAllListeners();
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        icon: 'bell',
        label: 'Notifications',
        count: notifications.filter(n => !n.isRead).length,
        onPress: () => setShowNotifications(true),
        color: '#6366F1'
      },
      {
        icon: 'refresh-cw',
        label: 'Refresh',
        onPress: onRefresh,
        color: '#10B981'
      }
    ];

    const roleSpecificActions = {
      admin: [
        {
          icon: 'users',
          label: 'User Management',
          onPress: () => navigation.navigate('UserManagement'),
          color: '#F59E0B'
        },
        {
          icon: 'settings',
          label: 'System Settings',
          onPress: () => navigation.navigate('Settings'),
          color: '#8B5CF6'
        }
      ],
      client: [
        {
          icon: 'plus',
          label: 'New Order',
          onPress: () => navigation.navigate('CreateOrder'),
          color: '#10B981'
        },
        {
          icon: 'message-circle',
          label: 'Support',
          onPress: () => navigation.navigate('Support'),
          color: '#EF4444'
        }
      ],
      sales_purchase: [
        {
          icon: 'trending-up',
          label: 'Sales Report',
          onPress: () => navigation.navigate('SalesReport'),
          color: '#10B981'
        },
        {
          icon: 'shopping-cart',
          label: 'Purchase Orders',
          onPress: () => navigation.navigate('PurchaseOrders'),
          color: '#F59E0B'
        }
      ]
    };

    return [...baseActions, ...(roleSpecificActions[userRole] || [])];
  };

  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View style={[
        styles.connectionIndicator,
        { backgroundColor: connectionStatus === 'connected' ? '#10B981' : '#EF4444' }
      ]} />
      <Text style={styles.connectionText}>
        {connectionStatus === 'connected' ? 'Live' : 'Offline'}
      </Text>
    </View>
  );

  const renderQuickStats = () => {
    const stats = [];
    
    if (userRole === 'admin') {
      stats.push(
        { label: 'Total Users', value: dashboardData.users?.totalUsers || 0, icon: 'users', color: '#6366F1' },
        { label: 'Pending Approvals', value: dashboardData.users?.pendingApprovals || 0, icon: 'clock', color: '#F59E0B' },
        { label: 'Total Orders', value: dashboardData.orders?.totalOrders || 0, icon: 'shopping-cart', color: '#10B981' },
        { label: 'Revenue', value: `₹${(dashboardData.revenue?.total_revenue || 0).toLocaleString()}`, icon: 'dollar-sign', color: '#EF4444' }
      );
    } else if (userRole === 'client') {
      stats.push(
        { label: 'My Orders', value: dashboardData.orders?.length || 0, icon: 'shopping-cart', color: '#6366F1' },
        { label: 'Pending Bills', value: dashboardData.bills?.filter(b => b.status === 'pending')?.length || 0, icon: 'file-text', color: '#F59E0B' },
        { label: 'Support Tickets', value: dashboardData.feedback?.length || 0, icon: 'message-circle', color: '#10B981' }
      );
    }

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Animated.View
            key={index}
            style={[
              styles.statCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.statContent}
              onPress={() => {
                setActiveMetric(stat.label);
                setShowMetricDetails(true);
              }}
            >
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderChart = () => {
    if (!dashboardData.charts) return null;

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [20, 45, 28, 80, 99, 43],
        strokeWidth: 2
      }]
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Performance Overview</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            style: { borderRadius: 16 }
          }}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderRecentActivity = () => {
    const activities = dashboardData.recentActivity || [];

    return (
      <Card style={styles.activityCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ActivityLog')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Icon name={activity.icon || 'activity'} size={16} color="#6B7280" />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    );
  };

  const renderFloatingActionButton = () => (
    <Animated.View
      style={[
        styles.fab,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setShowQuickActions(true)}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
        </View>
        {renderConnectionStatus()}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderQuickStats()}
        {renderChart()}
        {renderRecentActivity()}
        
        <View style={styles.spacer} />
      </ScrollView>

      {renderFloatingActionButton()}

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {getQuickActions().map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionItem}
                  onPress={() => {
                    setShowQuickActions(false);
                    action.onPress();
                  }}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <Icon name={action.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                  {action.count > 0 && (
                    <View style={styles.quickActionBadge}>
                      <Text style={styles.quickActionBadgeText}>{action.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Close"
              variant="secondary"
              onPress={() => setShowQuickActions(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>No notifications</Text>
              ) : (
                notifications.map((notification, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.notificationItem,
                      !notification.isRead && styles.unreadNotification
                    ]}
                    onPress={() => {
                      if (!notification.isRead) {
                        apiService.markNotificationRead(notification.id);
                        realtimeService.markNotificationRead(notification.id);
                      }
                    }}
                  >
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.createdAt}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <Button
              title="Close"
              variant="secondary"
              onPress={() => setShowNotifications(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    padding: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    backgroundColor: '#6366F1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  spacer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    position: 'relative',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  quickActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationsList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default InteractiveDashboard;