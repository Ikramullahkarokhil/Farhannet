import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useLayoutEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  const [feedback, setFeedback] = useState("");
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("feedback"),
      headerStyle: {
        backgroundColor: "#f8f9fa",
      },
      headerTitleStyle: {
        fontWeight: "bold",
      },
    });
  }, [navigation]);

  const submitFeedback = () => {
    if (feedback.trim() === "") {
      alert(t("please-provide-feedback"));
      return;
    }

    // Add user feedback to messages
    const newFeedback = {
      id: Date.now().toString(), // FlatList requires string IDs
      text: feedback,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Simulate ISP response (replace with actual API call if needed)
    const ispResponse = {
      id: (Date.now() + 1).toString(), // Ensure unique string ID
      text: "Thank you for your feedback! We're reviewing your input.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, newFeedback, ispResponse];
    setMessages(updatedMessages);
    setFeedback("");

    // Scroll to the latest message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.ispBubble,
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
  );

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("no-feedback-yet")}</Text>
            <Text style={styles.emptySubText}>
              {t("share-your-thoughts-below")}
            </Text>
          </View>
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
          placeholderTextColor="#999"
          value={feedback}
          onChangeText={setFeedback}
          maxLength={500} // Optional: limit input length
        />
        <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100, // Space for sticky input
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  ispBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageText: {
    fontSize: 15,
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
    color: "rgba(51, 51, 51, 0.7)",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 5,
    position: "absolute",
    bottom: 0,
    paddingBottom: 40,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 0.3,
    marginRight: 5,
    maxHeight: 100, // Prevent input from growing too large
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
