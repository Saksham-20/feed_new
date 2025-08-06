// src/components/business/FeedbackThread.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Card from '../common/Card';
import Button from '../common/Button';
import { theme } from '../../styles/theme';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import { useFeedback } from '../context/FeedbackContext'; // FIXED PATH

const FeedbackThread = ({ threadId, onClose }) => {
  const { messages, loading, sendMessage, fetchMessages } = useFeedback();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const threadMessages = messages[threadId] || [];

  useEffect(() => {
    if (threadId) {
      fetchMessages(threadId);
    }
  }, [threadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const result = await sendMessage(threadId, newMessage.trim());
      if (result.success) {
        setNewMessage('');
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender_type === 'user' ? styles.userMessage : styles.adminMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender_type === 'user' ? styles.userBubble : styles.adminBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender_type === 'user' ? styles.userText : styles.adminText
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          item.sender_type === 'user' ? styles.userTime : styles.adminTime
        ]}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Feedback Thread</Text>
      </View>

      <FlatList
        data={threadMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          style={styles.textInput}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
        >
          <Icon 
            name={sending ? "clock" : "send"} 
            size={20} 
            color={(!newMessage.trim() || sending) ? theme.colors.textSecondary : theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  adminBubble: {
    backgroundColor: theme.colors.card,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: theme.colors.white,
  },
  adminText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: theme.colors.white + '80',
  },
  adminTime: {
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default FeedbackThread;