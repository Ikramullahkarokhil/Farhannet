"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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

const { width } = Dimensions.get("window");
const isTablet = width > 600;

const Login = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { login } = apiStore();

  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        username: Yup.string().required(t("username-is-required")),
        password: Yup.string()
          .required(t("password-is-required"))
          .min(8, t("password-min-length")),
      }),
    [t]
  );

  const handleChange = useCallback(
    (field) => (text) => {
      setValues((prev) => ({ ...prev, [field]: text }));
      setErrors((prev) => ({ ...prev, [field]: null }));
      setStatus(null);
    },
    []
  );

  const validateForm = useCallback(async () => {
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
  }, [validationSchema, values]);

  // Check form validity whenever values change
  useEffect(() => {
    const checkValidity = async () => {
      const valid = await validateForm();
      setIsFormValid(valid);
    };
    checkValidity();
  }, [values, validateForm]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setStatus(null);

    // Mark all fields as touched when submitting
    setTouched({ username: true, password: true });

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
          router.replace("/(drawer)");
        }
      } catch (error) {
        console.error("Login error:", error);
        setStatus({ error: error.message || t("login-failed") });
      }
    }
    setIsSubmitting(false);
  }, [validateForm, values, login, router, t]);

  const handleSkip = useCallback(() => {
    router.replace("/(drawer)");
  }, [router]);

  const getInputStyle = useCallback(
    (field) => [styles.input, focusedField === field && styles.inputFocused],
    [focusedField]
  );

  // Get text direction based on language
  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  // Apply RTL styles when needed
  const containerStyle = useMemo(
    () => [styles.container, isRTL && styles.rtlContainer],
    [isRTL]
  );

  const textStyle = useMemo(
    () => [styles.inputLabel, isRTL && styles.rtlText],
    [isRTL]
  );

  return (
    <View style={[styles.container, { flex: 1 }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.innerContainer,
              { maxWidth: isTablet ? 500 : 400, width: "100%" },
              isRTL && styles.rtlInnerContainer,
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
              <Text style={textStyle}>{t("username")}</Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "username" && styles.inputWrapperFocused,
                  touched.username &&
                    errors.username &&
                    styles.inputWrapperError,
                  isRTL && styles.rtlIconInputWrapper,
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
                  style={[styles.icon, isRTL && styles.rtlIcon]}
                />
                <TextInput
                  style={[getInputStyle("username"), isRTL && styles.rtlInput]}
                  placeholder={t("enter-username")}
                  placeholderTextColor={colors.textMuted}
                  value={values.username}
                  onChangeText={handleChange("username")}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => {
                    setFocusedField(null);
                    setTouched((prev) => ({ ...prev, username: true }));
                  }}
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
              <View style={styles.errorContainer}>
                {touched.username && errors.username && (
                  <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                    {errors.username}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={textStyle}>{t("password")}</Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "password" && styles.inputWrapperFocused,
                  touched.password &&
                    errors.password &&
                    styles.inputWrapperError,
                  isRTL && styles.rtlIconInputWrapper,
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
                  style={[styles.icon, isRTL && styles.rtlIcon]}
                />
                <TextInput
                  style={[getInputStyle("password"), isRTL && styles.rtlInput]}
                  placeholder={t("enter-password")}
                  placeholderTextColor={colors.textMuted}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => {
                    setFocusedField(null);
                    setTouched((prev) => ({ ...prev, password: true }));
                  }}
                  textAlign={isRTL ? "right" : "left"}
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
                {touched.password && errors.password && (
                  <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                    {errors.password}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statusContainer}>
              {status && status.error && (
                <Text style={[styles.errorText, isRTL && styles.rtlText]}>
                  {status.error}
                </Text>
              )}
              {status && status.success && (
                <Text style={[styles.successText, isRTL && styles.rtlText]}>
                  {status.success}
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
              disabled={isSubmitting || !isFormValid}
              buttonColor={isFormValid ? colors.primary : colors.textMuted}
              labelStyle={[styles.buttonLabel, isRTL && styles.rtlText]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                t("login")
              )}
            </Button>
          </View>
          <Button
            mode="outlined"
            onPress={handleSkip}
            textColor={colors.text}
            labelStyle={[styles.buttonLabel, isRTL && styles.rtlText]}
            style={[
              styles.paperButton,
              { borderColor: colors.primary, width: "85%" },
            ]}
          >
            {t("skip")}
          </Button>
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
  rtlContainer: {
    flexDirection: "row-reverse",
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
  rtlInnerContainer: {
    alignItems: "flex-end",
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
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
    width: "100%",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
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
  rtlIconInputWrapper: {
    flexDirection: "row-reverse",
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
  rtlIcon: {
    marginRight: 0,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: "100%",
  },
  rtlInput: {
    textAlign: "right",
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
