// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#FF6B35',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#E5E7EB',
  }
};

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const DashboardScreen = ({ user, onLogout }) => {
  const [stats, setStats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = () => {
    // Generate role-specific stats
    const roleStats = {
      admin: [
        { title: 'Total Users', value: '156', color: theme.colors.primary, icon: 'users' },
        { title: 'Active Orders', value: '43', color: theme.colors.success, icon: 'shopping-cart' },
        { title: 'Revenue', value: '₹2.4L', color: theme.colors.primary, icon: 'dollar-sign' },
        { title: 'Pending Issues', value: '7', color: theme.colors.warning, icon: 'alert-circle' },
      ],
      client: [
        { title: 'My Orders', value: '12', color: theme.colors.primary, icon: 'package' },
        { title: 'Pending Bills', value: '3', color: theme.colors.warning, icon: 'file-text' },
        { title: 'Messages', value: '5', color: theme.colors.success, icon: 'message-circle' },
        { title: 'Support Tickets', value: '2', color: theme.colors.primary, icon: 'help-circle' },
      ],
      sales_purchase: [
        { title: 'Sales Target', value: '₹5L', color: theme.colors.primary, icon: 'target' },
        { title: 'Orders Closed', value: '18', color: theme.colors.success, icon: 'check-circle' },
        { title: 'Active Leads', value: '24', color: theme.colors.primary, icon: 'users' },
        { title: 'Follow-ups', value: '9', color: theme.colors.warning, icon: 'clock' },
      ],
      marketing: [
        { title: 'Active Campaigns', value: '6', color: theme.colors.primary, icon: 'megaphone' },
        { title: 'Leads Generated', value: '89', color: theme.colors.success, icon: 'trending-up' },
        { title: 'Conversion Rate', value: '12%', color: theme.colors.primary, icon: 'percent' },
        { title: 'Budget Used', value: '₹45K', color: theme.colors.warning, icon: 'credit-card' },
      ],
      office: [
        { title: 'Documents', value: '234', color: theme.colors.primary, icon: 'file' },
        { title: 'Tasks Completed', value: '67', color: theme.colors.success, icon: 'check' },
        { title: 'Pending Tasks', value: '12', color: theme.colors.warning, icon: 'clock' },
        { title: 'Meetings Today', value: '5', color: theme.colors.primary, icon: 'calendar' },
      ],
    };

    setStats(roleStats[user?.role] || roleStats.client);

    // Generate recent activities
    const recentActivities = [
      {
        id: 1,
        icon: 'user-plus',
        title: 'New user registered',
        description: 'John Doe joined as a client',
        time: '2 minutes ago',
        color: theme.colors.success,
      },
      {
        id: 2,
        icon: 'shopping-cart',
        title: 'Order received',
        description: 'Order #12345 from ABC Corp',
        time: '15 minutes ago',
        color: theme.colors.primary,
      },
      {
        id: 3,
        icon: 'message-circle',
        title: 'New feedback',
        description: 'Customer feedback on service quality',
        time: '1 hour ago',
        color: theme.colors.warning,
      },
      {
        id: 4,
        icon: 'dollar-sign',
        title: 'Payment received',
        description: '₹25,000 payment from XYZ Ltd',
        time: '2 hours ago',
        color: theme.colors.success,
      },
      {
        id: 5,
        icon: 'bell',
        title: 'System update',
        description: 'New features have been deployed',
        time: '4 hours ago',
        color: theme.colors.primary,
      },
    ];

    setActivities(recentActivities);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      loadDashboardData();
      setRefreshing(false);
    }, 1000);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      client: 'Client',
      sales_purchase: 'Sales & Purchase',
      marketing: 'Marketing',
      office: 'Office',
    };
    return roleNames[role] || 'User';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: onLogout 
        },
      ]
    );
  };

  const handleQuickAction = (action) => {
    Alert.alert('Quick Action', `${action} feature coming soon!`);
  };

  const renderStatCard = (stat, index) => (
    <Card key={index} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
          <Icon name={stat.icon} size={24} color={stat.color} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
      </View>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </Card>
  );

  const renderActivityItem = (activity) => (
    <TouchableOpacity key={activity.id} style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
        <Icon name={activity.icon} size={16} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => {
    const actions = {
      admin: [
        { icon: 'users', label: 'Manage Users', action: 'Manage Users' },
        { icon: 'settings', label: 'System Settings', action: 'System Settings' },
        { icon: 'bar-chart', label: 'Analytics', action: 'Analytics' },
        { icon: 'shield', label: 'Security', action: 'Security' },
      ],
      client: [
        { icon: 'plus', label: 'New Order', action: 'New Order' },
        { icon: 'file-text', label: 'View Bills', action: 'View Bills' },
        { icon: 'message-circle', label: 'Send Feedback', action: 'Send Feedback' },
        { icon: 'headphones', label: 'Support', action: 'Support' },
      ],
      sales_purchase: [
        { icon: 'plus-circle', label: 'Add Lead', action: 'Add Lead' },
        { icon: 'phone', label: 'Make Call', action: 'Make Call' },
        { icon: 'trending-up', label: 'View Reports', action: 'View Reports' },
        { icon: 'calendar', label: 'Schedule Meeting', action: 'Schedule Meeting' },
      ],
      marketing: [
        { icon: 'megaphone', label: 'New Campaign', action: 'New Campaign' },
        { icon: 'users', label: 'Manage Leads', action: 'Manage Leads' },
        { icon: 'mail', label: 'Email Blast', action: 'Email Blast' },
        { icon: 'trending-up', label: 'Analytics', action: 'Analytics' },
      ],
      office: [
        { icon: 'file-plus', label: 'New Document', action: 'New Document' },
        { icon: 'check-square', label: 'Task List', action: 'Task List' },
        { icon: 'calendar', label: 'Schedule', action: 'Schedule' },
        { icon: 'archive', label: 'File Manager', action: 'File Manager' },
      ],
    };

    const userActions = actions[user?.role] || actions.client;

    return (
      <View style={styles.quickActionsGrid}>
        {userActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionItem}
            onPress={() => handleQuickAction(action.action)}
          >
            <View style={styles.quickActionIcon}>
              <Icon name={action.icon} size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullname || 'User'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role)}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map(renderStatCard)}
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
          <Card style={styles.activitiesCard}>
            {activities.slice(0, 5).map(renderActivityItem)}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Activities</Text>
              <Icon name="arrow-right" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${theme.colors.error}10`,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activitiesCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 8,
  },
});

export default DashboardScreen;