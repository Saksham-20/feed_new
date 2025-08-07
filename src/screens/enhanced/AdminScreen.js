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
  Modal,
  FlatList,
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

// Simple Button Component
const Button = ({ title, onPress, variant = 'primary', size = 'small', style }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'outline' ? styles.buttonOutline : styles.buttonPrimary,
      size === 'small' ? styles.buttonSmall : styles.buttonMedium,
      style
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.buttonText,
      variant === 'outline' ? styles.buttonTextOutline : styles.buttonTextPrimary
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const AdminScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    users: { 
      totalUsers: 248,
      pendingApprovals: 12,
      activeUsers: 195,
      newThisWeek: 8,
      byRole: [
        { role: 'client', count: 180, color: theme.colors.primary },
        { role: 'sales_purchase', count: 25, color: theme.colors.success },
        { role: 'marketing', count: 15, color: theme.colors.warning },
        { role: 'office', count: 18, color: theme.colors.secondary },
        { role: 'admin', count: 10, color: theme.colors.error }
      ]
    },
    orders: { 
      totalOrders: 1456,
      thisMonth: 156,
      pendingOrders: 23,
      completedOrders: 1289,
      totalValue: 2456000,
      recent: [
        { id: 'ORD-2024-156', customer: 'ABC Corp', amount: 45000, status: 'pending' },
        { id: 'ORD-2024-155', customer: 'XYZ Ltd', amount: 32000, status: 'completed' },
        { id: 'ORD-2024-154', customer: 'Tech Solutions', amount: 78000, status: 'processing' }
      ]
    },
    feedback: { 
      totalThreads: 89,
      openTickets: 23,
      resolvedThisWeek: 15,
      avgResponseTime: '2.5 hours',
      byStatus: [
        { status: 'open', count: 23, color: theme.colors.error },
        { status: 'in-progress', count: 12, color: theme.colors.warning },
        { status: 'resolved', count: 54, color: theme.colors.success }
      ]
    },
    revenue: { 
      total_revenue: 2456000,
      thisMonth: 345000,
      growth: 15.8,
      total_bills: 89
    },
    systemHealth: {
      uptime: '99.8%',
      activeConnections: 156,
      serverLoad: '45%',
      storageUsed: '67%'
    }
  });

  // Users data
  const [pendingUsers, setPendingUsers] = useState([
    {
      user_id: 'U001',
      fullname: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1234567890',
      role: 'sales_purchase',
      department: 'Sales',
      employee_id: 'EMP-001',
      created_at: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      user_id: 'U002',
      fullname: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+1234567891',
      role: 'marketing',
      department: 'Marketing',
      employee_id: 'EMP-002',
      created_at: '2024-01-14T14:20:00Z',
      status: 'pending'
    },
    {
      user_id: 'U003',
      fullname: 'Mike Wilson',
      email: 'mike.w@company.com',
      phone: '+1234567892',
      role: 'office',
      department: 'Administration',
      employee_id: 'EMP-003',
      created_at: '2024-01-13T09:15:00Z',
      status: 'pending'
    }
  ]);

  const tabs = [
    { key: 'dashboard', label: 'Overview', icon: 'home' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'orders', label: 'Orders', icon: 'shopping-cart' },
    { key: 'feedback', label: 'Support', icon: 'message-circle' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with fresh mock data
      setDashboardData(prevData => ({
        ...prevData,
        users: {
          ...prevData.users,
          totalUsers: 248 + Math.floor(Math.random() * 10),
          newThisWeek: 8 + Math.floor(Math.random() * 5),
        },
        orders: {
          ...prevData.orders,
          thisMonth: 156 + Math.floor(Math.random() * 20),
          pendingOrders: 23 + Math.floor(Math.random() * 10),
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

  const handleUserApproval = (userId, action) => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          onPress: () => {
            // Remove user from pending list
            setPendingUsers(prev => prev.filter(user => user.user_id !== userId));
            
            // Update dashboard stats
            setDashboardData(prev => ({
              ...prev,
              users: {
                ...prev.users,
                pendingApprovals: Math.max(0, prev.users.pendingApprovals - 1),
                totalUsers: action === 'approve' ? prev.users.totalUsers + 1 : prev.users.totalUsers
              }
            }));
            
            Alert.alert(
              'Success',
              `User has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
            );
          }
        }
      ]
    );
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
        <Text style={styles.welcomeText}>Admin Dashboard</Text>
        <Text style={styles.welcomeSubtext}>System overview and management</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="users" size={28} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{dashboardData.users.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statTrend}>+{dashboardData.users.newThisWeek} this week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="clock" size={28} color={theme.colors.warning} />
          <Text style={styles.statNumber}>{dashboardData.users.pendingApprovals}</Text>
          <Text style={styles.statLabel}>Pending Approvals</Text>
          <Text style={styles.statTrend}>Requires attention</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="shopping-cart" size={28} color={theme.colors.success} />
          <Text style={styles.statNumber}>{dashboardData.orders.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statTrend}>{dashboardData.orders.thisMonth} this month</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="dollar-sign" size={28} color={theme.colors.error} />
          <Text style={styles.statNumber}>₹{(dashboardData.revenue.total_revenue / 100000).toFixed(1)}L</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={styles.statTrend}>+{dashboardData.revenue.growth}% growth</Text>
        </Card>
      </View>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card style={styles.approvalsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Pending User Approvals</Text>
            <TouchableOpacity onPress={() => setShowUserModal(true)}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {pendingUsers.slice(0, 3).map((user) => (
            <View key={user.user_id} style={styles.approvalItem}>
              <View style={styles.approvalInfo}>
                <Text style={styles.approvalName}>{user.fullname}</Text>
                <Text style={styles.approvalRole}>{user.role.replace('_', ' & ').toUpperCase()} • {user.department}</Text>
                <Text style={styles.approvalDate}>Applied {new Date(user.created_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.approvalActions}>
                <Button
                  title="Approve"
                  variant="primary"
                  size="small"
                  onPress={() => handleUserApproval(user.user_id, 'approve')}
                  style={styles.approveButton}
                />
                <Button
                  title="Reject"
                  variant="outline"
                  size="small"
                  onPress={() => handleUserApproval(user.user_id, 'reject')}
                />
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Recent Orders */}
      <Card style={styles.ordersCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.orders.recent.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderCustomer}>{order.customer}</Text>
            </View>
            <View style={styles.orderAmount}>
              <Text style={styles.orderPrice}>₹{order.amount.toLocaleString()}</Text>
              <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.orderStatusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>

      {/* System Health */}
      <Card style={styles.healthCard}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{dashboardData.systemHealth.uptime}</Text>
            <Text style={styles.healthLabel}>Uptime</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{dashboardData.systemHealth.activeConnections}</Text>
            <Text style={styles.healthLabel}>Active Users</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{dashboardData.systemHealth.serverLoad}</Text>
            <Text style={styles.healthLabel}>Server Load</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{dashboardData.systemHealth.storageUsed}</Text>
            <Text style={styles.healthLabel}>Storage Used</Text>
          </View>
        </View>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>User Management</Text>
        <Text style={styles.contentSubtitle}>{dashboardData.users.totalUsers} total users</Text>
      </View>
      
      {/* User Stats */}
      <View style={styles.userStatsContainer}>
        {dashboardData.users.byRole.map((roleData, index) => (
          <View key={index} style={styles.userStatItem}>
            <View style={[styles.userStatDot, { backgroundColor: roleData.color }]} />
            <Text style={styles.userStatRole}>{roleData.role.replace('_', ' & ')}</Text>
            <Text style={styles.userStatCount}>{roleData.count}</Text>
          </View>
        ))}
      </View>

      {/* Pending Approvals */}
      <ScrollView style={styles.usersList}>
        <Text style={styles.listTitle}>Pending Approvals ({pendingUsers.length})</Text>
        {pendingUsers.map((user) => (
          <Card key={user.user_id} style={styles.userCard}>
            <View style={styles.userCardHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {user.fullname.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userCardName}>{user.fullname}</Text>
                <Text style={styles.userCardEmail}>{user.email}</Text>
                <Text style={styles.userCardRole}>{user.role} • {user.department}</Text>
              </View>
            </View>
            <View style={styles.userCardActions}>
              <Button
                title="Approve"
                variant="primary"
                onPress={() => handleUserApproval(user.user_id, 'approve')}
                style={styles.userActionButton}
              />
              <Button
                title="Reject"
                variant="outline"
                onPress={() => handleUserApproval(user.user_id, 'reject')}
                style={styles.userActionButton}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'orders':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="shopping-cart" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Orders Management</Text>
            <Text style={styles.placeholderText}>Order management features coming soon</Text>
          </View>
        );
      case 'feedback':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="message-circle" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Support Tickets</Text>
            <Text style={styles.placeholderText}>Support ticket management coming soon</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.colors.warning,
      processing: theme.colors.primary,
      completed: theme.colors.success,
      cancelled: theme.colors.error,
    };
    return colors[status] || theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Administrator</Text>
            <Text style={styles.userName}>{user?.fullname || 'Admin User'}</Text>
            <Text style={styles.department}>System Administrator</Text>
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
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Approvals
  approvalsCard: {},
  approvalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  approvalRole: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  approvalDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  approvalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approveButton: {
    marginRight: 8,
  },
  
  // Orders
  ordersCard: {},
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // System Health
  healthCard: {},
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthItem: {
    alignItems: 'center',
  },
  healthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  healthLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  // Button Styles
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonSmall: {
    minWidth: 60,
  },
  buttonMedium: {
    minWidth: 80,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: theme.colors.textPrimary,
  },
  
  // Users Tab
  contentHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  userStatsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  userStatRole: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  userStatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  usersList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  userCardEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  userCardRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  userCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userActionButton: {
    marginLeft: 8,
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

export default AdminScreen;