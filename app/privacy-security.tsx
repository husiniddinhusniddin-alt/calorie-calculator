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

export default function PrivacySecurityScreen() {
  const router = useRouter();
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
      setCurrentPasswordError('Required');
      hasError = true;
    }
    if (!newPassword) {
      setNewPasswordError('Required');
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Required');
      hasError = true;
    } else if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
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
        setSnackbarMsg('User not found. Please log in again.');
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
        setCurrentPasswordError('Incorrect password');
        setIsLoading(false);
        return;
      }

      // 3. Current password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setSnackbarMsg('Failed to update: ' + updateError.message);
        setSnackbarVisible(true);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Failed to update password:', err);
      setSnackbarMsg('An unexpected error occurred.');
      setSnackbarVisible(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setSnackbarMsg('Password updated successfully! 🔒');
    setSnackbarVisible(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Note: In Supabase, deleting an auth user directly from the client requires either a dedicated Postgres function (RPC) or an Edge Function due to security restrictions.
            // For now, we will simply sign them out as a placeholder until the backend function is created.
            try {
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            } catch (err) {
              console.warn('Failed to sign out:', err);
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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#3A5C18" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Password Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <TextInput
              mode="outlined"
              label="Current Password"
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
              label="New Password"
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
              label="Confirm New Password"
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
                <Text style={styles.updateBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={[styles.sectionTitle, { color: '#FF4D4F' }]}>Danger Zone</Text>
            <Text style={styles.dangerDesc}>
              Once you delete your account, all calorie logs, weight history, and data will be permanently wiped out.
            </Text>

            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>Delete Account</Text>
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
