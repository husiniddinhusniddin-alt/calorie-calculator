import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Provider as PaperProvider, TextInput, Snackbar, Portal } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbarMsg('Please fill in all password fields.');
      setSnackbarVisible(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setSnackbarMsg('New passwords do not match.');
      setSnackbarVisible(true);
      return;
    }
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
          onPress: () => {
            setSnackbarMsg('Account deleted. Redirecting...');
            setSnackbarVisible(true);
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 1500);
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
              onChangeText={setCurrentPassword}
              secureTextEntry
              activeOutlineColor="#7EB93C"
              outlineColor="#EBF2E5"
              style={styles.input}
              textColor="#1A2310"
            />

            <TextInput
              mode="outlined"
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              activeOutlineColor="#7EB93C"
              outlineColor="#EBF2E5"
              style={styles.input}
              textColor="#1A2310"
            />

            <TextInput
              mode="outlined"
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              activeOutlineColor="#7EB93C"
              outlineColor="#EBF2E5"
              style={styles.input}
              textColor="#1A2310"
            />

            <TouchableOpacity 
              style={styles.updateBtn}
              onPress={handleUpdatePassword}
              activeOpacity={0.85}
            >
              <Text style={styles.updateBtnText}>Update Password</Text>
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
