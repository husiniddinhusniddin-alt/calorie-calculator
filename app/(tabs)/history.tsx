import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MockStore } from '@/constants/store';
import { supabase } from '@/constants/supabase';
import { useFocusEffect } from '@react-navigation/native';

const translations = {
  en: {
    historyTitle: 'History',
    thisWeek: 'This week',
    underGoal: 'Under goal',
    overGoal: 'Over goal',
    today: 'Today',
    dayStreak: 'Day streak',
    avgKcal: 'Avg kcal / day',
    goalDays: 'Goal days',
    dailyLog: 'Daily Log',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    other: 'Other',
    sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat',
    todayLabel: 'Today, ',
    yesterdayLabel: 'Yesterday, '
  },
  ru: {
    historyTitle: 'История',
    thisWeek: 'На этой неделе',
    underGoal: 'Ниже цели',
    overGoal: 'Выше цели',
    today: 'Сегодня',
    dayStreak: 'Серия дней',
    avgKcal: 'Среднее ккал / день',
    goalDays: 'Дни цели',
    dailyLog: 'Ежедневный лог',
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
    other: 'Другое',
    sun: 'Вс', mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб',
    todayLabel: 'Сегодня, ',
    yesterdayLabel: 'Вчера, '
  },
  uz: {
    historyTitle: 'Tarix',
    thisWeek: 'Shu hafta',
    underGoal: 'Maqsaddan kam',
    overGoal: 'Maqsaddan ko\'p',
    today: 'Bugun',
    dayStreak: 'Kunlik seriya',
    avgKcal: 'O\'rtacha kkal / kun',
    goalDays: 'Maqsadli kunlar',
    dailyLog: 'Kunlik jurnal',
    breakfast: 'Nonushta',
    lunch: 'Tushlik',
    dinner: 'Kechki ovqat',
    snack: 'Tamaddi',
    other: 'Boshqa',
    sun: 'Yak', mon: 'Dush', tue: 'Sesh', wed: 'Chor', thu: 'Pay', fri: 'Jum', sat: 'Shan',
    todayLabel: 'Bugun, ',
    yesterdayLabel: 'Kecha, '
  }
};

type MealItem = {
  name: string;
  food: string;
  calories: number;
  icon: string;
};

type DayHistory = {
  dateObj: Date;
  dateStr: string;
  displayDate: string;
  isToday: boolean;
  totalCalories: number;
  goalCalories: number;
  meals: MealItem[];
};

