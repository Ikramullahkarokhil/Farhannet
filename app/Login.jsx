import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { setBackgroundColorAsync } from "expo-navigation-bar";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextInput } from "react-native";
import { Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import apiStore from "../components/api/apiStore";
import { MaterialIcons } from "@expo/vector-icons";

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = apiStore();
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation

  useEffect(() => {
    setBackgroundColorAsync("#1E90FF");
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("username-is-required")),
    password: Yup.string()
      .required(t("password-is-required"))
      .min(4, "Username must be at least 4 characters")
      .min(8, "Password must be at least 4 characters"),
  });

  const handleLogin = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await login(values.username, values.password);
      const sessionData = {
        username: values.username,
        timestamp: Date.now(),
      };
      if (response.status === "success") {
        await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
        router.replace("/(drawer)");
        setStatus({ success: response.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      setStatus({ error: error.message });
    }
    setSubmitting(false);
  };

  return (
    <LinearGradient
      colors={["#FFA500", "#1E90FF"]}
      style={styles.container}
      start={[0, 0]}
      end={[1, 1]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{t("welcome")}</Text>
          <Text style={styles.subtitle}>{t("signin-to-continue")}</Text>
          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              status,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.iconInputWrapper}>
                    <MaterialIcons
                      name="person"
                      size={24}
                      color="rgba(255,255,255,0.8)"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("username")}
                      placeholderTextColor="rgba(255,255,255,0.8)"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      autoCapitalize="none"
                    />
                  </View>
                  {touched.username && errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.iconInputWrapper}>
                    <MaterialIcons
                      name="lock"
                      size={24}
                      color="rgba(255,255,255,0.8)"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("password")}
                      placeholderTextColor="rgba(255,255,255,0.8)"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>
                {status && status.error && (
                  <Text style={styles.errorText}>{status.error}</Text>
                )}
                {status && status.success && (
                  <Text style={styles.successText}>{status.success}</Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.paperButton}
                  contentStyle={styles.buttonContent}
                  disabled={isSubmitting}
                  buttonColor="#1E90FF"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    t("login")
                  )}
                </Button>
              </>
            )}
          </Formik>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  iconInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 15,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
  },
  successText: {
    color: "#4BB543",
    fontSize: 14,
    marginTop: 5,
  },
  paperButton: {
    marginTop: 10,
    borderRadius: 25,
    width: "100%",
  },
  buttonContent: {
    paddingVertical: 5,
  },
  forgotPassword: {
    color: "#fff",
    fontSize: 14,
    marginTop: 20,
    textDecorationLine: "underline",
  },
});

export default Login;
