import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const Logo = require("../assets/splash-icon.png");

export default function AdvancedSplashScreen({
  onAnimationComplete,
  children,
  logoImage = Logo,
  backgroundColor = "#ffffff", // Light background
  logoWidth = width * 0.4,
  logoHeight = width * 0.4,
}) {
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoRotate = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const particleProgress = useSharedValue(0);

  // Generate particles with pastel colors
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 100 + Math.random() * 200,
    color: `hsl(${Math.random() * 360}, 50%, 70%)`, // Pastel colors
  }));

  // Start animation sequence
  useEffect(() => {
    // Logo fade-in and scale-up
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1.2, { damping: 10, stiffness: 100 });

    // Logo rotation (continuous)
    logoRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Particle burst animation
    particleProgress.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });

    // Fade out overlay and complete animation
    setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 1000 }, () =>
        runOnJS(onAnimationComplete)()
      );
    }, 2500);
  }, []);

  // Logo animation style
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  // Overlay animation style
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Animated.View style={[StyleSheet.absoluteFill, overlayAnimatedStyle]}>
        <View style={[styles.container, { backgroundColor }]}>
          {/* Logo Container */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image
              source={logoImage}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Particles */}
          {particles.map((particle) => (
            <AnimatedParticle
              key={particle.id}
              angle={particle.angle}
              distance={particle.distance}
              progress={particleProgress}
              color={particle.color}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// Animated Particle Component
const AnimatedParticle = ({ angle, distance, progress, color }) => {
  const particleStyle = useAnimatedStyle(() => {
    const theta = (angle * Math.PI) / 180;
    const radius = progress.value * distance;

    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(theta) * radius },
        { translateY: Math.sin(theta) * radius },
        { scale: 1 - progress.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          left: width / 2,
          top: height / 2,
        },
        particleStyle,
      ]}
    />
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    zIndex: 2,
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
