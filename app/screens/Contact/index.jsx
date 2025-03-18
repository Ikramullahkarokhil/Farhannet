import React, { useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const scaleValue = useSharedValue(1);
  const ICON_COLOR = "#007AFF";
  const DISABLED_COLOR = "#999999";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("contact-us"),
    });
  }, [navigation]);

  const animatePress = () => {
    scaleValue.value = withSpring(0.98, {}, () => {
      scaleValue.value = withSpring(1);
    });
  };

  const handleEmailPress = () => {
    animatePress();
    Linking.openURL("mailto:Support@farhanict.com");
  };

  const handleCallPress = (phoneNumber) => {
    animatePress();
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsAppPress = () => {
    animatePress();
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

    animatePress();
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        {t("get-in")} <Text style={styles.highlight}>{t("touch")}</Text>
      </Text>

      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity onPress={handleEmailPress} style={styles.cardContent}>
          <Ionicons name="mail" size={28} color={ICON_COLOR} />
          <View style={styles.textContainer}>
            <Text style={styles.cardLabel}>{t("email-support")}</Text>
            <Text style={styles.cardValue}>Support@farhanict.com</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Support Phone Number */}
      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity
          onPress={() => handleCallPress("+93748170133")}
          style={styles.cardContent}
        >
          <Ionicons name="call" size={28} color={ICON_COLOR} />
          <View style={styles.textContainer}>
            <Text style={styles.cardLabel}>{t("support-phone")}</Text>
            <Text style={styles.cardValue}>+93 748 170 133</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* WhatsApp */}
      <Animated.View style={[styles.card, animatedStyle]}>
        <TouchableOpacity
          onPress={handleWhatsAppPress}
          style={styles.cardContent}
        >
          <Ionicons name="logo-whatsapp" size={28} color={ICON_COLOR} />
          <View style={styles.textContainer}>
            <Text style={styles.cardLabel}>{t("whatsapp")}</Text>
            <Text style={styles.cardValue}>+93 748 170 133</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Ionicons name="location" size={28} color={ICON_COLOR} />
          <View style={styles.textContainer}>
            <Text style={styles.cardLabel}>{t("address")}</Text>
            <Text style={[styles.cardValue, { paddingRight: 20 }]}>
              {t("location")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.socialHeader}>{t("connect-with-us")}</Text>
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
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    marginBottom: 20,
    letterSpacing: 1.2,
  },
  highlight: {
    color: "#007AFF",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 16,
  },
  cardLabel: {
    color: "#666",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    color: "#333",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
  },
  socialSection: {
    marginTop: 15,
    alignItems: "center",
  },
  socialHeader: {
    color: "#666",
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
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 14,
    margin: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  disabledIconWrapper: {
    opacity: 0.5,
  },
});

export default Index;
