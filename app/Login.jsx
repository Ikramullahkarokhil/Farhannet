// Login.js
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
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

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setBackgroundColorAsync("#1E90FF");
  }, []);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("username-is-required")),
    password: Yup.string().required(t("password-is-required")),
  });

  const handleLogin = async (values, { setSubmitting, setStatus }) => {
    try {
      const sessionData = {
        username: values.username,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
      router.replace("/(drawer)");
    } catch (error) {
      console.error("Error saving session:", error);
      setStatus({ error: "An error occurred during login" });
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
        <View style={styles.innerContainer}>
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
                  <TextInput
                    style={styles.input}
                    placeholder={t("username")}
                    placeholderTextColor="rgba(255,255,255,0.8)"
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    autoCapitalize="none"
                  />
                  {touched.username && errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
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
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>
                {status && status.error && (
                  <Text style={styles.errorText}>{status.error}</Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.paperButton}
                  contentStyle={styles.buttonContent}
                  disabled={isSubmitting}
                  buttonColor="#1E90FF"
                >
                  {t("login")}
                </Button>
                {/* <Button
                  mode="text"
                  onPress={() => {
                    // Placeholder for forgot password action
                  }}
                  labelStyle={styles.forgotPassword}
                >
                  {t("forgot-password")}
                </Button> */}
              </>
            )}
          </Formik>
        </View>
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
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    padding: 15,
    borderRadius: 25,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
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
