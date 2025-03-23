import React, { useLayoutEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import colors from "../../../components/theme";

const Index = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const ICON_COLOR = colors.primary;
  const DISABLED_COLOR = colors.textMuted;

  const isRTL = useMemo(() => {
    return i18n.language === "pa" || i18n.language === "da";
  }, [i18n.language]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("contact-us"),
    });
  }, [navigation]);

  const handleEmailPress = () => {
    Linking.openURL("mailto:Support@farhanict.com");
  };

  const handleCallPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsAppPress = () => {
    const phoneNumber = "+93748170133";
    const whatsappUrl =
      Platform.OS === "ios"
        ? `whatsapp://send?phone=${phoneNumber}`
        : `whatsapp://send?phone=${phoneNumber}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL("https://wa.me/+93748170133");
        }
      })
      .catch(() => Linking.openURL("https://wa.me/+93748170133"));
  };

  const handleSocialMediaPress = (platform) => {
    if (platform !== "facebook") return;

    const schemes = { facebook: "fb://profile" };
    const webUrls = {
      facebook: "https://www.facebook.com/profile.php?id=61567160589078",
    };

    const appUrl = schemes[platform];
    const webUrl = webUrls[platform];

    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(appUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => Linking.openURL(webUrl));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.header, { textAlign: isRTL ? "right" : "left" }]}>
        {t("get-in")} <Text style={styles.highlight}>{t("touch")}</Text>
      </Text>

      {/* Email Support */}
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleEmailPress}
          style={[
            styles.cardContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons name="mail" size={28} color={ICON_COLOR} />
          <View
            style={[
              styles.textContainer,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={styles.cardLabel}>{t("email-support")}</Text>
            <Text style={styles.cardValue}>Support@farhanict.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Phone Number */}
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => handleCallPress("+93748170133")}
          style={[
            styles.cardContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons name="call" size={28} color={ICON_COLOR} />
          <View
            style={[
              styles.textContainer,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={styles.cardLabel}>{t("support-phone")}</Text>
            <Text style={styles.cardValue}>+93 748 170 133</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* WhatsApp */}
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleWhatsAppPress}
          style={[
            styles.cardContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons name="logo-whatsapp" size={28} color={ICON_COLOR} />
          <View
            style={[
              styles.textContainer,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={styles.cardLabel}>{t("whatsapp")}</Text>
            <Text style={styles.cardValue}>+93 748 170 133</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <View
          style={[
            styles.cardContent,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Ionicons name="location" size={28} color={ICON_COLOR} />
          <View
            style={[
              styles.textContainer,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={styles.cardLabel}>{t("address")}</Text>
            <Text
              style={[
                styles.cardValue,
                {
                  paddingRight: isRTL ? 0 : 20,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
            >
              {t("location")}
            </Text>
          </View>
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.socialSection}>
        <Text
          style={[styles.socialHeader, { textAlign: isRTL ? "right" : "left" }]}
        >
          {t("connect-with-us")}
        </Text>
        <View style={styles.socialIcons}>
          {[
            "logo-facebook",
            "logo-twitter",
            "logo-instagram",
            "logo-linkedin",
          ].map((icon, index) => {
            const platform = icon.split("-")[1];
            const isDisabled = platform !== "facebook";

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.socialIconWrapper,
                  isDisabled && styles.disabledIconWrapper,
                ]}
                onPress={() => !isDisabled && handleSocialMediaPress(platform)}
                disabled={isDisabled}
              >
                <Ionicons
                  name={icon}
                  size={26}
                  color={isDisabled ? DISABLED_COLOR : ICON_COLOR}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 1.2,
  },
  highlight: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 16,
    marginRight: 16,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
  },
  socialSection: {
    marginTop: 15,
    alignItems: "center",
  },
  socialHeader: {
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  socialIconWrapper: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 14,
    margin: 8,
    elevation: 4,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  disabledIconWrapper: {
    opacity: 0.5,
  },
});

export default Index;
