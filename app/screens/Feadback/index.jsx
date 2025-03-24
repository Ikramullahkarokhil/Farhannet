import React, {
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  memo,
  useEffect,
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";
import apiStore from "../../../components/api/apiStore";
import { Image } from "react-native";

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return colors.secondary;
    case "Process":
      return colors.secondary2;
    case "Complete":
      return colors.accent;
    case "Cancelled":
      return colors.danger;
    case "Posting":
      return colors.primary;
    case "Failed":
      return colors.danger;
    default:
      return colors.primary;
  }
};

// Message component: memoized for performance
const Message = memo(({ item, index, messages }) => {
  const isSequential =
    index > 0 &&
    messages[index - 1].isUser === item.isUser &&
    !item.isComplaint;

  const statusColor = item.status
    ? getStatusColor(item.status)
    : colors.primary;

  const isFirstComplaintMessage =
    item.isComplaint &&
    item.isUser &&
    (index === 0 || messages[index - 1]?.date !== item.date);

  return (
    <>
      {isFirstComplaintMessage && (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      )}
      <View style={styles.messageWrapper}>
        {!item.isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../assets/images/farhannetLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
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
            !item.isUser && { backgroundColor: statusColor, borderWidth: 0 },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.ispText,
              !item.isUser && item.status && item.status !== "Pending"
                ? { color: "white" }
                : {},
            ]}
          >
            {item.text}
          </Text>

          {item.status === "Posting" && !item.hidePostingIndicator && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <View style={styles.postingContainer}>
                <ActivityIndicator size="small" color={statusColor} />
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor, marginLeft: 5 },
                  ]}
                >
                  Posting...
                </Text>
              </View>
            </View>
          )}

          <Text
            style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.ispTimestamp,
              !item.isUser && item.status && item.status !== "Pending"
                ? { color: "white" }
                : {},
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    </>
  );
});

// Simplified empty state component
const EmptyState = memo(({ t }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={60}
          color={colors.primary}
        />
      </View>
      <Text style={styles.emptyText}>{t("no-feedback-yet")}</Text>
      <Text style={styles.emptySubText}>{t("share-your-thoughts-below")}</Text>
    </View>
  );
});

