import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

const Index = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Feadback",
    });
  }, [navigation]);

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
  };

  const submitFeedback = () => {
    if (feedback.trim() === "" || rating === 0) {
      alert("Please provide feedback and select a rating.");
      return;
    }
    // Handle feedback submission (e.g., send to an API)
    console.log("Feedback:", feedback);
    console.log("Rating:", rating);
    alert("Thank you for your feedback!");
    setFeedback("");
    setRating(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Feedback</Text>
      <Text style={styles.subHeader}>We value your opinion!</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>Rate your experience:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={32}
                color={star <= rating ? "#FFD700" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.label}>Your Feedback:</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Tell us about your experience..."
          placeholderTextColor="#999"
          value={feedback}
          onChangeText={setFeedback}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "black",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 0.5,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6a11cb",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