export default function HistoryScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(MockStore.dailyCalorieGoal || 1900);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<DayHistory[]>([]);
  const [weekCalories, setWeekCalories] = useState<number[]>([]);

  useEffect(() => {
    return MockStore.subscribe(() => {
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
      setDailyCalorieGoal(MockStore.dailyCalorieGoal);
    });
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  const t = translations[language as keyof typeof translations] || translations.en;

  const loadHistoryFromDB = async () => {
    if (!userId) return;

    // Build the last 7 days array
    const last7Days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .in('date', last7Days)
      .neq('meal_type', 'steps_history'); // exclude pedometer syncs

    if (error) {
      console.error('Error fetching history:', error);
      return;
    }

    // Process data into grouped format
    const grouped: Record<string, DayHistory> = {};
    
    last7Days.forEach((dateStr, i) => {
      const d = new Date(dateStr);
      let displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (i === 0) displayDate = t.todayLabel + displayDate;
      else if (i === 1) displayDate = t.yesterdayLabel + displayDate;

      grouped[dateStr] = {
        dateObj: d,
        dateStr: dateStr,
        displayDate,
        isToday: i === 0,
        totalCalories: 0,
        goalCalories: dailyCalorieGoal,
        meals: [],
      };
    });

    if (data) {
      data.forEach((entry: any) => {
        const day = grouped[entry.date];
        if (day) {
          day.totalCalories += (entry.calories || 0);
          
          let icon = '🍽️';
          if (entry.meal_type === 'breakfast') icon = '🍳';
          if (entry.meal_type === 'lunch') icon = '🥗';
          if (entry.meal_type === 'dinner') icon = '🥩';
          if (entry.meal_type === 'snack') icon = '🍎';

          let itemsDesc = '';
          if (typeof entry.items === 'string') {
            try {
              const parsed = JSON.parse(entry.items);
              itemsDesc = parsed.map((it: any) => it.name).join(', ');
            } catch (e) {}
          }

          if (entry.calories > 0 || itemsDesc !== '') {
            day.meals.push({
              name: t[entry.meal_type as keyof typeof t] || entry.meal_type,
              food: itemsDesc || 'Added calories',
              calories: entry.calories,
              icon
            });
          }
        }
      });
    }

    const sortedData = last7Days.map(d => grouped[d]);
    setHistoryData(sortedData);

    // weekCalories for chart (Sun to Sat ordering)
    const weekCals = [0,0,0,0,0,0,0];
    sortedData.forEach(d => {
      const dayOfWeek = d.dateObj.getDay(); // 0 (Sun) to 6 (Sat)
      weekCals[dayOfWeek] = d.totalCalories;
    });
    setWeekCalories(weekCals);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHistoryFromDB();
    }, [userId, dailyCalorieGoal, language])
  );

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';

  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A2310',
    textBrand: isDark ? '#8CC33F' : '#3A5C18',
    textMuted: isDark ? '#9AA88E' : '#6B785E',
    barTrackBg: isDark ? '#1D2814' : '#F0F4EC',
    statCardBg: isDark ? '#171E10' : '#FFFFFF',
    dayCardTodayBg: isDark ? '#1A2A12' : '#FAFEF6',
    dayCardTodayBorder: isDark ? '#8CC33F' : '#7EB93C',
    dividerColor: isDark ? '#2A3A1E' : '#F0F4EC',
    badgeOkBg: isDark ? '#23321A' : '#F0FAE4',
    badgeOverBg: isDark ? '#3D2214' : '#FFF2EA',
    badgeOverText: isDark ? '#FF9E66' : '#FF8C42',
  };

  const toggleExpand = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  const weekLabelsMapped = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat];
  const todayIndex = new Date().getDay();

  // Calculate streaks & averages
  const validDays = historyData.filter(d => d.totalCalories > 0);
  const avgKcal = validDays.length ? Math.round(validDays.reduce((sum, d) => sum + d.totalCalories, 0) / validDays.length) : 0;
  const goalDaysCount = validDays.filter(d => d.totalCalories <= d.goalCalories).length;
  
  let currentStreak = 0;
  for (let i = 0; i < historyData.length; i++) {
    if (historyData[i].totalCalories > 0 && historyData[i].totalCalories <= historyData[i].goalCalories) {
      currentStreak++;
    } else if (i !== 0 || historyData[0].totalCalories > 0) {
      break;
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.pageTitle, { color: theme.textBrand }]}>{t.historyTitle}</Text>
        </Animated.View>

        {/* Weekly Summary Chart */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)} style={[styles.chartCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={[styles.chartTitle, { color: theme.textMuted }]}>{t.thisWeek}</Text>
          <View style={styles.barsContainer}>
            {weekCalories.map((cal, i) => {
              const hasData = cal > 0;
              const heightPct = hasData ? Math.min(cal / dailyCalorieGoal, 1.2) : 0;
              const isOver = cal > dailyCalorieGoal;
              const isToday = i === todayIndex;
              return (
                <View key={i} style={styles.barCol}>
                  {hasData && (
                    <Text style={styles.barCalLabel}>{cal}</Text>
                  )}
                  <View style={[styles.barTrack, { backgroundColor: theme.barTrackBg }]}>
                    {/* Goal line marker */}
                    <View style={[styles.goalLine, { backgroundColor: isDark ? '#374B2A' : '#C8E8A0' }]} />
                    {hasData && (
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.min(heightPct * 100, 110)}%`,
                            backgroundColor: isOver ? '#FF8C42' : isToday ? theme.textBrand : '#7EB93C',
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={[styles.barDayLabel, { color: theme.textMuted }, isToday && [styles.barDayLabelActive, { color: theme.textBrand }]]}>
                    {weekLabelsMapped[i]}
                  </Text>
                </View>
              );
            })}
          </View>
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7EB93C' }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>{t.underGoal}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>{t.overGoal}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: isDark ? '#8CC33F' : '#3A5C18' }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>{t.today}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Avg + Streak Stats */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.statCardBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="flame" size={22} color="#FF8C42" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.dayStreak}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.statCardBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="bar-chart" size={22} color="#7EB93C" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{avgKcal}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.avgKcal}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.statCardBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="trophy" size={22} color="#F4C344" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{goalDaysCount}/{validDays.length || 1}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.goalDays}</Text>
          </View>
        </Animated.View>

        {/* Day-by-Day Log */}
        <Text style={[styles.sectionTitle, { color: theme.textBrand }]}>{t.dailyLog}</Text>

        {historyData.map((day, i) => {
          const isExpanded = expandedIndex === i;
          const pct = day.goalCalories > 0 ? Math.min((day.totalCalories / day.goalCalories) * 100, 100) : 0;
          const isOver = day.totalCalories > day.goalCalories;

          return (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(500).delay(220 + i * 70)}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleExpand(i)}
                style={[
                  styles.dayCard, 
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                  day.isToday && [styles.dayCardToday, { backgroundColor: theme.dayCardTodayBg, borderColor: theme.dayCardTodayBorder }]
                ]}
              >
                {/* Day Header row */}
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={[styles.dayDate, { color: theme.textMuted }, day.isToday && [styles.dayDateToday, { color: theme.textBrand }]]}>
                      {day.displayDate}
                    </Text>
                    <View style={styles.dayCalRow}>
                      <Text style={[styles.dayCalValue, { color: theme.textPrimary }, isOver && { color: theme.badgeOverText }]}>
                        {day.totalCalories} kcal
                      </Text>
                      <Text style={[styles.dayCalGoal, { color: theme.textMuted }]}> / {day.goalCalories}</Text>
                    </View>
                  </View>
                  <View style={styles.dayRight}>
                    {isOver ? (
                      <View style={[styles.overBadge, { backgroundColor: theme.badgeOverBg }]}>
                        <Text style={[styles.overBadgeText, { color: theme.badgeOverText }]}>+{(day.totalCalories - day.goalCalories).toFixed(0)}</Text>
                      </View>
                    ) : (
                      <View style={[styles.okBadge, { backgroundColor: theme.badgeOkBg }]}>
                        <Ionicons name="checkmark" size={14} color="#7EB93C" />
                      </View>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.textMuted}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>

                {/* Mini progress bar */}
                <View style={[styles.miniBarBg, { backgroundColor: theme.cardBorder }]}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: isOver ? '#FF8C42' : '#7EB93C',
                      },
                    ]}
                  />
                </View>

                {/* Expanded Meal List */}
                {isExpanded && day.meals.length > 0 && (
                  <View style={styles.mealList}>
                    {day.meals.map((meal, mi) => (
                      <View key={mi} style={[styles.mealRow, { borderTopColor: theme.dividerColor }]}>
                        <Text style={styles.mealEmoji}>{meal.icon}</Text>
                        <View style={styles.mealInfo}>
                          <Text style={[styles.mealName, { color: theme.textBrand }]}>{meal.name}</Text>
                          <Text style={[styles.mealFood, { color: theme.textMuted }]}>{meal.food}</Text>
                        </View>
                        <Text style={[styles.mealCal, { color: theme.textBrand }]}>{meal.calories} kcal</Text>
                      </View>
                    ))}
                  </View>
                )}
                {isExpanded && day.meals.length === 0 && (
                  <View style={styles.mealList}>
                    <Text style={{color: theme.textMuted, fontSize: 13, textAlign: 'center', marginTop: 10}}>No meals logged.</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
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
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barCalLabel: {
    fontSize: 9,
    color: '#AAA',
    marginBottom: 3,
  },
  barTrack: {
    width: 22,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
    bottom: '75%',
    zIndex: 1,
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barDayLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  barDayLabelActive: {
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dayCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  dayCardToday: {
    borderWidth: 1.5,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayDateToday: {
    fontWeight: '700',
  },
  dayCalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayCalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  dayCalGoal: {
    fontSize: 13,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  okBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  overBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  miniBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  mealList: {
    marginTop: 14,
    gap: 10,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealFood: {
    fontSize: 12,
    marginTop: 2,
  },
  mealCal: {
    fontSize: 13,
    fontWeight: '700',
  },
});
