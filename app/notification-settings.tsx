import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Provider as PaperProvider, Snackbar, Portal } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [weightLogAlert, setWeightLogAlert] = useState(false);
  const [promoEmail, setPromoEmail] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSave = () => {
    setSnackbarVisible(true);
    setTimeout(() => {
      router.back();
    }, 1500);
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
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Push Notifications</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Daily Reminders</Text>
                <Text style={styles.settingDesc}>Remind me to log meals and track weight daily.</Text>
              </View>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: '#EBF2E5', true: '#C8E8A0' }}
                thumbColor={dailyReminder ? '#7EB93C' : '#9AA88E'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Weekly Progress Reports</Text>
                <Text style={styles.settingDesc}>Receive a summary of weight changes and weekly calories.</Text>
              </View>
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: '#EBF2E5', true: '#C8E8A0' }}
                thumbColor={weeklyReport ? '#7EB93C' : '#9AA88E'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Weight Logs Alerts</Text>
                <Text style={styles.settingDesc}>Get notified if I miss logging my weight for 3 days.</Text>
              </View>
              <Switch
                value={weightLogAlert}
                onValueChange={setWeightLogAlert}
                trackColor={{ false: '#EBF2E5', true: '#C8E8A0' }}
                thumbColor={weightLogAlert ? '#7EB93C' : '#9AA88E'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDesc}>Play sounds when logging foods or achievements.</Text>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: '#EBF2E5', true: '#C8E8A0' }}
                thumbColor={soundEffects ? '#7EB93C' : '#9AA88E'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Text style={styles.settingDesc}>Receive healthy recipe tips and fitness offers.</Text>
              </View>
              <Switch
                value={promoEmail}
                onValueChange={setPromoEmail}
                trackColor={{ false: '#EBF2E5', true: '#C8E8A0' }}
                thumbColor={promoEmail ? '#7EB93C' : '#9AA88E'}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </TouchableOpacity>
        </ScrollView>

        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={1500}
            style={styles.snackbar}
          >
            Notification preferences updated! 🎉
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2310',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B785E',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBF2E5',
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#7EB93C',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  snackbar: {
    backgroundColor: '#1A2310',
    borderRadius: 14,
  },
});
