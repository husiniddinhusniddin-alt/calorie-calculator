import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MockStore } from '@/constants/store';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/constants/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    dailyActivity: 'Daily Activity',
    stepCount: 'Step Count',
    stepGoal: 'Step Goal',
    distance: 'Distance',
    time: 'Time',
    heart: 'Heart',
    caloriesEaten: 'Eaten',
    caloriesBurned: 'Burned',
    steps: 'Steps',
    distanceLabel: 'Distance',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    bpm: 'bpm',
    km: 'Km',
    kcal: 'kcal',
  },
  ru: {
    dailyActivity: 'Активность',
    stepCount: 'Шагов',
    stepGoal: 'Цель шагов',
    distance: 'Дистанция',
    time: 'Время',
    heart: 'Пульс',
    caloriesEaten: 'Съедено',
    caloriesBurned: 'Сожжено',
    steps: 'Шагов',
    distanceLabel: 'Дистанция',
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    bpm: 'уд/м',
    km: 'Км',
    kcal: 'ккал',
  },
  uz: {
    dailyActivity: 'Faollik',
    stepCount: 'Qadamlar',
    stepGoal: 'Qadam maqsadi',
    distance: 'Masofa',
    time: 'Vaqt',
    heart: 'Yurak',
    caloriesEaten: 'Yeyildi',
    caloriesBurned: 'Yondirildi',
    steps: 'Qadamlar',
    distanceLabel: 'Masofa',
    day: 'Kun',
    week: 'Hafta',
    month: 'Oy',
    bpm: 'ur/m',
    km: 'Km',
    kcal: 'kkal',
  },
};

// ─── Week Days ────────────────────────────────────────────────────────────────
const getWeekDays = () => {
  const today = new Date();
  const days = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
};

