import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MockStore } from '@/constants/store';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme Colors
  const theme = {
    background: isDark ? '#0F140A' : '#FFFFFF',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A2310',
    textBrand: isDark ? '#8CC33F' : '#3A5C18',
    textMuted: isDark ? '#9AA88E' : '#6B785E',
    badgeBackground: isDark ? '#23321A' : '#F0FAE4',
    badgeBorder: isDark ? '#374B2A' : '#C8E8A0',
    streakBoxBg: isDark ? '#10160B' : '#F5F5F5',
    menuIconBg: isDark ? '#23321A' : '#F0FAE4',
  };

  // State synced with MockStore
  const [profileImage, setProfileImage] = useState<string | null>(MockStore.profileImage);
  const [targetWeight, setTargetWeight] = useState<number>(MockStore.targetWeight);
  const [currentWeight, setCurrentWeight] = useState<number>(MockStore.currentWeight);

  // Subscribe to MockStore updates
  useEffect(() => {
    return MockStore.subscribe(() => {
      setProfileImage(MockStore.profileImage);
      setTargetWeight(MockStore.targetWeight);
      setCurrentWeight(MockStore.currentWeight);
    });
  }, []);

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  // Profile Image Picker
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to change your avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedUri = result.assets[0].uri;
      MockStore.update({ profileImage: selectedUri });
    }
  };

  // Goal calculations
  const weightDiff = currentWeight - targetWeight;
  const isLoss = weightDiff >= 0;
  const absWeightDiff = Math.abs(weightDiff);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.textBrand }]}>My Profile</Text>
          <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#7EB93C" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Info Hero */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(100)} 
          style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={[styles.avatarContainer, { backgroundColor: theme.badgeBackground }]} 
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>AG</Text>
              )}
              {/* Small edit badge overlay */}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>Alex Green</Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]}>alex.green@health.com</Text>
              <View style={[styles.tierBadge, { backgroundColor: theme.badgeBackground }]}>
                <Ionicons name="shield-checkmark" size={12} color="#7EB93C" />
                <Text style={styles.tierText}>Premium Member</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statsDivider, { backgroundColor: theme.badgeBorder }]} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>{currentWeight} kg</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Weight</Text>
            </View>
            <View style={[styles.statDividerVertical, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>182 cm</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Height</Text>
            </View>
            <View style={[styles.statDividerVertical, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>28 yo</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>Age</Text>
            </View>
          </View>
        </Animated.View>

        {/* Goal Summary Card */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(150)} 
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <TouchableOpacity 
            style={styles.goalCardContent}
            onPress={() => router.push('/(tabs)/goal')}
            activeOpacity={0.8}
          >
            <View style={[styles.goalIconContainer, { backgroundColor: theme.badgeBackground }]}>
              <Ionicons name="flag" size={22} color="#7EB93C" />
            </View>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalHeaderTitle, { color: theme.textMuted }]}>ACTIVE TARGET GOAL</Text>
              <Text style={[styles.goalWeightInfo, { color: theme.textPrimary }]}>
                Target: {targetWeight} kg
              </Text>
              <Text style={styles.goalDifferenceText}>
                {absWeightDiff === 0 
                  ? "Weight Maintenance" 
                  : `Maqsad: ${absWeightDiff.toFixed(1)} kg ${isLoss ? "yo'qotish" : "oshirish"} (${isLoss ? "Lose" : "Gain"} weight)`
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7EB93C" />
          </TouchableOpacity>
        </Animated.View>

        {/* Achievements Card */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)} 
          style={[styles.achievementsCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textBrand }]}>Current Streaks</Text>
          <View style={styles.streaksContainer}>
            <View style={[styles.streakItem, { backgroundColor: theme.streakBoxBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.streakIconBg, { backgroundColor: '#FFF7E6' }]}>
                <Ionicons name="flame" size={24} color="#FFA940" />
              </View>
              <Text style={[styles.streakCount, { color: theme.textPrimary }]}>5 Days</Text>
              <Text style={[styles.streakLabel, { color: theme.textMuted }]}>Calorie Target</Text>
            </View>

            <View style={[styles.streakItem, { backgroundColor: theme.streakBoxBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.streakIconBg, { backgroundColor: '#F0FAE4' }]}>
                <Ionicons name="water" size={24} color="#7EB93C" />
              </View>
              <Text style={[styles.streakCount, { color: theme.textPrimary }]}>12 Days</Text>
              <Text style={[styles.streakLabel, { color: theme.textMuted }]}>Water Intake</Text>
            </View>

            <View style={[styles.streakItem, { backgroundColor: theme.streakBoxBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.streakIconBg, { backgroundColor: '#E6F7FF' }]}>
                <Ionicons name="trending-down" size={24} color="#1890FF" />
              </View>
              <Text style={[styles.streakCount, { color: theme.textPrimary }]}>-{absWeightDiff.toFixed(1)} kg</Text>
              <Text style={[styles.streakLabel, { color: theme.textMuted }]}>Weight Loss</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu List */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(300)} 
          style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/profile-details')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: theme.menuIconBg }]}>
              <Ionicons name="person-outline" size={20} color="#7EB93C" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Personal Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.cardBorder }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/notification-settings')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: theme.menuIconBg }]}>
              <Ionicons name="notifications-outline" size={20} color="#7EB93C" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.cardBorder }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/privacy-security')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: theme.menuIconBg }]}>
              <Ionicons name="shield-outline" size={20} color="#7EB93C" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.cardBorder }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/app-preferences')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: theme.menuIconBg }]}>
              <Ionicons name="settings-outline" size={20} color="#7EB93C" />
            </View>
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>App Preferences</Text>
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
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
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
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#7EB93C',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7EB93C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDividerVertical: {
    width: 1.5,
    height: 30,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  goalWeightInfo: {
    fontSize: 15,
    fontWeight: '800',
  },
  goalDifferenceText: {
    fontSize: 12,
    color: '#7EB93C',
    fontWeight: '700',
    marginTop: 2,
  },
  achievementsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  streakItem: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
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
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
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
  },
  menuDivider: {
    height: 1,
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
