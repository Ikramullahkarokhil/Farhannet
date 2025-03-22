"use client";

import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Yup from "yup";
import { Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import apiStore from "../components/api/apiStore";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../components/theme";

// Import Reanimated 3 hooks
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";

// Detect screen width for responsiveness
const { width } = Dimensions.get("window");
const isTablet = width > 600;

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = apiStore();

  // Reanimated shared values for fade and slide
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  // Define an animated style that combines the shared values
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Animate opacity and slide-in when component mounts
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t("username-is-required")),
    password: Yup.string()
      .required(t("password-is-required"))
      .min(8, t("password-min-length")),
  });

  const handleChange = (field) => (text) => {
    setValues({ ...values, [field]: text });
    setErrors({ ...errors, [field]: null }); // Clear error when typing
    setStatus(null); // Clear status messages when typing
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};
        err.inner.forEach((error) => {
          errorMessages[error.path] = error.message;
        });
        setErrors(errorMessages);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus(null);

    const isValid = await validateForm();

    if (isValid) {
      try {
        const response = await login(values.username, values.password);

        const sessionData = {
          username: values.username,
          timestamp: Date.now(),
        };

        if (response.status === "success") {
          await AsyncStorage.setItem(
            "userSession",
            JSON.stringify(sessionData)
          );

          // Show success message briefly before navigating
          setStatus({ success: response.message || t("login-successful") });

          setTimeout(() => {
            router.replace("/(drawer)");
          }, 500);
        }
      } catch (error) {
        console.error("Login error:", error);
        setStatus({
          error: error.message || t("login-failed"),
        });

        // Shake animation for error using withSequence
        translateY.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }
    setIsSubmitting(false);
  };

  const getInputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.innerContainer,
              animatedStyle,
              { maxWidth: isTablet ? 500 : 400 },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/farhannetLogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>{t("signin-to-continue")}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("username")}</Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "username" && styles.inputWrapperFocused,
                  errors.username && styles.inputWrapperError,
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={24}
                  color={
                    focusedField === "username"
                      ? colors.primary
                      : colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={getInputStyle("username")}
                  placeholder={t("enter-username")}
                  placeholderTextColor={colors.textMuted}
                  value={values.username}
                  onChangeText={handleChange("username")}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <View style={styles.errorContainer}>
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("password")}</Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "password" && styles.inputWrapperFocused,
                  errors.password && styles.inputWrapperError,
                ]}
              >
                <MaterialIcons
                  name="lock"
                  size={24}
                  color={
                    focusedField === "password"
                      ? colors.primary
                      : colors.textMuted
                  }
                  style={styles.icon}
                />
                <TextInput
                  style={getInputStyle("password")}
                  placeholder={t("enter-password")}
                  placeholderTextColor={colors.textMuted}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.visibilityToggle}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.errorContainer}>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            </View>

            <View style={styles.statusContainer}>
              {status && status.error && (
                <Text style={styles.errorText}>{status.error}</Text>
              )}
              {status && status.success && (
                <Text style={styles.successText}>{status.success}</Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
              disabled={isSubmitting}
              buttonColor={colors.primary}
              labelStyle={styles.buttonLabel}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                t("login")
              )}
            </Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  innerContainer: {
    width: "100%",
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  iconInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.secondary}80`,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: "100%",
  },
  inputFocused: {
    color: colors.primary,
  },
  visibilityToggle: {
    padding: 8,
  },
  errorContainer: {
    minHeight: 10,
    justifyContent: "center",
    paddingLeft: 5,
    marginTop: 4,
  },
  statusContainer: {
    minHeight: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    color: colors.accent,
    fontSize: 14,
    textAlign: "center",
  },
  paperButton: {
    borderRadius: 12,
    width: "100%",
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default Login;
