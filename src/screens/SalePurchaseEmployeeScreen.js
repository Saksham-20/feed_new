// src/screens/SalePurchaseEmployeeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const SalePurchaseEmployeeScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      await Promise.all([
        fetchOrders(),
        fetchPurchases(),
        fetchInventory(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    // Mock orders data
    setOrders([
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        customer: 'ABC Corporation',
        amount: 25000,
        status: 'pending',
        items: 5,
        date: '2024-01-15',
        priority: 'high'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        customer: 'XYZ Industries',
        amount: 18500,
        status: 'processing',
        items: 3,
        date: '2024-01-14',
        priority: 'medium'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        customer: 'Tech Solutions Ltd',
        amount: 32000,
        status: 'shipped',
        items: 8,
        date: '2024-01-13',
        priority: 'low'
      }
    ]);
  };

  const fetchPurchases = async () => {
    // Mock purchases data
    setPurchases([
      {
        id: 1,
        poNumber: 'PO-2024-001',
        supplier: 'Global Suppliers Inc',
        amount: 45000,
        status: 'approved',
        items: 12,
        date: '2024-01-12',
        expectedDelivery: '2024-01-20'
      },
      {
        id: 2,
        poNumber: 'PO-2024-002',
        supplier: 'Quality Materials Co',
        amount: 28000,
        status: 'pending',
        items: 6,
        date: '2024-01-11',
        expectedDelivery: '2024-01-18'
      }
    ]);
  };

  const fetchInventory = async () => {
    // Mock inventory data
    setInventory([
      {
        id: 1,
        productName: 'Premium Widget A',
        sku: 'PWA-001',
        currentStock: 150,
        minStock: 50,
        maxStock: 500,
        unitPrice: 250,
        location: 'Warehouse A',
        status: 'in_stock'
      },
      {
        id: 2,
        productName: 'Standard Component B',
        sku: 'SCB-002',
        currentStock: 25,
        minStock: 50,
        maxStock: 300,
        unitPrice: 120,
        location: 'Warehouse B',
        status: 'low_stock'
      },
      {
        id: 3,
        productName: 'Deluxe Part C',
        sku: 'DPC-003',
        currentStock: 0,
        minStock: 20,
        maxStock: 200,
        unitPrice: 380,
        location: 'Warehouse A',
        status: 'out_of_stock'
      }
    ]);
  };

  const renderTabBar = () => {
    const tabs = [
      { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { key: 'orders', label: 'Orders', icon: 'shopping-cart' },
      { key: 'purchases', label: 'Purchases', icon: 'package' },
      { key: 'inventory', label: 'Inventory', icon: 'archive' },
    ];

    return (
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
              color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDashboard = () => (
    <ScrollView 
      style={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
    >
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="shopping-cart" size={32} color="#3B82F6" />
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="package" size={32} color="#10B981" />
          <Text style={styles.statNumber}>{purchases.length}</Text>
          <Text style={styles.statLabel}>Purchase Orders</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="archive" size={32} color="#F59E0B" />
          <Text style={styles.statNumber}>{inventory.length}</Text>
          <Text style={styles.statLabel}>Inventory Items</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="alert-triangle" size={32} color="#EF4444" />
          <Text style={styles.statNumber}>
            {inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length}
          </Text>
          <Text style={styles.statLabel}>Low Stock Alerts</Text>
        </Card>
      </View>

      {/* Recent Orders */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {orders.slice(0, 3).map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderCustomer}>{order.customer}</Text>
              <Text style={styles.orderAmount}>₹{order.amount.toLocaleString()}</Text>
            </View>
            <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
              <Text style={styles.statusText}>{order.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="plus-circle" size={24} color="#3B82F6" />
            <Text style={styles.quickActionText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="package" size={24} color="#10B981" />
            <Text style={styles.quickActionText}>New Purchase</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="search" size={24} color="#F59E0B" />
            <Text style={styles.quickActionText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Icon name="bar-chart-2" size={24} color="#8B5CF6" />
            <Text style={styles.quickActionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );

  const renderOrders = () => (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.listCard}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>{item.orderNumber}</Text>
              <Text style={styles.listSubtitle}>{item.customer}</Text>
            </View>
            <View style={[styles.priorityBadge, styles[`priority_${item.priority}`]]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listAmount}>₹{item.amount.toLocaleString()}</Text>
            <Text style={styles.listDate}>{item.date}</Text>
            <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
              <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </Card>
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
      style={styles.content}
    />
  );

  const renderPurchases = () => (
    <FlatList
      data={purchases}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.listCard}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>{item.poNumber}</Text>
              <Text style={styles.listSubtitle}>{item.supplier}</Text>
            </View>
            <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listAmount}>₹{item.amount.toLocaleString()}</Text>
            <Text style={styles.listDate}>Expected: {item.expectedDelivery}</Text>
          </View>
        </Card>
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPurchases} />}
      style={styles.content}
    />
  );

  const renderInventory = () => (
    <FlatList
      data={inventory}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.listCard}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>{item.productName}</Text>
              <Text style={styles.listSubtitle}>SKU: {item.sku}</Text>
            </View>
            <View style={[styles.stockBadge, styles[`stock_${item.status}`]]}>
              <Text style={styles.stockText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.inventoryMeta}>
            <Text style={styles.stockLevel}>Stock: {item.currentStock}/{item.maxStock}</Text>
            <Text style={styles.unitPrice}>₹{item.unitPrice}/unit</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </Card>
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInventory} />}
      style={styles.content}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales & Purchase</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="user" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {renderTabBar()}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'purchases' && renderPurchases()}
      {activeTab === 'inventory' && renderInventory()}

      {loading && <LoadingSpinner overlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
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
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  orderCustomer: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_pending: {
    backgroundColor: '#FEF3C7',
  },
  status_processing: {
    backgroundColor: '#DBEAFE',
  },
  status_shipped: {
    backgroundColor: '#DDD6FE',
  },
  status_approved: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 76) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  listCard: {
    margin: 16,
    marginTop: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  listSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
  },
  listDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priority_high: {
    backgroundColor: '#FEE2E2',
  },
  priority_medium: {
    backgroundColor: '#FEF3C7',
  },
  priority_low: {
    backgroundColor: '#D1FAE5',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stock_in_stock: {
    backgroundColor: '#D1FAE5',
  },
  stock_low_stock: {
    backgroundColor: '#FEF3C7',
  },
  stock_out_of_stock: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  inventoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLevel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  location: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default SalePurchaseEmployeeScreen;