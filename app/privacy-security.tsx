import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Provider as PaperProvider, TextInput, Snackbar, Portal } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    privacySecurity: 'Privacy & Security',
    changePassword: 'Change Password',
    currentPass: 'Current Password',
    newPass: 'New Password',
    confirmPass: 'Confirm New Password',
    updatePass: 'Update Password',
    dangerZone: 'Danger Zone',
    dangerDesc: 'Once you delete your account, all calorie logs, weight history, and data will be permanently wiped out.',
    deleteAcc: 'Delete Account',
    deleteAccConfirm: 'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    required: 'Required',
    passNotMatch: 'Passwords do not match',
    userNotFound: 'User not found. Please log in again.',
    incorrectPass: 'Incorrect password',
    failedUpdate: 'Failed to update: ',
    unexpectedError: 'An unexpected error occurred.',
    passUpdated: 'Password updated successfully! 🔒',
  },
  ru: {
    privacySecurity: 'Приватность и Безопасность',
    changePassword: 'Изменить пароль',
    currentPass: 'Текущий пароль',
    newPass: 'Новый пароль',
    confirmPass: 'Подтвердите пароль',
    updatePass: 'Обновить пароль',
    dangerZone: 'Опасная зона',
    dangerDesc: 'При удалении аккаунта все ваши данные о калориях, весе и активности будут удалены навсегда.',
    deleteAcc: 'Удалить аккаунт',
    deleteAccConfirm: 'Вы абсолютно уверены, что хотите удалить свой аккаунт? Это действие необратимо.',
    cancel: 'Отмена',
    delete: 'Удалить',
    required: 'Обязательно',
    passNotMatch: 'Пароли не совпадают',
    userNotFound: 'Пользователь не найден. Пожалуйста, войдите снова.',
    incorrectPass: 'Неверный пароль',
    failedUpdate: 'Ошибка обновления: ',
    unexpectedError: 'Произошла непредвиденная ошибка.',
    passUpdated: 'Пароль успешно обновлен! 🔒',
  },
  uz: {
    privacySecurity: 'Xavfsizlik va Maxfiylik',
    changePassword: 'Parolni o\'zgartirish',
    currentPass: 'Joriy parol',
    newPass: 'Yangi parol',
    confirmPass: 'Yangi parolni tasdiqlang',
    updatePass: 'Parolni yangilash',
    dangerZone: 'Xavfli hudud',
    dangerDesc: 'Hisobni o\'chirganingizdan so\'ng, barcha kaloriya jurnallari, vazn tarixi va ma\'lumotlar butunlay o\'chiriladi.',
    deleteAcc: 'Hisobni o\'chirish',
    deleteAccConfirm: 'Hisobingizni o\'chirishga ishonchingiz komilmi? Bu harakatni ortga qaytarib bo\'lmaydi.',
    cancel: 'Bekor qilish',
    delete: 'O\'chirish',
    required: 'Majburiy',
    passNotMatch: 'Parollar mos emas',
    userNotFound: 'Foydalanuvchi topilmadi. Iltimos, qaytadan kiring.',
    incorrectPass: 'Noto\'g\'ri parol',
    failedUpdate: 'Yangilashda xatolik: ',
    unexpectedError: 'Kutilmagan xatolik yuz berdi.',
    passUpdated: 'Parol muvaffaqiyatli yangilandi! 🔒',
  }
};

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const language = MockStore.language || 'en';
  const t = translations[language as keyof typeof translations] || translations.en;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleUpdatePassword = async () => {
    let hasError = false;
    
    if (!currentPassword) {
      setCurrentPasswordError(t.required);
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError(t.required);
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError(t.required);
      hasError = true;
    } else if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError(t.passNotMatch);
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    
    // Add a small artificial delay so the loading state is visibly noticeable
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // 1. Get the current user to find their email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setSnackbarMsg(t.userNotFound);
        setSnackbarVisible(true);
        setIsLoading(false);
        return;
      }

      // 2. Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setCurrentPasswordError(t.incorrectPass);
        setIsLoading(false);
        return;
      }

      // 3. Current password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setSnackbarMsg(t.failedUpdate + updateError.message);
        setSnackbarVisible(true);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Failed to update password:', err);
      setSnackbarMsg(t.unexpectedError);
      setSnackbarVisible(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setSnackbarMsg(t.passUpdated);
    setSnackbarVisible(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.deleteAcc,
      t.deleteAccConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive',
          onPress: async () => {
            // Since we can't delete auth.users from client without service_role,
            // we simulate account deletion by wiping their public data 
            // and scrambling their password so they can never log in again.
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Wipe user data
                await supabase.from('diary_entries').delete().eq('user_id', user.id);
                await supabase.from('profiles').delete().eq('id', user.id);
                
                // Supabase rpc orqali auth.users dan o'chirish (buning uchun Supabase'da SQL yozish kerak)
                const { error: rpcError } = await supabase.rpc('delete_user');
                
                if (rpcError) {
                  console.warn('RPC Delete User xatosi:', rpcError);
                  // Agar RPC hali yaratilmagan bo'lsa, zaxira sifatida parolni buzamiz
                  const scrambledPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + 'X9$';
                  await supabase.auth.updateUser({ password: scrambledPassword });
                }
                
                // Mahalliy xotiraga yozib qo'yish
                if (user.email) {
                  const deletedStr = await AsyncStorage.getItem('deleted_accounts');
                  const deletedList = deletedStr ? JSON.parse(deletedStr) : [];
                  if (!deletedList.includes(user.email)) {
                    deletedList.push(user.email);
                    await AsyncStorage.setItem('deleted_accounts', JSON.stringify(deletedList));
                  }
                }
              }
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            } catch (err) {
              console.warn('Failed to delete account (sign out):', err);
            }
          }
        }
      ]
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#3A5C18" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.privacySecurity}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Password Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.changePassword}</Text>
            
            <TextInput
              mode="outlined"
              label={t.currentPass}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (currentPasswordError) setCurrentPasswordError('');
              }}
              secureTextEntry
              activeOutlineColor={currentPasswordError ? "#FF4D4F" : "#7EB93C"}
              outlineColor={currentPasswordError ? "#FF4D4F" : "#EBF2E5"}
              error={!!currentPasswordError}
              style={styles.input}
              textColor="#1A2310"
            />
            {!!currentPasswordError && (
              <Text style={{ color: '#FF4D4F', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 }}>
                {currentPasswordError}
              </Text>
            )}

            <TextInput
              mode="outlined"
              label={t.newPass}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError('');
              }}
              secureTextEntry
              activeOutlineColor={newPasswordError ? "#FF4D4F" : "#7EB93C"}
              outlineColor={newPasswordError ? "#FF4D4F" : "#EBF2E5"}
              error={!!newPasswordError}
              style={styles.input}
              textColor="#1A2310"
            />
            {!!newPasswordError && (
              <Text style={{ color: '#FF4D4F', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 }}>
                {newPasswordError}
              </Text>
            )}

            <TextInput
              mode="outlined"
              label={t.confirmPass}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              secureTextEntry
              activeOutlineColor={confirmPasswordError ? "#FF4D4F" : "#7EB93C"}
              outlineColor={confirmPasswordError ? "#FF4D4F" : "#EBF2E5"}
              error={!!confirmPasswordError}
              style={styles.input}
              textColor="#1A2310"
            />
            {!!confirmPasswordError && (
              <Text style={{ color: '#FF4D4F', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 }}>
                {confirmPasswordError}
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.updateBtn, isLoading && { opacity: 0.7 }]}
              onPress={handleUpdatePassword}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.updateBtnText}>{t.updatePass}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={[styles.sectionTitle, { color: '#FF4D4F' }]}>{t.dangerZone}</Text>
            <Text style={styles.dangerDesc}>
              {t.dangerDesc}
            </Text>

            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>{t.deleteAcc}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={1500}
            style={styles.snackbar}
          >
            {snackbarMsg}
          </Snackbar>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBF2E5',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCF8',
    borderWidth: 1,
    borderColor: '#EBF2E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3A5C18',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  dangerCard: {
    borderColor: '#FFE0E0',
    backgroundColor: '#FFFBFB',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  updateBtn: {
    backgroundColor: '#7EB93C',
    borderRadius: 20,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dangerDesc: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteBtn: {
    backgroundColor: '#FF4D4F',
    borderRadius: 20,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  snackbar: {
    backgroundColor: '#1A2310',
    borderRadius: 14,
  },
});
