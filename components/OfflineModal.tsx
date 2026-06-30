import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

export const OfflineModal = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isChecking, setIsChecking] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(height)).current; // Start from bottom
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // In web, NetInfo might sometimes return null initially, handle true/false only for changes.
      if (typeof state.isConnected === 'boolean') {
        setIsConnected(state.isConnected);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      // Show modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Hide modal
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.poly(4)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isConnected]);

  if (isConnected === null || isConnected === true) {
    // Return early if connected but keep the animation values ready
    // We could return null, but rendering it with pointerEvents="none" 
    // and opacity 0 is better for smooth exit animations.
  }

  const checkConnection = () => {
    setIsChecking(true);
    NetInfo.fetch().then(state => {
      setTimeout(() => {
        setIsChecking(false);
        if (typeof state.isConnected === 'boolean') {
          setIsConnected(state.isConnected);
        }
      }, 800);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: opacityAnim },
        { backgroundColor: isDark ? 'rgba(15, 20, 10, 0.95)' : 'rgba(247, 250, 243, 0.95)' }
      ]}
      pointerEvents={isConnected === false ? 'auto' : 'none'}
    >
      <Animated.View style={[
        styles.content, 
        { transform: [{ translateY: slideAnim }] },
        { backgroundColor: isDark ? '#1E2517' : '#FFFFFF' }
      ]}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={60} color="#7EB93C" />
        </View>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          Internet aloqasi yo'q
        </Text>
        <Text style={[styles.message, { color: isDark ? '#A0A0A0' : '#666666' }]}>
          Iltimos, internet ulanishingizni tekshiring va qaytadan urinib ko'ring. Dastur ishlashi uchun tarmoq zarur.
        </Text>
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    width: width * 0.85,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(126, 185, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7EB93C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
