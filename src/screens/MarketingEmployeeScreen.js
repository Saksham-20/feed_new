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

// Try to import dependencies with fallbacks
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback');
  Icon = ({ name, size, color, style }) => (
    <View style={[{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }, style]} />
  );
}

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage not available');
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

// Simple Card Component
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const MarketingEmployeeScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    performance: {
      thisMonth: 850,
      target: 1000,
      percentage: 85
    },
    campaigns: {
      active: 5,
      total: 12,
      thisWeek: 2
    },
    leads: {
      total: 234,
      converted: 56,
      pending: 89,
      thisWeek: 23
    },
    territories: {
      assigned: 3,
      active: 2
    },
    recentActivities: [
      {
        id: 1,
        type: 'campaign_launch',
        title: 'Summer Sale Campaign Launched',
        description: 'Started social media campaign targeting young professionals',
        time: '2 hours ago',
        status: 'active'
      },
      {
        id: 2,
        type: 'lead_convert',
        title: 'Lead Converted to Customer',
        description: 'Tech startup ABC Corp signed annual contract',
        time: '4 hours ago',
        status: 'success'
      },
      {
        id: 3,
        type: 'meeting',
        title: 'Client Presentation Completed',
        description: 'Presented Q3 marketing strategy to XYZ Industries',
        time: '6 hours ago',
        status: 'completed'
      },
      {
        id: 4,
        type: 'social_post',
        title: 'Social Media Update',
        description: 'Posted product showcase on Instagram and LinkedIn',
        time: '1 day ago',
        status: 'published'
      },
      {
        id: 5,
        type: 'email_campaign',
        title: 'Newsletter Sent',
        description: 'Monthly newsletter sent to 1,250 subscribers',
        time: '2 days ago',
        status: 'delivered'
      }
    ],
    upcomingTasks: [
      {
        id: 1,
        title: 'Prepare Q4 Marketing Plan',
        dueDate: 'Tomorrow',
        priority: 'high',
        category: 'planning'
      },
      {
        id: 2,
        title: 'Follow up with pending leads',
        dueDate: 'Today',
        priority: 'medium',
        category: 'sales'
      },
      {
        id: 3,
        title: 'Update campaign analytics',
        dueDate: 'This week',
        priority: 'low',
        category: 'reporting'
      }
    ]
  });

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'campaigns', label: 'Campaigns', icon: 'megaphone' },
    { key: 'leads', label: 'Leads', icon: 'users' },
    { key: 'analytics', label: 'Analytics', icon: 'bar-chart-2' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with fresh mock data
      setDashboardData(prevData => ({
        ...prevData,
        performance: {
          thisMonth: 850 + Math.floor(Math.random() * 50),
          target: 1000,
          percentage: Math.floor((850 + Math.floor(Math.random() * 50)) / 10)
        },
        campaigns: {
          ...prevData.campaigns,
          active: 5 + Math.floor(Math.random() * 3),
        },
        leads: {
          ...prevData.leads,
          total: 234 + Math.floor(Math.random() * 20),
          thisWeek: 23 + Math.floor(Math.random() * 10),
        }
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  const handleQuickAction = (actionTitle) => {
    Alert.alert(actionTitle, `${actionTitle} feature will be implemented soon.`);
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.key ? '#FFFFFF' : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.key && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDashboard = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {user?.fullname || 'Marketing Pro'}!</Text>
        <Text style={styles.welcomeSubtext}>Your marketing performance overview</Text>
      </View>

      {/* Performance Overview */}
      <Card style={styles.performanceCard}>
        <Text style={styles.sectionTitle}>This Month's Performance</Text>
        <View style={styles.performanceBar}>
          <View style={styles.performanceProgress}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${dashboardData.performance.percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.performanceText}>
            {dashboardData.performance.thisMonth} / {dashboardData.performance.target}
          </Text>
        </View>
        <Text style={styles.performancePercentage}>
          {dashboardData.performance.percentage}% Complete
        </Text>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="megaphone" size={28} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{dashboardData.campaigns.active}</Text>
          <Text style={styles.statLabel}>Active Campaigns</Text>
          <Text style={styles.statTrend}>+{dashboardData.campaigns.thisWeek} this week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="users" size={28} color={theme.colors.success} />
          <Text style={styles.statNumber}>{dashboardData.leads.total}</Text>
          <Text style={styles.statLabel}>Total Leads</Text>
          <Text style={styles.statTrend}>+{dashboardData.leads.thisWeek} this week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="trending-up" size={28} color={theme.colors.warning} />
          <Text style={styles.statNumber}>{dashboardData.leads.converted}</Text>
          <Text style={styles.statLabel}>Converted</Text>
          <Text style={styles.statTrend}>{Math.round((dashboardData.leads.converted/dashboardData.leads.total)*100)}% rate</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="map-pin" size={28} color={theme.colors.error} />
          <Text style={styles.statNumber}>{dashboardData.territories.assigned}</Text>
          <Text style={styles.statLabel}>Territories</Text>
          <Text style={styles.statTrend}>{dashboardData.territories.active} active</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('New Campaign')}
          >
            <Icon name="plus-circle" size={24} color={theme.colors.success} />
            <Text style={styles.quickActionText}>New Campaign</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Lead Management')}
          >
            <Icon name="user-plus" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Lead Management</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Analytics')}
          >
            <Icon name="bar-chart-2" size={24} color={theme.colors.warning} />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Social Media')}
          >
            <Icon name="share-2" size={24} color={theme.colors.secondary} />
            <Text style={styles.quickActionText}>Social Media</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Recent Activities */}
      <Card style={styles.activitiesCard}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {dashboardData.recentActivities.slice(0, 4).map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: getActivityColor(activity.type) }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Activities</Text>
          <Icon name="arrow-right" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </Card>

      {/* Upcoming Tasks */}
      <Card style={styles.tasksCard}>
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        {dashboardData.upcomingTasks.map((task) => (
          <TouchableOpacity key={task.id} style={styles.taskItem}>
            <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskMeta}>
                <Text style={styles.taskDue}>{task.dueDate}</Text>
                <Text style={styles.taskCategory}>{task.category}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'campaigns':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="megaphone" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Campaigns</Text>
            <Text style={styles.placeholderText}>Campaign management features coming soon</Text>
          </View>
        );
      case 'leads':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="users" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Leads</Text>
            <Text style={styles.placeholderText}>Lead management features coming soon</Text>
          </View>
        );
      case 'analytics':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="bar-chart-2" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Analytics</Text>
            <Text style={styles.placeholderText}>Analytics dashboard coming soon</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  const getActivityColor = (type) => {
    const colors = {
      campaign_launch: theme.colors.primary,
      lead_convert: theme.colors.success,
      meeting: theme.colors.warning,
      social_post: theme.colors.secondary,
      email_campaign: theme.colors.error,
    };
    return colors[type] || theme.colors.textSecondary;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: theme.colors.error,
      medium: theme.colors.warning,
      low: theme.colors.success,
    };
    return colors[priority] || theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Marketing Dashboard</Text>
            <Text style={styles.userName}>{user?.fullname || 'Marketing Employee'}</Text>
            <Text style={styles.department}>{user?.department || 'Marketing Department'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  department: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  
  // Content
  tabContent: {
    flex: 1,
    paddingTop: 20,
  },
  
  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Card Component
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Performance Card
  performanceCard: {
    marginBottom: 20,
  },
  performanceBar: {
    marginVertical: 12,
  },
  performanceProgress: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  performanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  performancePercentage: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  
  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  
  // Quick Actions
  quickActionsCard: {},
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Activities
  activitiesCard: {},
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
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  
  // Tasks
  tasksCard: {},
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskPriority: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDue: {
    fontSize: 12,
    color: theme.colors.error,
    marginRight: 12,
  },
  taskCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  
  // View All Button
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
  
  // Placeholder Content
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default MarketingEmployeeScreen;