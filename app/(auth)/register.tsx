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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { height, width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  const handleRegister = () => {
    // Navigate to the main tabs app
    router.replace('/(tabs)');
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
            <View style={[styles.patternDot, { top: 70, right: 60, width: 10, height: 10 }]} />
            <View style={[styles.patternLeaf, { top: 90, left: 40 }]} />
            <View style={[styles.patternLeaf, { top: 50, right: 100, transform: [{ rotate: '-30deg' }] }]} />
          </View>

          {/* Main register card */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.card}
          >
            {/* Top Illustration container */}
            <View style={styles.illustrationFrame}>
              <View style={styles.illustrationBackground}>
                <Image
                  source={require('@/assets/images/register_header_image.png')}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Form Content */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create an account</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#A9A9A9"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Input with Country Code Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.phoneWrapper}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={styles.countryCode}>{countryCode}</Text>
                    <Ionicons name="chevron-down-outline" size={14} color="#888888" style={styles.chevron} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="Cell number"
                    placeholderTextColor="#A9A9A9"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Next Step Button (Styled with green border and green text as in screenshot) */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.nextButton}
                onPress={handleRegister}
              >
                <Text style={styles.nextButtonText}>Next step</Text>
              </TouchableOpacity>

              {/* Toggle to Login */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Log In</Text>
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
    marginBottom: 35,
  },
  inputContainer: {
    marginBottom: 25,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 4,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#E8F5D8',
    paddingBottom: 8,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingRight: 10,
    borderRightWidth: 1,
    borderColor: '#E8F5D8',
  },
  flag: {
    fontSize: 18,
    marginRight: 5,
  },
  countryCode: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 3,
  },
  phoneInput: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7EB93C',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  nextButtonText: {
    color: '#7EB93C',
    fontSize: 18,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
});
