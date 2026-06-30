import { MockStore } from '@/constants/store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const translations = {
  en: {
    myProfile: 'My Profile', weight: 'Weight', height: 'Height', age: 'Age', activeTargetGoal: 'ACTIVE TARGET GOAL', target: 'Target',
    weightMaintenance: 'Weight Maintenance', goalPrefix: 'Goal:', loseWeight: 'Lose weight', gainWeight: 'Gain weight',
    currentStreaks: 'Current Streaks', calorieTarget: 'Calorie Target', waterIntake: 'Water Intake', weightLoss: 'Weight Loss',
    personalDetails: 'Personal Details', notificationSettings: 'Notification Settings', privacySecurity: 'Privacy & Security', appPreferences: 'App Preferences',
    logOut: 'Log Out', days: 'Days', confirmLogout: 'Log Out', areYouSureLogout: 'Are you sure you want to log out?', cancel: 'Cancel', yes: 'Yes', dayStreak: 'Day streak', avgKcal: 'Avg kcal / day', goalDays: 'Goal days'
  },
  ru: {
    myProfile: 'Мой профиль', weight: 'Вес', height: 'Рост', age: 'Возраст', activeTargetGoal: 'АКТИВНАЯ ЦЕЛЬ', target: 'Цель',
    weightMaintenance: 'Поддержание веса', goalPrefix: 'Цель:', loseWeight: 'Сбросить вес', gainWeight: 'Набрать вес',
    currentStreaks: 'Текущие серии', calorieTarget: 'Цель по калориям', waterIntake: 'Потребление воды', weightLoss: 'Потеря веса',
    personalDetails: 'Личные данные', notificationSettings: 'Настройки уведомлений', privacySecurity: 'Конфиденциальность', appPreferences: 'Настройки',
    logOut: 'Выйти', days: 'Дней', confirmLogout: 'Выход', areYouSureLogout: 'Вы уверены, что хотите выйти?', cancel: 'Отмена', yes: 'Да', dayStreak: 'Серия дней', avgKcal: 'Среднее ккал/день', goalDays: 'Дни цели'
  },
  uz: {
    myProfile: 'Mening profilim', weight: 'Vazn', height: 'Bo\'yi', age: 'Yosh', activeTargetGoal: 'FAOL MAQSAD', target: 'Maqsad',
    weightMaintenance: 'Vaznni saqlash', goalPrefix: 'Maqsad:', loseWeight: 'yo\'qotish', gainWeight: 'oshirish',
    currentStreaks: 'Hozirgi seriyalar', calorieTarget: 'Kaloriya maqsadi', waterIntake: 'Suv ichish', weightLoss: 'Vazn yo\'qotish',
    personalDetails: 'Shaxsiy ma\'lumotlar', notificationSettings: 'Bildirishnomalar', privacySecurity: 'Maxfiylik', appPreferences: 'Ilova sozlamalari',
    logOut: 'Chiqish', days: 'Kun', confirmLogout: 'Chiqish', areYouSureLogout: 'Haqiqatan ham tizimdan chiqmoqchimisiz?', cancel: 'Bekor qilish', yes: 'Ha', dayStreak: 'Kunlik seriya', avgKcal: 'O\'rtacha kkal', goalDays: 'Maqsadli kunlar'
  }
};

import { supabase } from '@/constants/supabase';

