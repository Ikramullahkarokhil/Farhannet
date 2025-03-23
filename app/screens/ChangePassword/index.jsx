import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as yup from "yup";
import { Button } from "react-native-paper";
import colors from "../../../components/theme";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import apiStore from "../../../components/api/apiStore";

// Detect screen width for responsiveness
const { width } = Dimensions.get("window");
const isTablet = width > 600;

const passwordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { changePassword, user } = apiStore();

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: t("change-password") });
  }, [navigation, t]);

  useEffect(() => {
    if (confirmTouched && confirmPassword) {
      validateConfirmPassword();
    }
  }, [newPassword, confirmPassword, confirmTouched]);

  const validateConfirmPassword = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords must match",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const validateNewPassword = () => {
    try {
      yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("New password is required")
        .validateSync(newPassword);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.newPassword;
        return newErrors;
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, newPassword: error.message }));
    }
  };

  const validateForm = async () => {
    try {
      await passwordSchema.validate(
        { newPassword, confirmPassword },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      await changePassword({
        customerId: user.id,
        password: newPassword,
      });
      setIsSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setConfirmTouched(false);

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    { textAlign: isRTL ? "right" : "left" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text
              style={[styles.subtitle, { textAlign: isRTL ? "right" : "left" }]}
            >
              {t("Create a new password that is secure and easy to remember")}
            </Text>
          </View>

          {isSuccess && (
            <View style={styles.successContainer}>
              <MaterialIcons
                name="check-circle"
                size={24}
                color={colors.accent}
              />
              <Text style={styles.successText}>
                {t("Password changed successfully!")}
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("New Password")}
              </Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "newPassword" && styles.inputWrapperFocused,
                  errors.newPassword && styles.inputWrapperError,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={24}
                  color={
                    focusedField === "newPassword"
                      ? colors.primary
                      : colors.textMuted
                  }
                  style={[
                    styles.icon,
                    isRTL ? { marginLeft: 10 } : { marginRight: 10 },
                  ]}
                />
                <TextInput
                  style={getInputStyle("newPassword")}
                  placeholder={t("Enter new password")}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocusedField("newPassword")}
                  onBlur={() => {
                    setFocusedField(null);
                    validateNewPassword();
                  }}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <MaterialIcons
                    name={showNewPassword ? "visibility-off" : "visibility"}
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.errorContainer}>
                {errors.newPassword && (
                  <Text
                    style={[
                      styles.errorText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {errors.newPassword}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("Confirm Password")}
              </Text>
              <View
                style={[
                  styles.iconInputWrapper,
                  focusedField === "confirmPassword" &&
                    styles.inputWrapperFocused,
                  errors.confirmPassword && styles.inputWrapperError,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <MaterialIcons
                  name="lock-outline"
                  size={24}
                  color={
                    focusedField === "confirmPassword"
                      ? colors.primary
                      : colors.textMuted
                  }
                  style={[
                    styles.icon,
                    isRTL ? { marginLeft: 10 } : { marginRight: 10 },
                  ]}
                />
                <TextInput
                  style={getInputStyle("confirmPassword")}
                  placeholder={t("Confirm new password")}
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (!confirmTouched) {
                      setConfirmTouched(true);
                    }
                  }}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                    size={24}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.errorContainer}>
                {errors.confirmPassword && (
                  <Text
                    style={[
                      styles.errorText,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.paperButton}
              contentStyle={styles.buttonContent}
              disabled={
                !newPassword ||
                !confirmPassword ||
                Object.keys(errors).length > 0 ||
                isLoading
              }
              buttonColor={colors.primary}
              labelStyle={styles.buttonLabel}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                t("Update Password")
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    maxWidth: isTablet ? 500 : 400,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  iconInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 10,
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
    height: "100%",
    color: colors.text,
    fontSize: 16,
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
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  paperButton: {
    borderRadius: 12,
    width: "100%",
    marginTop: 16,
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
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  successText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
