import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#3A5C18" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Info Hero */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.heroCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>AG</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>Alex Green</Text>
              <Text style={styles.profileEmail}>alex.green@health.com</Text>
              <View style={styles.tierBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#7EB93C" />
                <Text style={styles.tierText}>Premium Member</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>85 kg</Text>
              <Text style={styles.statLbl}>Weight</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>182 cm</Text>
              <Text style={styles.statLbl}>Height</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>28 yo</Text>
              <Text style={styles.statLbl}>Age</Text>
            </View>
          </View>
        </Animated.View>

        {/* Achievements Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Current Streaks</Text>
          <View style={styles.streaksContainer}>
            <View style={styles.streakItem}>
              <View style={[styles.streakIconBg, { backgroundColor: '#FFF7E6' }]}>
                <Ionicons name="flame" size={24} color="#FFA940" />
              </View>
              <Text style={styles.streakCount}>5 Days</Text>
              <Text style={styles.streakLabel}>Calorie Target</Text>
            </View>

            <View style={styles.streakItem}>
              <View style={[styles.streakIconBg, { backgroundColor: '#F0FAE4' }]}>
                <Ionicons name="water" size={24} color="#7EB93C" />
              </View>
              <Text style={styles.streakCount}>12 Days</Text>
              <Text style={styles.streakLabel}>Water Intake</Text>
            </View>

            <View style={styles.streakItem}>
              <View style={[styles.streakIconBg, { backgroundColor: '#E6F7FF' }]}>
                <Ionicons name="trending-down" size={24} color="#1890FF" />
              </View>
              <Text style={styles.streakCount}>-2 kg</Text>
              <Text style={styles.streakLabel}>Weight Loss</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu List */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F0FAE4' }]}>
              <Ionicons name="person-outline" size={20} color="#7EB93C" />
            </View>
            <Text style={styles.menuItemText}>Personal Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconBg, { backgroundColor: '#E6F7FF' }]}>
              <Ionicons name="notifications-outline" size={20} color="#1890FF" />
            </View>
            <Text style={styles.menuItemText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FFF7E6' }]}>
              <Ionicons name="shield-outline" size={20} color="#FFA940" />
            </View>
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F9F0FF' }]}>
              <Ionicons name="settings-outline" size={20} color="#722ED1" />
            </View>
            <Text style={styles.menuItemText}>App Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4D4F" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF3',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A5C18',
  },
  notificationBtn: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4F',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7EB93C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A2A2A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAE4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7EB93C',
  },
  statsDivider: {
    height: 1.5,
    backgroundColor: '#F7FAF3',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A2A2A',
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  statDividerVertical: {
    width: 1.5,
    height: 30,
    backgroundColor: '#EBF2E5',
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 16,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  streakItem: {
    flex: 1,
    backgroundColor: '#FAFCF8',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2E5',
  },
  streakIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A2A2A',
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2A2A2A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EBF2E5',
    marginLeft: 52,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderColor: '#FFE0E0',
    borderWidth: 1.5,
    borderRadius: 24,
    height: 50,
  },
  logoutBtnText: {
    color: '#FF4D4F',
    fontSize: 16,
    fontWeight: '700',
  },
});