const Index = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [messages, setMessages] = useState([]);
  const [tempMessages, setTempMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const { complaints, addComplain, user, fetchCustomerComplaints } = apiStore();

  // For initial rendering at the bottom
  const [isReady, setIsReady] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // For floating date header
  const [currentDate, setCurrentDate] = useState("");
  const [showDateHeader, setShowDateHeader] = useState(false);
  const dateHeaderOpacity = useRef(new Animated.Value(0)).current;
  const dateHeaderY = useRef(new Animated.Value(-40)).current;

  // Show/hide date header with animation
  const animateDateHeader = (show) => {
    Animated.parallel([
      Animated.timing(dateHeaderOpacity, {
        toValue: show ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dateHeaderY, {
        toValue: show ? 0 : -40,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setShowDateHeader(show);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = event.nativeEvent.layoutMeasurement.height;
    const totalContentHeight = event.nativeEvent.contentSize.height;
    const distanceFromBottom = totalContentHeight - height - offsetY;

    // Show the scroll-to-bottom button if user is more than 500 pixels away
    setShowScrollToBottom(distanceFromBottom > 500);

    // Find the date of the message currently at the top of the visible area
    if (combinedMessages.length > 0 && flatListRef.current) {
      const visibleIndex = Math.floor(offsetY / 80); // Approximate height of a message
      const safeIndex = Math.min(
        Math.max(0, visibleIndex),
        combinedMessages.length - 1
      );

      const visibleDate = combinedMessages[safeIndex]?.date;

      if (visibleDate && visibleDate !== currentDate) {
        setCurrentDate(visibleDate);
        if (!showDateHeader) {
          animateDateHeader(true);
        }
      }
    }

    // Hide date header after 2 seconds of no scrolling
    if (showDateHeader) {
      clearTimeout(dateHeaderTimeout.current);
      dateHeaderTimeout.current = setTimeout(() => {
        animateDateHeader(false);
      }, 2000);
    }
  };

  // Timeout ref for hiding date header
  const dateHeaderTimeout = useRef(null);

  useEffect(() => {
    const refreshPage = async () => {
      await fetchCustomerComplaints(user.id);
    };
    refreshPage();

    // Clear timeout on unmount
    return () => {
      if (dateHeaderTimeout.current) {
        clearTimeout(dateHeaderTimeout.current);
      }
    };
  }, [fetchCustomerComplaints, user.id]);

  const getStatusMessage = useCallback(
    (status) => {
      switch (status) {
        case "Pending":
          return t(
            "Your complaint has been received and is waiting for review by our team."
          );
        case "Process":
          return t(
            "We're currently working on your complaint. Our team is investigating the issue."
          );
        case "Complete":
          return t(
            "Your complaint has been resolved. Thank you for your patience."
          );
        case "Cancelled":
          return t(
            "This complaint has been canceled. Please contact support if you need further assistance."
          );
        case "Posting":
          return t("We're sending your feedback to our team...");
        case "Failed":
          return t("Failed to send your feedback. Please try again later.");
        default:
          return t(
            "We've received your feedback and will get back to you soon."
          );
      }
    },
    [t]
  );

  useEffect(() => {
    if (!complaints || !complaints.length) return;

    const complaintMessages = complaints.map((complaint) => ({
      id: `complaint-${complaint.id}`,
      text: complaint.complain,
      isUser: true,
      timestamp: new Date(complaint.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(complaint.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: complaint.status,
      originalId: complaint.id,
      isComplaint: true,
      createdAt: new Date(complaint.created_at).getTime(),
    }));

    const responseMessages = complaints.map((complaint) => ({
      id: `response-${complaint.id}`,
      text: getStatusMessage(complaint.status),
      isUser: false,
      timestamp: new Date(complaint.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(complaint.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: complaint.status,
      originalId: complaint.id,
      isComplaint: true,
      createdAt: new Date(complaint.created_at).getTime() + 1,
    }));

    const allMessages = [];
    for (let i = 0; i < complaintMessages.length; i++) {
      allMessages.push(complaintMessages[i], responseMessages[i]);
    }

    allMessages.sort((a, b) => a.createdAt - b.createdAt);

    const replacedTempIds = new Set(
      allMessages
        .filter((msg) => msg.originalId)
        .map((msg) => msg.originalId.toString())
    );

    setMessages(allMessages);
    setTempMessages((prev) =>
      prev.filter(
        (msg) => !msg.tempId || !replacedTempIds.has(msg.tempId.toString())
      )
    );

    // Set initial date if we have messages
    if (allMessages.length > 0) {
      setCurrentDate(allMessages[allMessages.length - 1].date);
    }

    // Mark data as ready
    setIsReady(true);
  }, [complaints, getStatusMessage]);

  const combinedMessages = useMemo(() => {
    const sortedTempMessages = [...tempMessages].sort(
      (a, b) => a.createdAt - b.createdAt
    );
    return [...messages, ...sortedTempMessages];
  }, [messages, tempMessages]);

  // Memoize scrollToBottom for stability
  const scrollToBottom = useCallback(
    (animated = true) => {
      if (flatListRef.current && contentHeight > listHeight) {
        const offset = contentHeight - listHeight;
        flatListRef.current.scrollToOffset({ offset, animated });
      }
    },
    [contentHeight, listHeight]
  );

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (combinedMessages.length > 0) {
      scrollToBottom(false);
    }
  }, [combinedMessages.length, scrollToBottom]);

  // Handle new message submission
  const submitFeedback = useCallback(async () => {
    if (feedback.trim() === "" || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = Date.now().toString();
    const currentTime = new Date();
    const currentTimeMs = currentTime.getTime();

    const newFeedback = {
      id: `user-${tempId}`,
      text: feedback,
      isUser: true,
      timestamp: currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: currentTime.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "Posting",
      tempId: tempId,
      isComplaint: true,
      createdAt: currentTimeMs,
    };

    const tempResponse = {
      id: `response-${tempId}`,
      text: getStatusMessage("Posting"),
      isUser: false,
      timestamp: currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: currentTime.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "Posting",
      tempId: tempId,
      isComplaint: true,
      createdAt: currentTimeMs + 1,
    };

    // Append new feedback and response to temporary messages
    setTempMessages((prev) => [...prev, newFeedback, tempResponse]);
    setFeedback("");

    // Scroll to bottom after adding new messages
    setTimeout(() => scrollToBottom(true), 100);

    try {
      const response = await addComplain({
        customerId: user.id,
        complain: newFeedback.text,
      });

      if (response && response.status === "success") {
        setTempMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...msg,
                  status: "Pending",
                  tempId: null,
                  text: msg.isUser ? msg.text : getStatusMessage("Pending"),
                }
              : msg
          )
        );
      }
    } catch (error) {
      setTempMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId
            ? {
                ...msg,
                status: "Failed",
                text: msg.isUser
                  ? msg.text
                  : t("Failed to send your feedback. Please try again later."),
              }
            : msg
        )
      );
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    feedback,
    isSubmitting,
    getStatusMessage,
    addComplain,
    user.id,
    t,
    scrollToBottom,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("feedback"),
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.text,
      },
    });
  }, [navigation, t]);

  const renderMessage = useCallback(
    ({ item, index }) => (
      <Message item={item} index={index} messages={combinedMessages} />
    ),
    [combinedMessages]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerComplaints(user.id);
    setRefreshing(false);
  };

  // This is the key to starting at the bottom - we use initialScrollIndex
  const getItemLayout = useCallback(
    (data, index) => ({
      length: 80, // approximate height of a message
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {combinedMessages.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <>
            {/* Floating date header */}
            <Animated.View
              style={[
                styles.floatingDateHeader,
                {
                  opacity: dateHeaderOpacity,
                  transform: [{ translateY: dateHeaderY }],
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.floatingDateText}>{currentDate}</Text>
            </Animated.View>

            {isReady && (
              <FlatList
                ref={flatListRef}
                data={combinedMessages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={Platform.OS === "android"}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                // This is crucial - we initialize the list at the end
                initialScrollIndex={
                  initialRender ? combinedMessages.length - 1 : undefined
                }
                onScrollToIndexFailed={(info) => {
                  // If scrolling to index fails, try again with a delay
                  setTimeout(() => {
                    if (flatListRef.current && combinedMessages.length > 0) {
                      flatListRef.current.scrollToIndex({
                        index: combinedMessages.length - 1,
                        animated: false,
                      });
                    }
                  }, 100);
                }}
                onContentSizeChange={(w, h) => {
                  setContentHeight(h);
                  // After first render, we don't need initialScrollIndex anymore
                  if (initialRender) {
                    setInitialRender(false);
                  }
                }}
                onLayout={(event) => {
                  setListHeight(event.nativeEvent.layout.height);
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
              />
            )}

            {combinedMessages.length > 10 && showScrollToBottom && (
              <Pressable
                style={styles.scrollToBottomButton}
                onPress={() => scrollToBottom()}
              >
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={colors.background}
                />
              </Pressable>
            )}
          </>
        )}
      </KeyboardAvoidingView>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          multiline
          placeholder={t("share-your-feedback")}
          placeholderTextColor={colors.textMuted}
          value={feedback}
          onChangeText={setFeedback}
          maxLength={500}
          editable={!isSubmitting}
          accessibilityLabel="Feedback input"
        />
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (!feedback.trim() || isSubmitting) && styles.submitButtonDisabled,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={submitFeedback}
          disabled={!feedback.trim() || isSubmitting}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
          accessibilityLabel="Send feedback"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Ionicons name="send" size={20} color={colors.background} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  logo: {
    height: 35,
    width: 35,
    borderRadius: 50,
    backgroundColor: colors.secondary,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: `${colors.secondary}90`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  // Floating date header styles
  floatingDateHeader: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: `${colors.primary}E6`,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.background,
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
    backgroundColor: `${colors.primary}19`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
    marginLeft: "auto",
  },
  ispBubble: {
    backgroundColor: colors.secondary,
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
    borderWidth: 2,
    shadowColor: colors.text,
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
    marginLeft: 40,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: colors.background,
  },
  ispText: {
    color: colors.text,
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
    color: `${colors.text}80`,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  postingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollToBottomButton: {
    position: "absolute",
    right: 16,
    bottom: 110,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.background,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "ios" ? 30 : 40,
  },
  input: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    maxHeight: 120,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: `${colors.primary}66`,
    shadowOpacity: 0,
  },
  submitButtonPressed: {
    backgroundColor: `${colors.primary}E6`,
    transform: [{ scale: 0.97 }],
  },
});
