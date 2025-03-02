import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import Modal from "react-native-modal";

const AlertDialog = ({
  visible,
  title,
  message,
  onDismiss,
  onConfirm,
  confirmText = "OK",
  cancelText = "",
  animationIn = "zoomIn",
  animationOut = "zoomOut",
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onDismiss}
      onBackButtonPress={onDismiss}
      animationIn={animationIn}
      animationOut={animationOut}
      backdropOpacity={0.1}
      statusBarTranslucent
    >
      <View style={[styles.dialog]}>
        <Text style={[styles.title]}>{title}</Text>
        <Text style={[styles.message]}>{message}</Text>
        <View style={styles.buttonsContainer}>
          {cancelText ? (
            <Button mode="outlined" onPress={onDismiss} style={[styles.button]}>
              {cancelText}
            </Button>
          ) : null}
          <Button mode="contained" onPress={onConfirm} style={styles.button}>
            {confirmText}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    width: "90%", // Adjusted for better responsiveness
    borderRadius: 8,
    padding: 20,
    backgroundColor: "white",
    alignSelf: "center",
    elevation: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align Refresh button to the right
  },
  button: {
    marginLeft: 10,
  },
});

export default AlertDialog;
