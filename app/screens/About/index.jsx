import React, { useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Link, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("about-us"),
    });
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/farhannetLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Farhanict</Text>
        <Text style={styles.description}>
          At Farhanict, we are dedicated to delivering high-speed, reliable, and
          secure internet services to our customers. Our mission is to empower
          communities with cutting-edge technology and exceptional customer
          support.
        </Text>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Farhanict?</Text>
          <View style={styles.featureCard}>
            <Icon name="speed" size={30} color="#4A90E2" />
            <Text style={styles.featureText}>Ultra-Fast Internet Speeds</Text>
          </View>
          <View style={styles.featureCard}>
            <Icon name="security" size={30} color="#4A90E2" />
            <Text style={styles.featureText}>Advanced Network Security</Text>
          </View>
          <View style={styles.featureCard}>
            <Icon name="support-agent" size={30} color="#4A90E2" />
            <Text style={styles.featureText}>24/7 Expert Support</Text>
          </View>
        </View>
        <Link href={{ pathname: "/screens/Contact" }} asChild>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.buttonText}>Get in Touch</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 90,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50", // Dark blue for contrast
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4A90E2", // Primary blue
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555555", // Soft gray for readability
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresSection: {
    width: "100%",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A90E2", // Primary blue
    marginBottom: 20,
    textAlign: "center",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White background for cards
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featureText: {
    fontSize: 16,
    color: "#2C3E50", // Dark blue for text
    marginLeft: 15,
    fontWeight: "500",
  },
  contactButton: {
    backgroundColor: "#4A90E2", // Primary blue
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
  },
});
