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

const ClientScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    orders: {
      total: 8,
      pending: 2,
      completed: 5,
      cancelled: 1,
      thisMonth: 3,
      totalValue: 145000,
      recentOrders: [
        { id: 'ORD-2024-089', product: 'Business Software License', amount: 25000, status: 'delivered', date: '2024-01-18' },
        { id: 'ORD-2024-087', product: 'Office Equipment', amount: 35000, status: 'processing', date: '2024-01-16' },
        { id: 'ORD-2024-083', product: 'Marketing Package', amount: 15000, status: 'pending', date: '2024-01-14' },
        { id: 'ORD-2024-078', product: 'Website Development', amount: 45000, status: 'completed', date: '2024-01-10' }
      ]
    },
    bills: {
      total: 6,
      pending: 2,
      paid: 3,
      overdue: 1,
      totalAmount: 87000,
      pendingAmount: 32000,
      recentBills: [
        { id: 'INV-2024-045', description: 'Monthly Service Fee', amount: 15000, status: 'paid', dueDate: '2024-01-15' },
        { id: 'INV-2024-042', description: 'Project Consultation', amount: 22000, status: 'pending', dueDate: '2024-01-25' },
        { id: 'INV-2024-038', description: 'Software License', amount: 18000, status: 'overdue', dueDate: '2024-01-12' }
      ]
    },
    support: {
      totalTickets: 4,
      openTickets: 1,
      resolvedTickets: 3,
      recentTickets: [
        { id: 'TIC-2024-023', subject: 'Login Issues', status: 'open', priority: 'medium', created: '2024-01-17' },
        { id: 'TIC-2024-019', subject: 'Feature Request', status: 'resolved', priority: 'low', created: '2024-01-12' },
        { id: 'TIC-2024-015', subject: 'Payment Problem', status: 'resolved', priority: 'high', created: '2024-01-08' }
      ]
    },
    profile: {
      completeness: 85,
      missingFields: ['Secondary Phone', 'Company Size'],
      lastUpdated: '2024-01-15'
    }
  });

  const tabs = [
    { key: 'dashboard', label: 'Overview', icon: 'home' },
    { key: 'orders', label: 'Orders', icon: 'shopping-cart' },
    { key: 'bills', label: 'Bills', icon: 'credit-card' },
    { key: 'support', label: 'Support', icon: 'help-circle' },
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
        orders: {
          ...prevData.orders,
          total: 8 + Math.floor(Math.random() * 3),
          thisMonth: 3 + Math.floor(Math.random() * 2),
        },
        bills: {
          ...prevData.bills,
          pendingAmount: 32000 + Math.floor(Math.random() * 10000),
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
        <Text style={styles.welcomeText}>Welcome back, {user?.fullname?.split(' ')[0] || 'Client'}!</Text>
        <Text style={styles.welcomeSubtext}>Here's your account overview</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="shopping-cart" size={28} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{dashboardData.orders.total}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statTrend}>{dashboardData.orders.thisMonth} this month</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="credit-card" size={28} color={theme.colors.warning} />
          <Text style={styles.statNumber}>{dashboardData.bills.pending}</Text>
          <Text style={styles.statLabel}>Pending Bills</Text>
          <Text style={styles.statTrend}>₹{(dashboardData.bills.pendingAmount / 1000).toFixed(0)}K due</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="check-circle" size={28} color={theme.colors.success} />
          <Text style={styles.statNumber}>{dashboardData.orders.completed}</Text>
          <Text style={styles.statLabel}>Completed Orders</Text>
          <Text style={styles.statTrend}>All delivered</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="help-circle" size={28} color={theme.colors.error} />
          <Text style={styles.statNumber}>{dashboardData.support.openTickets}</Text>
          <Text style={styles.statLabel}>Open Tickets</Text>
          <Text style={styles.statTrend}>{dashboardData.support.totalTickets} total</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Place New Order')}
          >
            <Icon name="plus-circle" size={24} color={theme.colors.success} />
            <Text style={styles.quickActionText}>New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Pay Bills')}
          >
            <Icon name="credit-card" size={24} color={theme.colors.warning} />
            <Text style={styles.quickActionText}>Pay Bills</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Track Orders')}
          >
            <Icon name="truck" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Track Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleQuickAction('Get Support')}
          >
            <Icon name="message-circle" size={24} color={theme.colors.secondary} />
            <Text style={styles.quickActionText}>Get Support</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Recent Orders */}
      <Card style={styles.ordersCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => setActiveTab('orders')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.orders.recentOrders.slice(0, 3).map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderProduct}>{order.product}</Text>
              <Text style={styles.orderDate}>Ordered: {new Date(order.date).toLocaleDateString()}</Text>
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

      {/* Pending Bills */}
      {dashboardData.bills.pending > 0 && (
        <Card style={styles.billsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Pending Bills</Text>
            <TouchableOpacity onPress={() => setActiveTab('bills')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.bills.recentBills.filter(bill => bill.status === 'pending' || bill.status === 'overdue').map((bill) => (
            <View key={bill.id} style={styles.billItem}>
              <View style={styles.billInfo}>
                <Text style={styles.billId}>{bill.id}</Text>
                <Text style={styles.billDescription}>{bill.description}</Text>
                <Text style={[styles.billDue, bill.status === 'overdue' && styles.billOverdue]}>
                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.billAmount}>
                <Text style={styles.billPrice}>₹{bill.amount.toLocaleString()}</Text>
                <TouchableOpacity 
                  style={[styles.payButton, bill.status === 'overdue' && styles.payButtonUrgent]}
                  onPress={() => handleQuickAction('Pay Bill')}
                >
                  <Text style={styles.payButtonText}>
                    {bill.status === 'overdue' ? 'PAY NOW' : 'PAY'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Profile Completion */}
      {dashboardData.profile.completeness < 100 && (
        <Card style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Complete Your Profile</Text>
            <Text style={styles.completionPercentage}>{dashboardData.profile.completeness}%</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${dashboardData.profile.completeness}%` }]} />
            </View>
          </View>
          
          <Text style={styles.missingFieldsText}>
            Missing: {dashboardData.profile.missingFields.join(', ')}
          </Text>
          
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => handleQuickAction('Complete Profile')}
          >
            <Text style={styles.completeProfileText}>Complete Profile</Text>
            <Icon name="arrow-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>My Orders</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleQuickAction('New Order')}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Order Stats */}
      <View style={styles.orderStatsContainer}>
        <View style={styles.orderStatItem}>
          <View style={[styles.orderStatDot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.orderStatLabel}>Completed</Text>
          <Text style={styles.orderStatCount}>{dashboardData.orders.completed}</Text>
        </View>
        <View style={styles.orderStatItem}>
          <View style={[styles.orderStatDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.orderStatLabel}>Processing</Text>
          <Text style={styles.orderStatCount}>{dashboardData.orders.pending}</Text>
        </View>
        <View style={styles.orderStatItem}>
          <View style={[styles.orderStatDot, { backgroundColor: theme.colors.error }]} />
          <Text style={styles.orderStatLabel}>Cancelled</Text>
          <Text style={styles.orderStatCount}>{dashboardData.orders.cancelled}</Text>
        </View>
      </View>

      <ScrollView style={styles.ordersList}>
        <Text style={styles.listTitle}>All Orders ({dashboardData.orders.total})</Text>
        {dashboardData.orders.recentOrders.map((order) => (
          <Card key={order.id} style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <Text style={styles.orderCardId}>{order.id}</Text>
              <View style={[styles.orderCardStatus, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.orderCardStatusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.orderCardProduct}>{order.product}</Text>
            <View style={styles.orderCardFooter}>
              <Text style={styles.orderCardDate}>Ordered: {new Date(order.date).toLocaleDateString()}</Text>
              <Text style={styles.orderCardAmount}>₹{order.amount.toLocaleString()}</Text>
            </View>
            
            <View style={styles.orderCardActions}>
              <TouchableOpacity 
                style={styles.orderActionButton}
                onPress={() => handleQuickAction('Track Order')}
              >
                <Icon name="truck" size={16} color={theme.colors.primary} />
                <Text style={styles.orderActionText}>Track</Text>
              </TouchableOpacity>
              
              {order.status === 'completed' && (
                <TouchableOpacity 
                  style={styles.orderActionButton}
                  onPress={() => handleQuickAction('Reorder')}
                >
                  <Icon name="repeat" size={16} color={theme.colors.success} />
                  <Text style={styles.orderActionText}>Reorder</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderBills = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>My Bills</Text>
        <Text style={styles.contentSubtitle}>₹{(dashboardData.bills.pendingAmount / 1000).toFixed(0)}K pending</Text>
      </View>

      <ScrollView style={styles.billsList}>
        {dashboardData.bills.recentBills.map((bill) => (
          <Card key={bill.id} style={styles.billCard}>
            <View style={styles.billCardHeader}>
              <Text style={styles.billCardId}>{bill.id}</Text>
              <View style={[styles.billCardStatus, { backgroundColor: getBillStatusColor(bill.status) }]}>
                <Text style={styles.billCardStatusText}>{bill.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.billCardDescription}>{bill.description}</Text>
            <View style={styles.billCardFooter}>
              <Text style={[styles.billCardDue, bill.status === 'overdue' && styles.billCardOverdue]}>
                Due: {new Date(bill.dueDate).toLocaleDateString()}
              </Text>
              <Text style={styles.billCardAmount}>₹{bill.amount.toLocaleString()}</Text>
            </View>
            
            {bill.status !== 'paid' && (
              <TouchableOpacity 
                style={[styles.payBillButton, bill.status === 'overdue' && styles.payBillButtonUrgent]}
                onPress={() => handleQuickAction('Pay Bill')}
              >
                <Icon name="credit-card" size={16} color="#FFFFFF" />
                <Text style={styles.payBillButtonText}>
                  {bill.status === 'overdue' ? 'PAY NOW' : 'PAY BILL'}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderSupport = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>Support Tickets</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleQuickAction('New Ticket')}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.supportList}>
        <Text style={styles.listTitle}>Your Tickets ({dashboardData.support.totalTickets})</Text>
        {dashboardData.support.recentTickets.map((ticket) => (
          <Card key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketCardHeader}>
              <Text style={styles.ticketCardId}>{ticket.id}</Text>
              <View style={[styles.ticketCardPriority, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                <Text style={styles.ticketCardPriorityText}>{ticket.priority.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.ticketCardSubject}>{ticket.subject}</Text>
            <View style={styles.ticketCardFooter}>
              <Text style={styles.ticketCardDate}>Created: {new Date(ticket.created).toLocaleDateString()}</Text>
              <View style={[styles.ticketCardStatus, { backgroundColor: getTicketStatusColor(ticket.status) }]}>
                <Text style={styles.ticketCardStatusText}>{ticket.status.toUpperCase()}</Text>
              </View>
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
      case 'orders':
        return renderOrders();
      case 'bills':
        return renderBills();
      case 'support':
        return renderSupport();
      default:
        return renderDashboard();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.colors.warning,
      processing: theme.colors.primary,
      completed: theme.colors.success,
      delivered: theme.colors.success,
      cancelled: theme.colors.error,
    };
    return colors[status] || theme.colors.textSecondary;
  };

  const getBillStatusColor = (status) => {
    const colors = {
      paid: theme.colors.success,
      pending: theme.colors.warning,
      overdue: theme.colors.error,
    };
    return colors[status] || theme.colors.textSecondary;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: theme.colors.success,
      medium: theme.colors.warning,
      high: theme.colors.error,
    };
    return colors[priority] || theme.colors.textSecondary;
  };

  const getTicketStatusColor = (status) => {
    const colors = {
      open: theme.colors.error,
      'in-progress': theme.colors.warning,
      resolved: theme.colors.success,
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
            <Text style={styles.greeting}>Client Dashboard</Text>
            <Text style={styles.userName}>{user?.fullname || 'Valued Client'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'client@company.com'}</Text>
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
  userEmail: {
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
  completionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  orderProduct: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 11,
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
  
  // Bills
  billsCard: {},
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  billInfo: {
    flex: 1,
  },
  billId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  billDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  billDue: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  billOverdue: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  billPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonUrgent: {
    backgroundColor: theme.colors.error,
  },
  payButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Profile
  profileCard: {},
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
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
  missingFieldsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  completeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  completeProfileText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  
  // Tab Content Headers
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  contentSubtitle: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Orders Tab
  orderStatsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  orderStatLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  orderStatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  ordersList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  orderCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCardId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  orderCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderCardStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderCardProduct: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCardDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  orderCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  orderCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  orderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
    marginLeft: 8,
  },
  orderActionText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Bills Tab
  billsList: {
    flex: 1,
  },
  billCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  billCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billCardId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  billCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  billCardStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  billCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  billCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billCardDue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  billCardOverdue: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  billCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  payBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  payBillButtonUrgent: {
    backgroundColor: theme.colors.error,
  },
  payBillButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Support Tab
  supportList: {
    flex: 1,
  },
  ticketCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketCardId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  ticketCardPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ticketCardPriorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ticketCardSubject: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  ticketCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCardDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  ticketCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ticketCardStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default ClientScreen;