export default function ProfileScreen() {
  const router = useRouter();

  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);
  const [name, setName] = useState<string>(MockStore.name);
  const [email, setEmail] = useState<string>(MockStore.email);
  const t = translations[language];

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';

  // Theme Colors
  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
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

  const [profileImage, setProfileImage] = useState<string | null>(MockStore.profileImage);
  const [targetWeight, setTargetWeight] = useState<number>(MockStore.targetWeight);
  const [currentWeight, setCurrentWeight] = useState<number>(MockStore.currentWeight);
  const [age, setAge] = useState<number | null>(MockStore.age);
  const [height, setHeight] = useState<number | null>(MockStore.height);
  const [calorieStreak, setCalorieStreak] = useState<number>(MockStore.calorieStreak);
  const [waterStreak, setWaterStreak] = useState<number>(MockStore.waterStreak);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(MockStore.weightUnit);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>(MockStore.heightUnit);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const insets = useSafeAreaInsets();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [avgKcal, setAvgKcal] = useState(0);
  const [goalDays, setGoalDays] = useState('0/1');
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        setIsLoadingStats(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        const last7Days: string[] = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          last7Days.push(d.toISOString().split('T')[0]);
        }

        const { data } = await supabase
          .from('diary_entries')
          .select('date, calories')
          .eq('user_id', userData.user.id)
          .in('date', last7Days)
          .neq('meal_type', 'steps_history');

        const grouped: Record<string, number> = {};
        last7Days.forEach(d => grouped[d] = 0);

        if (data) {
          data.forEach(entry => {
            if (grouped[entry.date] !== undefined) {
              grouped[entry.date] += (entry.calories || 0);
            }
          });
        }

        const dailyGoal = MockStore.dailyCalorieGoal || 1900;
        const validDays = last7Days.map(d => grouped[d]).filter(cal => cal > 0);
        
        const avg = validDays.length ? Math.round(validDays.reduce((sum, c) => sum + c, 0) / validDays.length) : 0;
        const goalCount = validDays.filter(c => c <= dailyGoal).length;
        
        let streak = 0;
        for (let i = 0; i < last7Days.length; i++) {
          const cals = grouped[last7Days[i]];
          if (cals > 0 && cals <= dailyGoal) {
            streak++;
          } else if (i !== 0 || grouped[last7Days[0]] > 0) {
            break;
          }
        }

        setAvgKcal(avg);
        setGoalDays(`${goalCount}/${validDays.length || 1}`);
        setCurrentStreak(streak);
        setIsLoadingStats(false);
      };

      loadStats();
    }, [])
  );

  // Subscribe to MockStore updates
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        MockStore.update({
          name: data.name || MockStore.name,
          email: data.email || MockStore.email,
          profileImage: data.profile_image || MockStore.profileImage,
          targetWeight: data.target_weight || MockStore.targetWeight,
          currentWeight: data.current_weight || MockStore.currentWeight,
          age: data.age || MockStore.age,
          height: data.height || MockStore.height,
        });
      }
    };
    fetchProfile();

    return MockStore.subscribe(() => {
      setProfileImage(MockStore.profileImage);
      setTargetWeight(MockStore.targetWeight);
      setCurrentWeight(MockStore.currentWeight);
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
      setName(MockStore.name);
      setEmail(MockStore.email);
      setAge(MockStore.age);
      setHeight(MockStore.height);
      setCalorieStreak(MockStore.calorieStreak);
      setWaterStreak(MockStore.waterStreak);
      setWeightUnit(MockStore.weightUnit);
      setHeightUnit(MockStore.heightUnit);
    });
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(false);
    setLogoutModalVisible(true);
  };

  const confirmLogoutAction = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // Reset MockStore values
      MockStore.update({
        profileImage: null,
        targetWeight: 82,
        currentWeight: 85,
        startingWeight: 88,
        dailyCalorieGoal: 1900,
        weeklyWeightGoal: 0.5,
        name: 'Alex Green',
        email: 'alex.green@health.com',
        age: null,
        height: null,
      });
      setLogoutModalVisible(false);
      router.replace('/(auth)/login');
    } catch (err) {
      console.warn('Sign out error:', err);
      setLogoutModalVisible(false);
      router.replace('/(auth)/login');
    } finally {
      setIsLoggingOut(false);
    }
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

      // Update image url in Supabase profiles table
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({
            profile_image: selectedUri,
          }).eq('id', user.id);
        }
      } catch (err) {
        console.warn('Failed to update avatar in DB:', err);
      }
    }
  };

  // Goal calculations
  const weightDiff = MockStore.startingWeight - currentWeight;
  const isLoss = weightDiff >= 0;
  const absWeightDiff = Math.abs(weightDiff);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.textBrand }]}>{t.myProfile}</Text>
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
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>{name}</Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{email}</Text>
            </View>
          </View>

          <View style={[styles.statsDivider, { backgroundColor: theme.badgeBorder }]} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>{currentWeight} {weightUnit}</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>{t.weight}</Text>
            </View>
            <View style={[styles.statDividerVertical, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>{height ? `${height} ${heightUnit === 'inches' ? 'in' : heightUnit}` : '--'}</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>{t.height}</Text>
            </View>
            <View style={[styles.statDividerVertical, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>{age ? age : '--'}</Text>
              <Text style={[styles.statLbl, { color: theme.textMuted }]}>{t.age}</Text>
            </View>
          </View>
        </Animated.View>




        {/* Weekly Stats */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.statsRowProfile}>
          <View style={[styles.statCardProfile, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Ionicons name="flame" size={22} color={isLoadingStats ? theme.cardBorder : "#FF8C42"} />
            {isLoadingStats ? (
              <View style={[styles.skeletonBlock, { backgroundColor: theme.cardBorder, width: 30 }]} />
            ) : (
              <Text style={[styles.statValueProfile, { color: theme.textPrimary }]}>{currentStreak}</Text>
            )}
            <Text style={[styles.statLabelProfile, { color: theme.textMuted }]}>{t.dayStreak}</Text>
          </View>
          <View style={[styles.statCardProfile, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Ionicons name="bar-chart" size={22} color={isLoadingStats ? theme.cardBorder : "#7EB93C"} />
            {isLoadingStats ? (
              <View style={[styles.skeletonBlock, { backgroundColor: theme.cardBorder, width: 50 }]} />
            ) : (
              <Text style={[styles.statValueProfile, { color: theme.textPrimary }]}>{avgKcal}</Text>
            )}
            <Text style={[styles.statLabelProfile, { color: theme.textMuted }]}>{t.avgKcal}</Text>
          </View>
          <View style={[styles.statCardProfile, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Ionicons name="trophy" size={22} color={isLoadingStats ? theme.cardBorder : "#F4C344"} />
            {isLoadingStats ? (
              <View style={[styles.skeletonBlock, { backgroundColor: theme.cardBorder, width: 40 }]} />
            ) : (
              <Text style={[styles.statValueProfile, { color: theme.textPrimary }]}>{goalDays}</Text>
            )}
            <Text style={[styles.statLabelProfile, { color: theme.textMuted }]}>{t.goalDays}</Text>
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
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>{t.personalDetails}</Text>
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
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>{t.privacySecurity}</Text>
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
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>{t.appPreferences}</Text>
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
            <Text style={styles.logoutBtnText}>{t.logOut}</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>


      {/* Custom Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { if (!isLoggingOut) setLogoutModalVisible(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: '#FFF2F2' }]}>
              <Ionicons name="log-out-outline" size={28} color="#FF4D4F" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t.confirmLogout}</Text>
            <Text style={[styles.modalMessage, { color: theme.textMuted }]}>{t.areYouSureLogout}</Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textPrimary }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={confirmLogoutAction}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmBtnText}>{t.yes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  statsRowProfile: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCardProfile: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
  },
  statValueProfile: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabelProfile: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  skeletonBlock: {
    height: 24,
    borderRadius: 6,
    marginVertical: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  modalConfirmBtn: {
    backgroundColor: '#FF4D4F',
  },
  modalCancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
