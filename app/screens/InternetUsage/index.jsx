import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Import the icon library
import { useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t("internet-usage"),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="hourglass-empty" size={100} color="#888" />
      <Text style={styles.text}>{t("Coming Soon")}</Text>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
  },
});
