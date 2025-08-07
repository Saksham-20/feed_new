import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';

// Try to import vector icons, fallback if not available
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback');
  Icon = ({ name, size, color, style }) => (
    <View style={[{ width: size, height: size, backgroundColor: color }, style]} />
  );
}

const { width } = Dimensions.get('window');

// Theme
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#FF6B35',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    surface: '#FFFFFF',
    background: '#F9FAFB',
    border: '#E5E7EB',
  }
};

const DashboardScreen = ({ user, onLogout }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Simulate loading real data based on user role
      const data = generateDashboardData(user?.role);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const generateDashboardData = (role) => {
    const baseData = {
      lastUpdated: new Date().toLocaleString(),
      notifications: [
        { id: 1, title: 'Welcome to Business Pro!', type: 'info', time: '2 min ago' },
        { id: 2, title: 'System maintenance scheduled', type: 'warning', time: '1 hour ago' },
      ],
    };

    switch (role) {
      case 'admin':
        return {
          ...baseData,
          stats: [
            { label: 'Total Users', value: 248, icon: 'users', color: theme.colors.primary, trend: '+12%' },
            { label: 'Active Orders', value: 156, icon: 'shopping-cart', color: theme.colors.success, trend: '+8%' },
            { label: 'Revenue', value: '₹2,45,600', icon: 'dollar-sign', color: theme.colors.warning, trend: '+15%' },
            { label: 'Pending Approvals', value: 12, icon: 'clock', color: theme.colors.error, trend: '-3%' },
          ],
          recentActivities: [
            { id: 1, action: 'New user registration', details: 'John Doe registered as client', time: '10 min ago' },
            { id: 2, action: 'Order completed', details: 'Order #ORD-2024-156 completed', time: '25 min ago' },
            { id: 3, action: 'Payment received', details: 'Payment of ₹15,000 received', time: '1 hour ago' },
            { id: 4, action: 'Employee approved', details: 'Marketing employee approved', time: '2 hours ago' },
            { id: 5, action: 'System backup', details: 'Daily backup completed successfully', time: '3 hours ago' },
          ],
          quickActions: [
            { id: 1, title: 'Approve Users', icon: 'user-check', color: theme.colors.success },
            { id: 2, title: 'View Reports', icon: 'bar-chart-2', color: theme.colors.primary },
            { id: 3, title: 'System Settings', icon: 'settings', color: theme.colors.secondary },
            { id: 4, title: 'User Management', icon: 'users', color: theme.colors.warning },
          ],
        };

      case 'client':
        return {
          ...baseData,
          stats: [
            { label: 'My Orders', value: 8, icon: 'shopping-cart', color: theme.colors.primary, trend: '+2' },
            { label: 'Pending Bills', value: 3, icon: 'file-text', color: theme.colors.warning, trend: 'Due Soon' },
            { label: 'Completed', value: 12, icon: 'check-circle', color: theme.colors.success, trend: '+4' },
            { label: 'Support Tickets', value: 1, icon: 'message-circle', color: theme.colors.error, trend: 'Open' },
          ],
          recentActivities: [
            { id: 1, action: 'Order placed', details: 'Order #ORD-2024-089 placed successfully', time: '2 hours ago' },
            { id: 2, action: 'Payment made', details: 'Invoice #INV-2024-045 paid', time: '1 day ago' },
            { id: 3, action: 'Order delivered', details: 'Order #ORD-2024-078 delivered', time: '3 days ago' },
            { id: 4, action: 'Support request', details: 'Ticket #TIC-2024-023 created', time: '1 week ago' },
          ],
          quickActions: [
            { id: 1, title: 'New Order', icon: 'plus-circle', color: theme.colors.success },
            { id: 2, title: 'View Orders', icon: 'list', color: theme.colors.primary },
            { id: 3, title: 'Pay Bills', icon: 'credit-card', color: theme.colors.warning },
            { id: 4, title: 'Get Support', icon: 'help-circle', color: theme.colors.secondary },
          ],
        };

      case 'marketing':
        return {
          ...baseData,
          stats: [
            { label: 'Campaigns', value: 5, icon: 'megaphone', color: theme.colors.primary, trend: 'Active' },
            { label: 'Leads Generated', value: 234, icon: 'users', color: theme.colors.success, trend: '+18%' },
            { label: 'Conversion Rate', value: '24%', icon: 'trending-up', color: theme.colors.warning, trend: '+2%' },
            { label: 'This Month Target', value: '78%', icon: 'target', color: theme.colors.error, trend: 'On Track' },
          ],
          recentActivities: [
            { id: 1, action: 'Campaign launched', details: 'Summer Sale 2024 campaign started', time: '4 hours ago' },
            { id: 2, action: 'Lead converted', details: 'Lead #LD-2024-456 converted to customer', time: '6 hours ago' },
            { id: 3, action: 'Social post', details: 'Posted on Instagram and Facebook', time: '1 day ago' },
            { id: 4, action: 'Email campaign', details: 'Newsletter sent to 1,250 subscribers', time: '2 days ago' },
          ],
          quickActions: [
            { id: 1, title: 'New Campaign', icon: 'plus-circle', color: theme.colors.success },
            { id: 2, title: 'Lead Management', icon: 'user-plus', color: theme.colors.primary },
            { id: 3, title: 'Analytics', icon: 'bar-chart-2', color: theme.colors.warning },
            { id: 4, title: 'Social Media', icon: 'share-2', color: theme.colors.secondary },
          ],
        };

      case 'sales_purchase':
        return {
          ...baseData,
          stats: [
            { label: 'Sales This Month', value: '₹1,85,000', icon: 'trending-up', color: theme.colors.success, trend: '+22%' },
            { label: 'Orders Processed', value: 67, icon: 'shopping-cart', color: theme.colors.primary, trend: '+15' },
            { label: 'Customer Calls', value: 89, icon: 'phone', color: theme.colors.warning, trend: '+12' },
            { label: 'Follow-ups Due', value: 23, icon: 'clock', color: theme.colors.error, trend: 'Today' },
          ],
          recentActivities: [
            { id: 1, action: 'Big sale closed', details: '₹45,000 deal with ABC Corp closed', time: '1 hour ago' },
            { id: 2, action: 'Customer meeting', details: 'Met with potential client XYZ Ltd', time: '3 hours ago' },
            { id: 3, action: 'Quotation sent', details: 'Quote #QT-2024-089 sent to client', time: '5 hours ago' },
            { id: 4, action: 'Purchase order', details: 'PO #PO-2024-034 created for supplies', time: '1 day ago' },
          ],
          quickActions: [
            { id: 1, title: 'New Order', icon: 'plus-circle', color: theme.colors.success },
            { id: 2, title: 'Customer Calls', icon: 'phone', color: theme.colors.primary },
            { id: 3, title: 'Quotations', icon: 'file-text', color: theme.colors.warning },
            { id: 4, title: 'Purchase Orders', icon: 'shopping-bag', color: theme.colors.secondary },
          ],
        };

      case 'office':
        return {
          ...baseData,
          stats: [
            { label: 'Tasks Pending', value: 15, icon: 'clipboard', color: theme.colors.warning, trend: '3 Overdue' },
            { label: 'Documents', value: 234, icon: 'folder', color: theme.colors.primary, trend: '+12 New' },
            { label: 'Reports Generated', value: 8, icon: 'bar-chart-2', color: theme.colors.success, trend: 'This Week' },
            { label: 'Meetings Today', value: 4, icon: 'calendar', color: theme.colors.error, trend: 'Scheduled' },
          ],
          recentActivities: [
            { id: 1, action: 'Report submitted', details: 'Monthly financial report submitted', time: '30 min ago' },
            { id: 2, action: 'Task completed', details: 'Database backup task completed', time: '2 hours ago' },
            { id: 3, action: 'Meeting scheduled', details: 'Team meeting for tomorrow 10 AM', time: '4 hours ago' },
            { id: 4, action: 'Document filed', details: 'Contract DOC-2024-089 filed', time: '6 hours ago' },
          ],
          quickActions: [
            { id: 1, title: 'New Task', icon: 'plus-circle', color: theme.colors.success },
            { id: 2, title: 'File Documents', icon: 'folder-plus', color: theme.colors.primary },
            { id: 3, title: 'Generate Report', icon: 'file-text', color: theme.colors.warning },
            { id: 4, title: 'Schedule Meeting', icon: 'calendar', color: theme.colors.secondary },
          ],
        };

      default:
        return {
          ...baseData,
          stats: [
            { label: 'Getting Started', value: '1/5', icon: 'check-circle', color: theme.colors.primary, trend: 'Setup' },
            { label: 'Profile', value: '100%', icon: 'user', color: theme.colors.success, trend: 'Complete' },
            { label: 'Tasks', value: 0, icon: 'clipboard', color: theme.colors.warning, trend: 'None' },
            { label: 'Help', value: '24/7', icon: 'help-circle', color: theme.colors.error, trend: 'Available' },
          ],
          recentActivities: [
            { id: 1, action: 'Welcome!', details: 'Account created successfully', time: 'Just now' },
            { id: 2, action: 'Profile setup', details: 'Please complete your profile', time: '1 min ago' },
            { id: 3, action: 'Tutorial', details: 'Getting started guide available', time: '2 min ago' },
          ],
          quickActions: [
            { id: 1, title: 'Complete Profile', icon: 'user', color: theme.colors.success },
            { id: 2, title: 'View Tutorial', icon: 'book', color: theme.colors.primary },
            { id: 3, title: 'Contact Support', icon: 'help-circle', color: theme.colors.warning },
            { id: 4, title: 'Settings', icon: 'settings', color: theme.colors.secondary },
          ],
        };
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      client: 'Client',
      marketing: 'Marketing Employee',
      sales_purchase: 'Sales & Purchase Employee',
      office: 'Office Employee',
    };
    return roleNames[role] || 'User';
  };

  const handleQuickAction = (action) => {
    Alert.alert(action.title, `${action.title} feature will be implemented soon.`);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  const renderStatCard = (stat, index) => (
    <TouchableOpacity key={index} style={styles.statCard} activeOpacity={0.7}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
          <Icon name={stat.icon} size={20} color={stat.color} />
        </View>
        <Text style={[styles.statTrend, { color: stat.trend.includes('+') ? theme.colors.success : stat.trend.includes('-') ? theme.colors.error : theme.colors.textSecondary }]}>
          {stat.trend}
        </Text>
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </TouchableOpacity>
  );

  const renderActivityItem = (activity, index) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{activity.action}</Text>
        <Text style={styles.activityDetails}>{activity.details}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsGrid}>
      {dashboardData?.quickActions?.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.quickActionCard}
          onPress={() => handleQuickAction(action)}
          activeOpacity={0.7}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
            <Icon name={action.icon} size={24} color={action.color} />
          </View>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.notificationsContainer}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      {dashboardData?.notifications?.map((notification) => (
        <TouchableOpacity key={notification.id} style={styles.notificationCard}>
          <View style={styles.notificationContent}>
            <Icon 
              name={notification.type === 'warning' ? 'alert-triangle' : 'info'} 
              size={16} 
              color={notification.type === 'warning' ? theme.colors.warning : theme.colors.primary} 
            />
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullname || 'User'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role)}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Icon name="log-out" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.lastUpdated}>Last updated: {dashboardData.lastUpdated}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {dashboardData.stats.map(renderStatCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {renderQuickActions()}
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesCard}>
            {dashboardData.recentActivities.slice(0, 5).map(renderActivityItem)}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Activities</Text>
              <Icon name="arrow-right" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        {renderNotifications()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  
  // Stats Grid
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  
  // Activities
  activitiesContainer: {
    marginBottom: 24,
  },
  activitiesCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  
  // Notifications
  notificationsContainer: {
    marginBottom: 24,
  },
  notificationCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;