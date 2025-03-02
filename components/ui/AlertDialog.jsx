// components/AlertDialog.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import Modal from "react-native-modal";

const AlertDialog = ({
  visible,
  title,
  message,
  onDismiss,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
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
      backdropOpacity={0}
    >
      <View style={[styles.dialog]}>
        <Text style={[styles.title]}>{title}</Text>
        <Text style={[styles.message]}>{message}</Text>
        <View style={styles.buttonsContainer}>
          <Button mode="outlined" onPress={onDismiss} style={[styles.button]}>
            {cancelText}
          </Button>
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
    width: "100%",
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
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    marginLeft: 10,
    width: "45%",
  },
});

export default AlertDialog;