// ─── Circular Step Ring ───────────────────────────────────────────────────────
const StepRing = ({ steps, goal, isDark, t }: any) => {
  const size = SCREEN_WIDTH * 0.55;
  const stroke = 18;
  const totalDashes = 60;
  // Ensure we display at least a small portion if > 0, cap at 1
  const percentage = Math.min(Math.max(steps / goal, 0), 1);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Dashed ring */}
      <View style={{ position: 'absolute', width: size, height: size }}>
        {Array.from({ length: totalDashes }).map((_, i) => {
          const angle = (360 / totalDashes) * i - 90;
          const rad = (angle * Math.PI) / 180;
          const r = size / 2 - stroke / 2;
          const cx = size / 2 + r * Math.cos(rad);
          const cy = size / 2 + r * Math.sin(rad);
          const isFilled = (i / totalDashes) <= percentage && steps > 0;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 4,
                height: stroke,
                borderRadius: 2,
                backgroundColor: isFilled
                  ? '#7EB93C'
                  : isDark ? '#2A3A1E' : '#E5EDE0',
                left: cx - 2,
                top: cy - stroke / 2,
                transform: [{ rotate: `${angle + 90}deg` }],
              }}
            />
          );
        })}
      </View>

      {/* Center text */}
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.ringSteps, { color: isDark ? '#FAFCF8' : '#1A1A1A' }]}>
          {steps.toLocaleString()}
        </Text>
        <Text style={[styles.ringLabel, { color: isDark ? '#9AA88E' : '#666' }]}>{t.stepCount}</Text>
        <Text style={[styles.ringGoal, { color: isDark ? '#6B785E' : '#999' }]}>
          {t.stepGoal}: {goal.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

// ─── Route Map ────────────────────────────────────────────────────────────────
const RouteMap = ({ isDark }: { isDark: boolean }) => {
  const mapBg = isDark ? '#1A2310' : '#EAF3E0';
  const roadColor = isDark ? '#2A3A20' : '#C8DDB8';
  const routeColor = '#7EB93C';

  return (
    <View style={[styles.mapContainer, { backgroundColor: mapBg }]}>
      {/* Road grid lines */}
      {[0.2, 0.4, 0.6, 0.8].map((f) => (
        <View key={`h${f}`} style={[styles.roadH, { top: `${f * 100}%`, backgroundColor: roadColor }]} />
      ))}
      {[0.15, 0.35, 0.55, 0.75, 0.9].map((f) => (
        <View key={`v${f}`} style={[styles.roadV, { left: `${f * 100}%`, backgroundColor: roadColor }]} />
      ))}

      {/* Route dashed line */}
      {Array.from({ length: 18 }).map((_, i) => {
        const progress = i / 17;
        const x = 0.12 + progress * 0.72;
        const y = 0.82 - progress * 0.62 + Math.sin(progress * Math.PI) * 0.18;
        return (
          <View
            key={`dot${i}`}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#FFFFFF',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              opacity: 0.9,
            }}
          />
        );
      })}

      {/* Start pin */}
      <View style={[styles.mapPin, { left: '11%', bottom: '14%', backgroundColor: '#FFFFFF' }]}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: routeColor }} />
      </View>

      {/* End pin */}
      <View style={[styles.mapPinEnd, { right: '14%', top: '12%' }]}>
        <Ionicons name="location" size={24} color={routeColor} />
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PedometerScreen() {
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);
  const [userName] = useState(MockStore.name);
  const [userId, setUserId] = useState<string | null>(null);

  const [stepHistory, setStepHistory] = useState<Record<string, number>>({});
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [debugMsg, setDebugMsg] = useState('Init...');

  const [selectedDayIdx, setSelectedDayIdx] = useState(2); // index 2 is Today
  const [activeMode, setActiveMode] = useState(0); // 0=Day, 1=Week, 2=Month

  useEffect(() => {
    return MockStore.subscribe(() => {
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
    });
  }, []);

  // 1. Ask permissions & initialize Pedometer
  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;
    const todayStr = new Date().toISOString().split('T')[0];

    const initPedometer = async () => {
      try {
        // Permissions
        const locPerm = await Location.getForegroundPermissionsAsync();
        if (!locPerm.granted && locPerm.canAskAgain) {
          await Location.requestForegroundPermissionsAsync();
        }
        
        let pedPerm = await Pedometer.getPermissionsAsync();
        let pStatus = pedPerm.granted ? 'OK' : 'Deny';
        if (!pedPerm.granted && pedPerm.canAskAgain) {
          pedPerm = await Pedometer.requestPermissionsAsync();
          pStatus = pedPerm.granted ? 'OK(asked)' : 'Deny(asked)';
        }

        // Start Pedometer
        const isAvailable = await Pedometer.isAvailableAsync();
        setDebugMsg(`Perm: ${pStatus} | Avail: ${isAvailable}`);

        // Load History
        const historyStr = await AsyncStorage.getItem('pedometer_history');
        const loadedHistory = historyStr ? JSON.parse(historyStr) : {};
        setStepHistory(loadedHistory);

        if (isAvailable) {
          let baseSteps = loadedHistory[todayStr] || 0;
          try {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            const past = await Pedometer.getStepCountAsync(start, end);
            if (past && past.steps !== undefined) {
               baseSteps = past.steps;
            }
          } catch (e) {
            // fallback to stored history on error
          }
          setPastStepCount(baseSteps);

          subscription = Pedometer.watchStepCount(result => {
            setCurrentStepCount(result.steps);
            setDebugMsg(prev => prev.split(' | Live:')[0] + ` | Live: ${result.steps}`);
          });
        }
      } catch (err: any) {
        setDebugMsg(`Err: ${err.message}`);
      }
    };

    initPedometer();

    return () => {
      subscription?.remove();
    };
  }, []);

  // 2. Save total steps for today when it updates
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTodaySteps = pastStepCount + currentStepCount;

  useEffect(() => {
    if (totalTodaySteps > 0) {
      setStepHistory(prev => {
        const currentVal = prev[todayStr] || 0;
        const newVal = Math.max(currentVal, totalTodaySteps);
        if (newVal !== currentVal) {
          const updated = { ...prev, [todayStr]: newVal };
          AsyncStorage.setItem('pedometer_history', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });

      // Sync to Supabase backend
      if (userId) {
        const syncTimeout = setTimeout(async () => {
          const { data } = await supabase
            .from('diary_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('date', todayStr)
            .eq('meal_type', 'steps_history')
            .single();

          if (data) {
            await supabase
              .from('diary_entries')
              .update({ calories: totalTodaySteps })
              .eq('id', data.id);
          } else {
            await supabase
              .from('diary_entries')
              .insert({
                user_id: userId,
                date: todayStr,
                meal_type: 'steps_history',
                calories: totalTodaySteps,
                items: JSON.stringify(['steps_sync'])
              });
          }
        }, 5000); // 5 sec debounce
        return () => clearTimeout(syncTimeout);
      }
    }
  }, [totalTodaySteps, todayStr, userId]);

  // 2b. Fetch historical steps from Supabase backend
  useEffect(() => {
    if (!userId) return;
    const fetchStepHistory = async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('date, calories')
        .eq('user_id', userId)
        .eq('meal_type', 'steps_history');

      if (data && !error) {
        setStepHistory(prev => {
          const newHistory = { ...prev };
          let changed = false;
          data.forEach((row: any) => {
            if ((newHistory[row.date] || 0) < row.calories) {
              newHistory[row.date] = row.calories;
              changed = true;
            }
          });
          if (changed) {
            AsyncStorage.setItem('pedometer_history', JSON.stringify(newHistory));
            return newHistory;
          }
          return prev;
        });
      }
    };
    fetchStepHistory();
  }, [userId]);

  // 3. Fetch calories eaten from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchEaten = async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('calories')
        .eq('user_id', userId)
        .eq('date', todayStr);
        
      if (data && !error) {
         const total = data.reduce((s: number, m: any) => s + (m.calories || 0), 0);
         setCaloriesEaten(total);
      }
    };
    fetchEaten();
  }, [userId, todayStr]);

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';
  const t = translations[language as keyof typeof translations] || translations.en;

  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A1A1A',
    textSecondary: isDark ? '#9AA88E' : '#555',
    textMuted: isDark ? '#6B785E' : '#888',
    pillBackground: isDark ? '#23321A' : '#F5FAF0',
  };

  const weekDays = getWeekDays();
  const modes = [t.day, t.week, t.month];

  // Helper to sum steps over a period
  const getPeriodSteps = (period: number) => {
    if (period === 0) return totalTodaySteps;
    const daysToSum = period === 1 ? 7 : 30;
    let sum = 0;
    const today = new Date();
    for(let i=0; i<daysToSum; i++) {
       const d = new Date(today);
       d.setDate(d.getDate() - i);
       const dStr = d.toISOString().split('T')[0];
       if (i === 0) sum += totalTodaySteps;
       else sum += (stepHistory[dStr] || 0);
    }
    return sum;
  };

  // Determine what to display based on selected Day
  const selectedDateObj = new Date();
  selectedDateObj.setDate(selectedDateObj.getDate() + (selectedDayIdx - 2));
  const selectedDateString = selectedDateObj.toISOString().split('T')[0];
  
  const isSelectedToday = selectedDayIdx === 2;
  
  let displaySteps = 0;
  let displayGoal = 10000;

  if (isSelectedToday) {
    displaySteps = getPeriodSteps(activeMode);
    displayGoal = 10000 * (activeMode === 0 ? 1 : activeMode === 1 ? 7 : 30);
  } else {
    displaySteps = stepHistory[selectedDateString] || 0;
    displayGoal = 10000;
  }

  // Derived metrics
  const activeDistance = (displaySteps * 0.000762).toFixed(2);
  const activeMinutes = Math.round(displaySteps / 100);
  const activeHours = Math.floor(activeMinutes / 60);
  const activeMins = activeMinutes % 60;
  const activeTimeStr = `${activeHours}:${activeMins.toString().padStart(2, '0')}`;
  const activeCaloriesBurned = Math.round(displaySteps * 0.04);
  const heartRate = 92; // Mock heart rate

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerDate, { color: theme.textMuted }]}>
                {selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.dailyActivity}</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: theme.pillBackground }]}>
              <Text style={styles.avatarText}>
                {userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>
          {/* DEBUG INFO */}
          <Text style={{fontSize: 10, color: 'red', marginTop: 4}}>{debugMsg}</Text>
        </Animated.View>

        {/* ── Week Day Selector ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.weekRow}>
          {weekDays.map((d, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDayIdx(i)}
              style={[
                styles.dayBtn,
                { borderColor: theme.cardBorder, backgroundColor: theme.cardBackground },
                selectedDayIdx === i && styles.dayBtnActive,
              ]}
            >
              <Text style={[styles.dayName, { color: theme.textMuted }, selectedDayIdx === i && styles.dayNameActive]}>
                {d.day}
              </Text>
              <Text style={[styles.dayDate, { color: theme.textPrimary }, selectedDayIdx === i && styles.dayDateActive]}>
                {d.date}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── Step Ring Card ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(120)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <StepRing steps={displaySteps} goal={displayGoal} isDark={isDark} t={t} />
          </View>

          {/* ── 3 stats below ring ── */}
          <View style={[styles.statsRow, { borderTopColor: theme.cardBorder }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.distance}</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{activeDistance} <Text style={styles.statUnit}>{t.km}</Text></Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.time}</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{activeTimeStr}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.heart}</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{heartRate} <Text style={styles.statUnit}>{t.bpm}</Text></Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Activity Mode Tabs (Only visible when Today is selected) ── */}
        {isSelectedToday && (
          <Animated.View entering={FadeInDown.duration(400).delay(180)} style={[styles.modeTabs, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            {modes.map((m, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveMode(i)}
                style={[styles.modeTab, activeMode === i && styles.modeTabActive]}
              >
                <Text style={[styles.modeTabText, { color: theme.textMuted }, activeMode === i && styles.modeTabTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* ── Route Map Card ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(240)}
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, overflow: 'hidden', padding: 0 }]}
        >
          <RouteMap isDark={isDark} />
        </Animated.View>

        {/* ── Stats Grid (2×2) ── */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.gridRow}>
          {/* Eaten */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.gridIconRow}>
              <View style={[styles.gridIconBg, { backgroundColor: '#F4C34422' }]}>
                <Ionicons name="restaurant" size={18} color="#F4C344" />
              </View>
            </View>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{t.caloriesEaten}</Text>
            <Text style={[styles.gridValue, { color: theme.textPrimary }]}>
              {isSelectedToday ? caloriesEaten : 0} <Text style={styles.gridUnit}>{t.kcal}</Text>
            </Text>
          </View>

          {/* Burned */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.gridIconRow}>
              <View style={[styles.gridIconBg, { backgroundColor: '#E8A86F22' }]}>
                <Ionicons name="flame" size={18} color="#E8A86F" />
              </View>
            </View>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{t.caloriesBurned}</Text>
            <Text style={[styles.gridValue, { color: theme.textPrimary }]}>
              {activeCaloriesBurned} <Text style={styles.gridUnit}>{t.kcal}</Text>
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(360)} style={styles.gridRow}>
          {/* Steps */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.gridIconRow}>
              <View style={[styles.gridIconBg, { backgroundColor: '#7EB93C22' }]}>
                <Ionicons name="footsteps" size={18} color="#7EB93C" />
              </View>
            </View>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{t.steps}</Text>
            <Text style={[styles.gridValue, { color: theme.textPrimary }]}>
              {displaySteps.toLocaleString()}
            </Text>
          </View>

          {/* Distance */}
          <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.gridIconRow}>
              <View style={[styles.gridIconBg, { backgroundColor: '#A8A4D822' }]}>
                <Ionicons name="location" size={18} color="#A8A4D8" />
              </View>
            </View>
            <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{t.distanceLabel}</Text>
            <Text style={[styles.gridValue, { color: theme.textPrimary }]}>
              {activeDistance} <Text style={styles.gridUnit}>{t.km}</Text>
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7EB93C',
  },

  // Week days
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dayBtnActive: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayNameActive: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '800',
  },
  dayDateActive: {
    color: '#FFFFFF',
  },

  // Card
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },

  // Ring stats row
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    marginTop: 16,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1.5,
    height: 40,
    alignSelf: 'center',
  },

  // Ring text
  ringSteps: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  ringLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  ringGoal: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Mode tabs
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#7EB93C',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },

  // Map
  mapContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    opacity: 0.5,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    opacity: 0.5,
  },
  mapPin: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapPinEnd: {
    position: 'absolute',
  },

  // 2×2 stat grid
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  gridIconRow: {
    marginBottom: 10,
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gridUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
});
