import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Provider as PaperProvider, Snackbar, Portal } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

export default function AppPreferencesScreen() {
  const router = useRouter();
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm');
  const [energyUnit, setEnergyUnit] = useState<'kcal' | 'kJ'>('kcal');
  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'system'>('light');

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
          <Text style={styles.headerTitle}>App Preferences</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Units Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Measurement Units</Text>

            {/* Weight Unit */}
            <View style={styles.preferenceRow}>
              <Text style={styles.prefLabel}>Weight Unit</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segmentBtn, weightUnit === 'kg' && styles.segmentBtnActive]}
                  onPress={() => setWeightUnit('kg')}
                >
                  <Text style={[styles.segmentText, weightUnit === 'kg' && styles.segmentTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, weightUnit === 'lbs' && styles.segmentBtnActive]}
                  onPress={() => setWeightUnit('lbs')}
                >
                  <Text style={[styles.segmentText, weightUnit === 'lbs' && styles.segmentTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Height Unit */}
            <View style={styles.preferenceRow}>
              <Text style={styles.prefLabel}>Height Unit</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segmentBtn, heightUnit === 'cm' && styles.segmentBtnActive]}
                  onPress={() => setHeightUnit('cm')}
                >
                  <Text style={[styles.segmentText, heightUnit === 'cm' && styles.segmentTextActive]}>cm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, heightUnit === 'inches' && styles.segmentBtnActive]}
                  onPress={() => setHeightUnit('inches')}
                >
                  <Text style={[styles.segmentText, heightUnit === 'inches' && styles.segmentTextActive]}>in</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Energy Unit */}
            <View style={styles.preferenceRow}>
              <Text style={styles.prefLabel}>Energy Unit</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segmentBtn, energyUnit === 'kcal' && styles.segmentBtnActive]}
                  onPress={() => setEnergyUnit('kcal')}
                >
                  <Text style={[styles.segmentText, energyUnit === 'kcal' && styles.segmentTextActive]}>kcal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, energyUnit === 'kJ' && styles.segmentBtnActive]}
                  onPress={() => setEnergyUnit('kJ')}
                >
                  <Text style={[styles.segmentText, energyUnit === 'kJ' && styles.segmentTextActive]}>kJ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Theme Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>App Theme</Text>
            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as const).map((t) => {
                const isActive = appTheme === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.themeBtn, isActive && styles.themeBtnActive]}
                    onPress={() => setAppTheme(t)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={t === 'light' ? 'sunny-outline' : t === 'dark' ? 'moon-outline' : 'settings-outline'} 
                      size={20} 
                      color={isActive ? '#FFFFFF' : '#6B785E'} 
                    />
                    <Text style={[styles.themeBtnText, isActive && styles.themeBtnTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
            App preferences updated! 🎉
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
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2310',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FAFCF8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#7EB93C',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B785E',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBF2E5',
    marginVertical: 10,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCF8',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  themeBtnActive: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B785E',
  },
  themeBtnTextActive: {
    color: '#FFFFFF',
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
