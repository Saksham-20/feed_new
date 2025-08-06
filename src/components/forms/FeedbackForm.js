// src/components/forms/FeedbackForm.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { theme } from '../../styles/theme';
import { useFeedback } from '../../context/FeedbackContext'; // FIXED PATH - moved up one level
import { validateRequired } from '../../utils/validation';

const FeedbackForm = ({ 
  onSubmit, 
  loading = false, 
  initialData = {},
  mode = 'create' // 'create' or 'reply'
}) => {
  const { createThread, sendMessage } = useFeedback();
  const [formData, setFormData] = useState({
    subject: initialData.subject || '',
    message: initialData.message || '',
    priority: initialData.priority || 'medium',
    category: initialData.category || 'general',
    attachments: initialData.attachments || [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = [
    { 
      key: 'low', 
      label: 'Low', 
      color: '#10B981', 
      icon: 'arrow-down',
      description: 'Non-urgent query'
    },
    { 
      key: 'medium', 
      label: 'Medium', 
      color: '#F59E0B', 
      icon: 'minus',
      description: 'Standard priority'
    },
    { 
      key: 'high', 
      label: 'High', 
      color: '#EF4444', 
      icon: 'arrow-up',
      description: 'Urgent attention needed'
    },
    { 
      key: 'urgent', 
      label: 'Urgent', 
      color: '#DC2626', 
      icon: 'alert-triangle',
      description: 'Critical issue'
    },
  ];

  const categories = [
    { 
      key: 'general', 
      label: 'General Inquiry', 
      icon: 'help-circle',
      description: 'General questions and support'
    },
    { 
      key: 'technical', 
      label: 'Technical Issue', 
      icon: 'settings',
      description: 'App bugs and technical problems'
    },
    { 
      key: 'billing', 
      label: 'Billing Question', // FIXED TYPO - removed "lasrc/components/forms/FeedbackForm.js"
      icon: 'credit-card',
      description: 'Payment and billing related'
    },
    { 
      key: 'feature', 
      label: 'Feature Request', 
      icon: 'plus-circle',
      description: 'Suggest new features'
    },
    { 
      key: 'complaint', 
      label: 'Complaint', 
      icon: 'alert-triangle',
      description: 'Service complaints and issues'
    },
    { 
      key: 'compliment', 
      label: 'Compliment', 
      icon: 'heart',
      description: 'Positive feedback and praise'
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!validateRequired(formData.message)) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = mode === 'create' 
        ? await createThread(formData)
        : await sendMessage(formData);
      
      if (onSubmit) {
        onSubmit(result);
      }
      
      Alert.alert(
        'Success',
        mode === 'create' 
          ? 'Feedback submitted successfully'
          : 'Reply sent successfully'
      );
      
      // Reset form after successful submission
      if (mode === 'create') {
        setFormData({
          subject: '',
          message: '',
          priority: 'medium',
          category: 'general',
          attachments: [],
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit feedback'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const renderPrioritySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Priority Level</Text>
      <View style={styles.priorityGrid}>
        {priorities.map(priority => (
          <TouchableOpacity
            key={priority.key}
            style={[
              styles.priorityOption,
              formData.priority === priority.key && styles.priorityOptionSelected,
              { borderColor: priority.color }
            ]}
            onPress={() => handleInputChange('priority', priority.key)}
          >
            <Icon 
              name={priority.icon} 
              size={20} 
              color={formData.priority === priority.key ? '#FFFFFF' : priority.color} 
            />
            <Text style={[
              styles.priorityLabel,
              formData.priority === priority.key && styles.priorityLabelSelected
            ]}>
              {priority.label}
            </Text>
            <Text style={[
              styles.priorityDescription,
              formData.priority === priority.key && styles.priorityDescriptionSelected
            ]}>
              {priority.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryOption,
              formData.category === category.key && styles.categoryOptionSelected
            ]}
            onPress={() => handleInputChange('category', category.key)}
          >
            <Icon 
              name={category.icon} 
              size={24} 
              color={formData.category === category.key ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.categoryLabel,
              formData.category === category.key && styles.categoryLabelSelected
            ]}>
              {category.label}
            </Text>
            <Text style={[
              styles.categoryDescription,
              formData.category === category.key && styles.categoryDescriptionSelected
            ]}>
              {category.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.formCard}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'create' ? 'Submit Feedback' : 'Reply to Thread'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'create' 
              ? 'Help us improve by sharing your thoughts and suggestions'
              : 'Continue the conversation'
            }
          </Text>
        </View>

        {mode === 'create' && (
          <Input
            label="Subject"
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
            placeholder="Brief description of your feedback"
            error={errors.subject}
            required
          />
        )}

        <Input
          label="Message"
          value={formData.message}
          onChangeText={(value) => handleInputChange('message', value)}
          placeholder="Describe your feedback in detail..."
          multiline
          numberOfLines={6}
          error={errors.message}
          required
          style={styles.messageInput}
        />

        {mode === 'create' && (
          <>
            {renderPrioritySelector()}
            {renderCategorySelector()}
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={mode === 'create' ? 'Submit Feedback' : 'Send Reply'}
            onPress={handleSubmit}
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
            style={styles.submitButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formCard: {
    margin: 16,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sectionContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priorityOption: {
    width: '48%',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  priorityOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  priorityLabelSelected: {
    color: '#FFFFFF',
  },
  priorityDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  priorityDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryOption: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
  },
  categoryDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  categoryDescriptionSelected: {
    color: theme.colors.primary,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 32,
  },
  submitButton: {
    height: 48,
  },
});

export default FeedbackForm;  