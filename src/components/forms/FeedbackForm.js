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
import { useFeedback } from '../context/FeedbackContext'; // FIXED PATH
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
      label: 'Billing Question', 
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
        : await onSubmit(formData);
        
      if (result.success) {
        Alert.alert('Success', 'Feedback submitted successfully');
        // Reset form if creating new thread
        if (mode === 'create') {
          setFormData({
            subject: '',
            message: '',
            priority: 'medium',
            category: 'general',
            attachments: [],
          });
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const renderPrioritySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Priority Level</Text>
      <View style={styles.optionsGrid}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.key}
            style={[
              styles.optionCard,
              formData.priority === priority.key && styles.selectedOption
            ]}
            onPress={() => updateFormData('priority', priority.key)}
          >
            <View style={[styles.optionIcon, { backgroundColor: priority.color + '20' }]}>
              <Icon name={priority.icon} size={20} color={priority.color} />
            </View>
            <Text style={styles.optionLabel}>{priority.label}</Text>
            <Text style={styles.optionDescription}>{priority.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.optionsGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.optionCard,
              formData.category === category.key && styles.selectedOption
            ]}
            onPress={() => updateFormData('category', category.key)}
          >
            <View style={styles.optionIcon}>
              <Icon name={category.icon} size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionLabel}>{category.label}</Text>
            <Text style={styles.optionDescription}>{category.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>
          {mode === 'create' ? 'Submit Feedback' : 'Reply to Feedback'}
        </Text>

        {mode === 'create' && (
          <Input
            label="Subject"
            value={formData.subject}
            onChangeText={(value) => updateFormData('subject', value)}
            placeholder="Brief description of your feedback"
            error={errors.subject}
            required
          />
        )}

        <Input
          label="Message"
          value={formData.message}
          onChangeText={(value) => updateFormData('message', value)}
          placeholder="Please provide detailed information about your feedback"
          multiline
          numberOfLines={6}
          error={errors.message}
          required
        />

        {mode === 'create' && renderPrioritySelector()}
        {mode === 'create' && renderCategorySelector()}

        <Button
          title={mode === 'create' ? 'Submit Feedback' : 'Send Reply'}
          onPress={handleSubmit}
          loading={isSubmitting || loading}
          style={styles.submitButton}
        />
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
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: theme.colors.primary + '20',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default FeedbackForm;