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
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';

const { height, width } = Dimensions.get('window');

const COUNTRIES = [
  { code: '+998', flag: '🇺🇿', name: 'O\'zbekiston' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+7', flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
];

const translations = {
  en: {
    createAccount: "Create an account",
    emailLabel: "Email",
    passwordLabel: "Password",
    phoneLabel: "Phone",
    emailPlaceholder: "Enter your email",
    phonePlaceholder: "Cell number",
    emailReq: "Please enter your email!",
    emailInvalid: "Please enter a valid email address!",
    phoneReq: "Please enter your phone number!",
    phoneUzbekFormat: "Phone must have 9 digits (e.g., 901234567)!",
    phoneInvalid: "Please enter a valid phone number!",
    passwordReq: "Please enter your password!",
    passwordLength: "Password must be at least 6 characters!",
    nextStep: "Next step",
    alreadyHaveAccount: "Already have an account? ",
    loginLink: "Log In",
    selectCountry: "Select Country",
  },
  ru: {
    createAccount: "Создать аккаунт",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    phoneLabel: "Телефон",
    emailPlaceholder: "Введите ваш email",
    phonePlaceholder: "Номер телефона",
    emailReq: "Пожалуйста, введите ваш email!",
    emailInvalid: "Пожалуйста, введите правильный email!",
    phoneReq: "Пожалуйста, введите ваш номер телефона!",
    phoneUzbekFormat: "Номер телефона должен состоять из 9 цифр!",
    phoneInvalid: "Пожалуйста, введите правильный номер телефона!",
    passwordReq: "Пожалуйста, введите пароль!",
    passwordLength: "Пароль должен состоять минимум из 6 символов!",
    nextStep: "Следующий шаг",
    alreadyHaveAccount: "Уже есть аккаунт? ",
    loginLink: "Войти",
    selectCountry: "Выберите страну",
  },
  uz: {
    createAccount: "Yangi akkaunt yaratish",
    emailLabel: "Email",
    passwordLabel: "Parol",
    phoneLabel: "Telefon",
    emailPlaceholder: "Emailingizni kiriting",
    phonePlaceholder: "Telefon raqami",
    emailReq: "Iltimos, email manzilingizni kiriting!",
    emailInvalid: "Iltimos, to'g'ri email manzili kiriting!",
    phoneReq: "Iltimos, telefon raqamingizni kiriting!",
    phoneUzbekFormat: "Telefon raqami 9 ta raqamdan iborat bo'lishi kerak (masalan: 901234567)!",
    phoneInvalid: "Iltimos, to'g'ri telefon raqami kiriting!",
    passwordReq: "Iltimos, parolingizni kiriting!",
    passwordLength: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!",
    nextStep: "Keyingi qadam",
    alreadyHaveAccount: "Akkauntingiz bormi? ",
    loginLink: "Kirish",
    selectCountry: "Davlatni tanlang",
  }
};

export default function RegisterScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'ru' | 'uz'>(MockStore.language as 'en' | 'ru' | 'uz');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to Uzbekistan
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const t = translations[language];

  const handleRegister = async () => {
    if (loading) return;
    
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!email.trim()) {
      setEmailError(t.emailReq);
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t.emailInvalid);
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!phone.trim()) {
      setPhoneError(t.phoneReq);
      isValid = false;
    } else if (selectedCountry.code === '+998' && cleanPhone.length !== 9) {
      setPhoneError(t.phoneUzbekFormat);
      isValid = false;
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setPhoneError(t.phoneInvalid);
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!password.trim()) {
      setPasswordError(t.passwordReq);
      isValid = false;
    } else if (password.trim().length < 6) {
      setPasswordError(t.passwordLength);
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      const fullPhone = selectedCountry.code + cleanPhone;
      router.push({
        pathname: '/(auth)/register-details',
        params: { email: email.trim(), password: password.trim(), phone: fullPhone }
      });
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
              <Text style={styles.title}>{t.createAccount}</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.emailLabel}</Text>
                <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
                  <TextInput
                    style={styles.input}
                    placeholder={t.emailPlaceholder}
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
                <Text style={styles.inputLabel}>{t.passwordLabel}</Text>
                <View style={[styles.inputWrapper, passwordError ? styles.inputWrapperError : null]}>
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

              {/* Phone Input with Country Code Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.phoneLabel}</Text>
                <View style={[styles.phoneWrapper, phoneError ? styles.phoneWrapperError : null]}>
                  <TouchableOpacity 
                    style={styles.countryCodeContainer}
                    onPress={() => setShowCountryModal(true)}
                  >
                    <Text style={styles.flag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                    <Ionicons name="chevron-down-outline" size={14} color="#888888" style={styles.chevron} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder={t.phonePlaceholder}
                    placeholderTextColor="#A9A9A9"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (phoneError) setPhoneError('');
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              </View>

              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.nextButton, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#7EB93C" />
                ) : (
                  <Text style={styles.nextButtonText}>{t.nextStep}</Text>
                )}
              </TouchableOpacity>

              {/* Toggle to Login */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{t.alreadyHaveAccount}</Text>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}>
                  <Text style={styles.footerLink}>{t.loginLink}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.selectCountry}</Text>
            <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
              {COUNTRIES.map((item) => (
                <TouchableOpacity
                  key={item.code + item.name}
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryFlagItem}>{item.flag}</Text>
                  <Text style={styles.countryNameItem}>{item.name}</Text>
                  <Text style={styles.countryCodeItem}>{item.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  inputWrapperError: {
    borderColor: '#FF3B30',
  },
  phoneWrapperError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: height * 0.55,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A5C18',
    textAlign: 'center',
    marginBottom: 20,
  },
  countryList: {
    width: '100%',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F9E8',
  },
  countryFlagItem: {
    fontSize: 22,
    marginRight: 14,
  },
  countryNameItem: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  countryCodeItem: {
    fontSize: 16,
    color: '#8CC33F',
    fontWeight: '700',
  },
  eyeIcon: {
    padding: 4,
  },
});
