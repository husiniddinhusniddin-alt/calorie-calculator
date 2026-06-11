import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { height, width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError('Iltimos, email manzilingizni kiriting!');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Iltimos, to\'g\'ri email manzili kiriting!');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Iltimos, parolingizni kiriting!');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      // Navigate to the main tabs app
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header area with green background and simple floral/food decorations */}
          <View style={styles.headerBackground}>
            <View style={styles.patternDot} />
            <View style={[styles.patternDot, { top: 60, right: 40, width: 12, height: 12 }]} />
            <View style={[styles.patternLeaf, { top: 100, left: 30 }]} />
            <View style={[styles.patternLeaf, { top: 40, right: 80, transform: [{ rotate: '45deg' }] }]} />
          </View>

          {/* Main login card */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.card}
          >
            {/* Top Illustration container */}
            <View style={styles.illustrationFrame}>
              <View style={styles.illustrationBackground}>
                <Image
                  source={require('@/assets/images/login_header_image.png')}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Form Content */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome back!</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
                  <Ionicons name="mail-outline" size={20} color={emailError ? '#FF3B30' : '#8CC33F'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#A9A9A9"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color={passwordError ? '#FF3B30' : '#8CC33F'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="•••••••••••••"
                    placeholderTextColor="#A9A9A9"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#A9A9A9"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>

              {/* Toggle to Register */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.footerLink}>Create one</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7EB93C', // Vibrant lime green background from screenshot
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    height: height * 0.25,
    width: '100%',
    position: 'absolute',
    top: 0,
    backgroundColor: '#7EB93C',
  },
  patternDot: {
    position: 'absolute',
    top: 80,
    left: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  patternLeaf: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  card: {
    flex: 1,
    marginTop: height * 0.2, // Pushes card down
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  illustrationFrame: {
    alignItems: 'center',
    marginTop: -70, // Overlaps top of card
    alignSelf: 'center',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    borderWidth: 8,
    borderColor: '#7EB93C',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  illustrationBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FAF0', // Soft green-white inside frame
  },
  illustrationImage: {
    width: '85%',
    height: '85%',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3A5C18', // Deep organic green
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8CC33F',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#E8F5D8',
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#8CC33F',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#7EB93C',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    color: '#888888',
    fontSize: 14,
  },
  footerLink: {
    color: '#7EB93C',
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
