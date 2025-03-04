import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("feedback"),
      headerStyle: {
        backgroundColor: "#ffffff",
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 18,
        color: "#333333",
      },
      headerShadowVisible: false,
    });
  }, [navigation, t]); // Added t as a dependency

  useEffect(() => {
    // Fade in animation for empty state
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // Added fadeAnim as a dependency

  const submitFeedback = () => {
    if (feedback.trim() === "") {
      alert(t("please-provide-feedback"));
      return;
    }

    // Add user feedback to messages
    const newFeedback = {
      id: Date.now().toString(),
      text: feedback,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Simulate ISP response (replace with actual API call if needed)
    const ispResponse = {
      id: (Date.now() + 1).toString(),
      text: "Thank you for your feedback! We're reviewing your input.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, newFeedback, ispResponse];
    setMessages(updatedMessages);
    setFeedback("");

    // Scroll to the latest message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }) => {
    // Check if this message is part of a sequence from the same sender
    const isSequential =
      index > 0 && messages[index - 1].isUser === item.isUser;

    return (
      <View style={styles.messageWrapper}>
        {!item.isUser && !isSequential && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>ISP</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.ispBubble,
            isSequential
              ? item.isUser
                ? styles.sequentialUserBubble
                : styles.sequentialIspBubble
              : {},
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.ispText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.ispTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={60}
          color="#007AFF"
        />
      </View>
      <Text style={styles.emptyText}>{t("no-feedback-yet")}</Text>
      <Text style={styles.emptySubText}>{t("share-your-thoughts-below")}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          placeholder={t("share-your-feedback")}
          placeholderTextColor="#9CA3AF"
          value={feedback}
          onChangeText={setFeedback}
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !feedback.trim() && styles.submitButtonDisabled,
          ]}
          onPress={submitFeedback}
          disabled={!feedback.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    color: "#333333",
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 2,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
    marginLeft: "auto",
  },
  ispBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sequentialUserBubble: {
    borderTopRightRadius: 20,
  },
  sequentialIspBubble: {
    borderTopLeftRadius: 20,
    marginLeft: 40, // Space for avatar
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  ispText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  ispTimestamp: {
    color: "rgba(51, 51, 51, 0.5)",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: Platform.OS === "ios" ? 36 : 40,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    maxHeight: 120,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#A1C6F7",
    shadowOpacity: 0,
  },
});
