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
  TextInput,
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
const Button = ({ title, onPress, variant = 'primary', size = 'medium', style, disabled }) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'outline' ? styles.buttonOutline : styles.buttonPrimary,
      size === 'small' ? styles.buttonSmall : styles.buttonMedium,
      disabled && styles.buttonDisabled,
      style
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[
      styles.buttonText,
      variant === 'outline' ? styles.buttonTextOutline : styles.buttonTextPrimary,
      disabled && styles.buttonTextDisabled
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const OfficeEmployeeScreen = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    tasks: {
      pending: 15,
      completed: 42,
      overdue: 3,
      thisWeek: 8,
      byPriority: [
        { priority: 'high', count: 5, color: theme.colors.error },
        { priority: 'medium', count: 7, color: theme.colors.warning },
        { priority: 'low', count: 3, color: theme.colors.success }
      ]
    },
    documents: {
      total: 234,
      recent: 12,
      thisMonth: 45,
      categories: [
        { name: 'Contracts', count: 45, icon: 'file-text' },
        { name: 'Reports', count: 78, icon: 'bar-chart' },
        { name: 'Invoices', count: 67, icon: 'dollar-sign' },
        { name: 'Other', count: 44, icon: 'folder' }
      ]
    },
    reports: {
      thisMonth: 8,
      pending: 3,
      completed: 12,
      scheduled: 2
    },
    meetings: {
      today: 4,
      thisWeek: 12,
      upcoming: [
        { id: 1, title: 'Team Standup', time: '10:00 AM', attendees: 8 },
        { id: 2, title: 'Project Review', time: '2:00 PM', attendees: 5 },
        { id: 3, title: 'Client Call', time: '4:00 PM', attendees: 3 }
      ]
    }
  });

  // Tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Prepare Monthly Financial Report',
      description: 'Compile financial data for Q1 2024',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-20',
      assignedTo: 'Finance Team',
      progress: 60
    },
    {
      id: 2,
      title: 'Update Employee Database',
      description: 'Add new employee records and update existing ones',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2024-01-22',
      assignedTo: 'HR Department',
      progress: 30
    },
    {
      id: 3,
      title: 'Organize Company Files',
      description: 'Sort and digitize physical documents',
      priority: 'low',
      status: 'pending',
      dueDate: '2024-01-25',
      assignedTo: 'Office Staff',
      progress: 0
    },
    {
      id: 4,
      title: 'Schedule Board Meeting',
      description: 'Coordinate with board members for quarterly meeting',
      priority: 'high',
      status: 'completed',
      dueDate: '2024-01-18',
      assignedTo: 'Executive Assistant',
      progress: 100
    },
    {
      id: 5,
      title: 'Process Vendor Invoices',
      description: 'Review and approve pending vendor payments',
      priority: 'medium',
      status: 'overdue',
      dueDate: '2024-01-15',
      assignedTo: 'Accounts Payable',
      progress: 80
    }
  ]);

  // Recent documents
  const [recentDocuments, setRecentDocuments] = useState([
    { id: 1, name: 'Q1-2024-Sales-Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', category: 'Reports' },
    { id: 2, name: 'Employee-Handbook-v2.docx', type: 'Word', size: '1.8 MB', modified: '5 hours ago', category: 'HR' },
    { id: 3, name: 'Client-Contract-ABC-Corp.pdf', type: 'PDF', size: '756 KB', modified: '1 day ago', category: 'Contracts' },
    { id: 4, name: 'Budget-Analysis-2024.xlsx', type: 'Excel', size: '3.2 MB', modified: '2 days ago', category: 'Finance' },
    { id: 5, name: 'Office-Policies-Updated.pdf', type: 'PDF', size: '1.1 MB', modified: '3 days ago', category: 'Policies' }
  ]);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'tasks', label: 'Tasks', icon: 'clipboard' },
    { key: 'documents', label: 'Documents', icon: 'folder' },
    { key: 'reports', label: 'Reports', icon: 'bar-chart-2' },
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
        tasks: {
          ...prevData.tasks,
          pending: 15 + Math.floor(Math.random() * 5),
          thisWeek: 8 + Math.floor(Math.random() * 3),
        },
        documents: {
          ...prevData.documents,
          recent: 12 + Math.floor(Math.random() * 8),
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

  const handleTaskComplete = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'completed', progress: 100 }
          : task
      )
    );
    
    setDashboardData(prevData => ({
      ...prevData,
      tasks: {
        ...prevData.tasks,
        pending: Math.max(0, prevData.tasks.pending - 1),
        completed: prevData.tasks.completed + 1
      }
    }));

    Alert.alert('Success', 'Task marked as completed!');
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      assignedTo: user?.fullname || 'Office Staff',
      progress: 0
    };

    setTasks(prevTasks => [task, ...prevTasks]);
    setDashboardData(prevData => ({
      ...prevData,
      tasks: {
        ...prevData.tasks,
        pending: prevData.tasks.pending + 1
      }
    }));

    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowTaskModal(false);
    Alert.alert('Success', 'New task created successfully!');
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: theme.colors.error,
      medium: theme.colors.warning,
      low: theme.colors.success,
    };
    return colors[priority] || theme.colors.textSecondary;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.colors.warning,
      'in-progress': theme.colors.primary,
      completed: theme.colors.success,
      overdue: theme.colors.error,
    };
    return colors[status] || theme.colors.textSecondary;
  };

  const getDocumentIcon = (type) => {
    const icons = {
      PDF: 'file-text',
      Word: 'file-text',
      Excel: 'file-text',
      Image: 'image',
    };
    return icons[type] || 'file';
  };

  const renderDashboard = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Office Dashboard</Text>
        <Text style={styles.welcomeSubtext}>Administrative overview and tasks</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon name="clipboard" size={28} color={theme.colors.warning} />
          <Text style={styles.statNumber}>{dashboardData.tasks.pending}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
          <Text style={styles.statTrend}>{dashboardData.tasks.overdue > 0 ? `${dashboardData.tasks.overdue} overdue` : 'On track'}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="folder" size={28} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{dashboardData.documents.total}</Text>
          <Text style={styles.statLabel}>Documents</Text>
          <Text style={styles.statTrend}>+{dashboardData.documents.recent} recent</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="bar-chart-2" size={28} color={theme.colors.success} />
          <Text style={styles.statNumber}>{dashboardData.reports.thisMonth}</Text>
          <Text style={styles.statLabel}>Reports Generated</Text>
          <Text style={styles.statTrend}>This month</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon name="calendar" size={28} color={theme.colors.error} />
          <Text style={styles.statNumber}>{dashboardData.meetings.today}</Text>
          <Text style={styles.statLabel}>Meetings Today</Text>
          <Text style={styles.statTrend}>{dashboardData.meetings.thisWeek} this week</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowTaskModal(true)}
          >
            <Icon name="plus-circle" size={24} color={theme.colors.success} />
            <Text style={styles.quickActionText}>New Task</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowDocumentModal(true)}
          >
            <Icon name="folder-plus" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Upload Document</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowReportModal(true)}
          >
            <Icon name="file-text" size={24} color={theme.colors.warning} />
            <Text style={styles.quickActionText}>Generate Report</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => Alert.alert('Calendar', 'Calendar integration coming soon')}
          >
            <Icon name="calendar" size={24} color={theme.colors.secondary} />
            <Text style={styles.quickActionText}>Schedule Meeting</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Today's Meetings */}
      <Card style={styles.meetingsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Today's Meetings</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.meetings.upcoming.map((meeting) => (
          <View key={meeting.id} style={styles.meetingItem}>
            <View style={styles.meetingTime}>
              <Text style={styles.meetingTimeText}>{meeting.time}</Text>
            </View>
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>{meeting.title}</Text>
              <Text style={styles.meetingAttendees}>{meeting.attendees} attendees</Text>
            </View>
            <TouchableOpacity style={styles.meetingAction}>
              <Icon name="video" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      {/* Recent Tasks */}
      <Card style={styles.tasksCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => setActiveTab('tasks')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {tasks.slice(0, 4).map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.taskMeta}>
                <Text style={styles.taskDue}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                <View style={[styles.taskStatus, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.taskStatusText}>{task.status.replace('-', ' ').toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Card>

      {/* Document Categories */}
      <Card style={styles.documentsCard}>
        <Text style={styles.sectionTitle}>Document Categories</Text>
        <View style={styles.categoriesGrid}>
          {dashboardData.documents.categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <Icon name={category.icon} size={24} color={theme.colors.primary} />
              <Text style={styles.categoryCount}>{category.count}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderTasks = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>Task Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowTaskModal(true)}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Task Stats */}
      <View style={styles.taskStatsContainer}>
        {dashboardData.tasks.byPriority.map((item, index) => (
          <View key={index} style={styles.taskStatItem}>
            <View style={[styles.taskStatDot, { backgroundColor: item.color }]} />
            <Text style={styles.taskStatPriority}>{item.priority}</Text>
            <Text style={styles.taskStatCount}>{item.count}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.tasksList}>
        {tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskCardHeader}>
              <View style={[styles.taskCardPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
              <View style={styles.taskCardInfo}>
                <Text style={styles.taskCardTitle}>{task.title}</Text>
                <Text style={styles.taskCardDescription}>{task.description}</Text>
                <View style={styles.taskCardMeta}>
                  <Text style={styles.taskCardDue}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                  <Text style={styles.taskCardAssigned}>Assigned to: {task.assignedTo}</Text>
                </View>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{task.progress}% Complete</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
              </View>
            </View>

            <View style={styles.taskCardActions}>
              <View style={[styles.taskCardStatus, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.taskCardStatusText}>{task.status.replace('-', ' ').toUpperCase()}</Text>
              </View>
              {task.status !== 'completed' && (
                <Button
                  title="Complete"
                  size="small"
                  onPress={() => handleTaskComplete(task.id)}
                  style={styles.completeButton}
                />
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>Document Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowDocumentModal(true)}
        >
          <Icon name="upload" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.documentsList}>
        <Text style={styles.listTitle}>Recent Documents ({recentDocuments.length})</Text>
        {recentDocuments.map((doc) => (
          <Card key={doc.id} style={styles.documentCard}>
            <View style={styles.documentCardContent}>
              <View style={styles.documentIcon}>
                <Icon 
                  name={getDocumentIcon(doc.type)} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <View style={styles.documentMeta}>
                  <Text style={styles.documentSize}>{doc.size}</Text>
                  <Text style={styles.documentType}>{doc.type}</Text>
                  <Text style={styles.documentModified}>{doc.modified}</Text>
                </View>
                <Text style={styles.documentCategory}>{doc.category}</Text>
              </View>
              <TouchableOpacity style={styles.documentAction}>
                <Icon name="download" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
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
      case 'tasks':
        return renderTasks();
      case 'documents':
        return renderDocuments();
      case 'reports':
        return (
          <View style={styles.placeholderContent}>
            <Icon name="bar-chart-2" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderTitle}>Reports</Text>
            <Text style={styles.placeholderText}>Report generation features coming soon</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Office Dashboard</Text>
            <Text style={styles.userName}>{user?.fullname || 'Office Employee'}</Text>
            <Text style={styles.department}>{user?.department || 'Office Administration'}</Text>
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

      {/* Add Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                <Icon name="x" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                  placeholder="Enter task title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                  placeholder="Enter task description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.prioritySelector}>
                  {['low', 'medium', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        newTask.priority === priority && styles.priorityOptionSelected,
                        { borderColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setNewTask({ ...newTask, priority })}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        newTask.priority === priority && { color: getPriorityColor(priority) }
                      ]}>
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTask.dueDate}
                  onChangeText={(text) => setNewTask({ ...newTask, dueDate: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowTaskModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="Create Task"
                onPress={handleAddTask}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        visible={showDocumentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
                <Icon name="x" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.placeholderModalContent}>
              <Icon name="upload" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.placeholderTitle}>Document Upload</Text>
              <Text style={styles.placeholderText}>File upload functionality coming soon</Text>
              <Button
                title="Close"
                onPress={() => setShowDocumentModal(false)}
                style={{ marginTop: 20 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Report</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="x" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.placeholderModalContent}>
              <Icon name="bar-chart-2" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.placeholderTitle}>Report Generation</Text>
              <Text style={styles.placeholderText}>Automated report generation coming soon</Text>
              <Button
                title="Close"
                onPress={() => setShowReportModal(false)}
                style={{ marginTop: 20 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  
  // Meetings
  meetingsCard: {},
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  meetingTime: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  meetingTimeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  meetingAttendees: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  meetingAction: {
    padding: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  
  // Tasks
  tasksCard: {},
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskPriority: {
    width: 4,
    height: 48,
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
  taskDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskDue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Documents
  documentsCard: {},
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Button Styles
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  buttonTextDisabled: {
    color: theme.colors.textSecondary,
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
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Task Tab Specific
  taskStatsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  taskStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  taskStatPriority: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  taskStatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskCardPriority: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  taskCardInfo: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  taskCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskCardMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  taskCardDue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  taskCardAssigned: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  taskCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  taskCardStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completeButton: {
    minWidth: 80,
  },
  
  // Documents Tab
  documentsList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  documentCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  documentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  documentType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  documentModified: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  documentCategory: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  documentAction: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  modalBody: {
    padding: 20,
    maxHeight: 300,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    marginLeft: 12,
    minWidth: 100,
  },
  
  // Form Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  
  // Placeholder Content
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderModalContent: {
    padding: 40,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
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

export default OfficeEmployeeScreen;