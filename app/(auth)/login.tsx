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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const translations = {
  en: {
    welcome: 'Welcome back!',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot your password?',
    loginButton: 'Log In',
    noAccount: "Don't have an account? ",
    createOne: 'Create one',
    emailReq: 'Please enter your email!',
    emailInvalid: 'Please enter a valid email address!',
    passwordReq: 'Please enter your password!',
    accountDeletedTitle: 'Account deleted',
    accountDeletedMsg: 'This account has been permanently deleted. Please create a new account or use a different email.',
    errorTitle: 'Error',
    errorInvalidLogin: 'Incorrect email or password. If you deleted your account, it might be permanently closed.',
    errorUnexpected: 'An unexpected error occurred',
    understandBtn: 'Understood'
  },
  ru: {
    welcome: 'С возвращением!',
    emailLabel: 'Email',
    passwordLabel: 'Пароль',
    forgotPassword: 'Забыли пароль?',
    loginButton: 'Войти',
    noAccount: "Нет аккаунта? ",
    createOne: 'Создать',
    emailReq: 'Пожалуйста, введите ваш email!',
    emailInvalid: 'Пожалуйста, введите правильный email!',
    passwordReq: 'Пожалуйста, введите пароль!',
    accountDeletedTitle: 'Аккаунт удален',
    accountDeletedMsg: 'Этот аккаунт был навсегда удален. Пожалуйста, создайте новый аккаунт или используйте другой email.',
    errorTitle: 'Ошибка',
    errorInvalidLogin: 'Неверный email или пароль. Если вы удалили свой аккаунт, возможно, он закрыт навсегда.',
    errorUnexpected: 'Произошла непредвиденная ошибка',
    understandBtn: 'Понятно'
  },
  uz: {
    welcome: 'Xush kelibsiz!',
    emailLabel: 'Email',
    passwordLabel: 'Parol',
    forgotPassword: 'Parolni unutdingizmi?',
    loginButton: 'Kirish',
    noAccount: "Akkauntingiz yo'qmi? ",
    createOne: 'Yaratish',
    emailReq: 'Iltimos, email manzilingizni kiriting!',
    emailInvalid: 'Iltimos, to\'g\'ri email manzili kiriting!',
    passwordReq: 'Iltimos, parolingizni kiriting!',
    accountDeletedTitle: 'Akkaunt o\'chirilgan',
    accountDeletedMsg: 'Bu akkaunt butunlay o\'chirilgan. Iltimos, yangi akkaunt yarating yoki boshqa pochtadan foydalaning.',
    errorTitle: 'Xatolik',
    errorInvalidLogin: 'Email yoki parol xato kiritildi. Agar akkauntingizni o\'chirgan bo\'lsangiz, u butunlay yopilgan bo\'lishi mumkin.',
    errorUnexpected: 'Kutilmagan xatolik yuz berdi',
    understandBtn: 'Tushunarli'
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState<'en' | 'ru' | 'uz'>(MockStore.language as 'en' | 'ru' | 'uz');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [languageChanged, setLanguageChanged] = useState(false);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState('');
  const [customModalMessage, setCustomModalMessage] = useState('');

  const t = translations[language];

  const changeLanguage = (lang: 'en' | 'ru' | 'uz') => {
    setLanguage(lang);
    setLanguageChanged(true);
    MockStore.update({ language: lang });
    setEmailError('');
    setPasswordError('');
  };

  const handleLogin = async () => {
    if (loading) return;

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError(t.emailReq);
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t.emailInvalid);
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError(t.passwordReq);
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (isValid) {
      setLoading(true);
      try {
        const deletedStr = await AsyncStorage.getItem('deleted_accounts');
        const deletedList = deletedStr ? JSON.parse(deletedStr) : [];
        if (deletedList.includes(email.trim().toLowerCase())) {
          setCustomModalTitle(t.accountDeletedTitle);
          setCustomModalMessage(t.accountDeletedMsg);
          setCustomModalVisible(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          let errorMsg = error.message;
          if (errorMsg === 'Invalid login credentials') {
            errorMsg = t.errorInvalidLogin;
          }
          setCustomModalTitle(t.errorTitle);
          setCustomModalMessage(errorMsg);
          setCustomModalVisible(true);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Fetch user profile settings from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.warn('Profile fetch failed:', profileError.message);
          }

          if (profile) {
            let finalLang = profile.language ?? 'en';
            
            // Only update Supabase if the user EXPLICITLY changed the language on the login screen
            if (languageChanged && profile.language !== language) {
              finalLang = language;
              await supabase.from('profiles').update({ language: finalLang }).eq('id', data.user.id);
            }

            // Update MockStore with user's settings from Supabase
            MockStore.update({
              name: profile.name || data.user.email?.split('@')[0] || 'User',
              email: profile.email || data.user.email || '',
              profileImage: profile.profile_image || null,
              targetWeight: parseFloat(profile.target_weight) || 82,
              currentWeight: parseFloat(profile.current_weight) || 85,
              startingWeight: parseFloat(profile.starting_weight) || 88,
              dailyCalorieGoal: parseFloat(profile.daily_calorie_goal) || 1900,
              weeklyWeightGoal: parseFloat(profile.weekly_weight_goal) || 0.5,
              targetDate: profile.target_date ? new Date(profile.target_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              age: profile.age || null,
              height: profile.height || null,
              calorieStreak: profile.calorie_streak ?? 0,
              waterStreak: profile.water_streak ?? 0,
              appTheme: profile.app_theme ?? 'system',
              language: finalLang, // Use the determined language
              notifications: profile.notifications ?? MockStore.notifications,
            });
          } else {
            // Profile missing (e.g. from email confirmation), create it now
            const currentLang = language;
            const meta = data.user.user_metadata || {};
            const newProfile = {
              id: data.user.id,
              email: data.user.email,
              phone: meta.phone || '',
              name: data.user.email?.split('@')[0] || 'User',
              current_weight: meta.current_weight || 85,
              starting_weight: meta.starting_weight || 85,
              target_weight: meta.target_weight || 82,
              daily_calorie_goal: 1900,
              weekly_weight_goal: 0.5,
              target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              age: null,
              height: null,
              calorie_streak: 0,
              water_streak: 0,
              app_theme: 'system',
              language: currentLang, // Use the selected language
              notifications: MockStore.notifications,
            };
            
            await supabase.from('profiles').insert(newProfile);
            
            MockStore.update({
              name: newProfile.name,
              email: newProfile.email || '',
              profileImage: null,
              targetWeight: newProfile.target_weight,
              currentWeight: newProfile.current_weight,
              startingWeight: newProfile.starting_weight,
              dailyCalorieGoal: newProfile.daily_calorie_goal,
              weeklyWeightGoal: newProfile.weekly_weight_goal,
              age: newProfile.age,
              height: newProfile.height,
              calorieStreak: newProfile.calorie_streak,
              waterStreak: newProfile.water_streak,
              appTheme: newProfile.app_theme as 'light' | 'dark' | 'system',
              language: currentLang as 'en' | 'ru' | 'uz',
              notifications: newProfile.notifications,
            });
          }

          router.replace('/(tabs)');
        }
      } catch (err: any) {
        setCustomModalTitle(t.errorTitle);
        setCustomModalMessage(err.message || t.errorUnexpected);
        setCustomModalVisible(true);
      } finally {
        setLoading(false);
      }
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
            
            {/* Language Selector Button */}
            <View style={[styles.languageSelector, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity onPress={() => setLangModalVisible(true)} style={styles.currentLangBtn}>
                <Ionicons name="globe-outline" size={18} color="#7EB93C" />
                <Text style={styles.currentLangText}>
                  {language === 'uz' ? "O'zbekcha" : language === 'ru' ? "Русский" : "English"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#7EB93C" />
              </TouchableOpacity>
            </View>
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
              <Text style={styles.title}>{t.welcome}</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.emailLabel}</Text>
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
                <Text style={styles.inputLabel}>{t.passwordLabel}</Text>
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
                <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.loginButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>{t.loginButton}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{t.noAccount}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.footerLink}>{t.createOne}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
          <View style={styles.langModalContainer}>
            <Text style={styles.langModalTitle}>Tilni tanlang / Выберите язык</Text>
            
            <TouchableOpacity 
              style={[styles.langOptionBtn, language === 'uz' && styles.langOptionBtnActive]} 
              onPress={() => { changeLanguage('uz'); setLangModalVisible(false); }}
            >
              <Text style={styles.langOptionFlag}>🇺🇿</Text>
              <Text style={[styles.langOptionText, language === 'uz' && styles.langOptionTextActive]}>O&apos;zbekcha</Text>
              {language === 'uz' && <Ionicons name="checkmark-circle" size={24} color="#7EB93C" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOptionBtn, language === 'ru' && styles.langOptionBtnActive]} 
              onPress={() => { changeLanguage('ru'); setLangModalVisible(false); }}
            >
              <Text style={styles.langOptionFlag}>🇷🇺</Text>
              <Text style={[styles.langOptionText, language === 'ru' && styles.langOptionTextActive]}>Русский</Text>
              {language === 'ru' && <Ionicons name="checkmark-circle" size={24} color="#7EB93C" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langOptionBtn, language === 'en' && styles.langOptionBtnActive]} 
              onPress={() => { changeLanguage('en'); setLangModalVisible(false); }}
            >
              <Text style={styles.langOptionFlag}>🇺🇸</Text>
              <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>English</Text>
              {language === 'en' && <Ionicons name="checkmark-circle" size={24} color="#7EB93C" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal
        visible={customModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={40} color="#7EB93C" />
            </View>
            <Text style={styles.modalTitle}>{customModalTitle}</Text>
            <Text style={styles.modalMessage}>{customModalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setCustomModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Tushunarli</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F5FAF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#7EB93C',
    borderRadius: 20,
    height: 46,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  currentLangBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLangText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A5C18',
  },
  langModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A5C18',
    marginBottom: 20,
    textAlign: 'center',
  },
  langOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F5FAF0',
    marginBottom: 10,
  },
  langOptionBtnActive: {
    backgroundColor: '#E8F5D8',
    borderWidth: 1,
    borderColor: '#7EB93C',
  },
  langOptionFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  langOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  langOptionTextActive: {
    color: '#3A5C18',
    fontWeight: '700',
  }
});
