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
    
    // Meal names
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    other: 'Other',
    
    // Date formats
    todayDate: 'Today, June 11',
    yesterdayDate: 'Yesterday, June 10',
    june9: 'June 9',
    june8: 'June 8',
    june7: 'June 7',
    
    // Weekday labels
    sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat',
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
    other: 'Перекус',
    
    todayDate: 'Сегодня, 11 июня',
    yesterdayDate: 'Вчера, 10 июня',
    june9: '9 июня',
    june8: '8 июня',
    june7: '7 июня',
    
    sun: 'Вс', mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб',
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
    other: 'Tamaddi',
    
    todayDate: 'Bugun, 11-iyun',
    yesterdayDate: 'Kecha, 10-iyun',
    june9: '9-iyun',
    june8: '8-iyun',
    june7: '7-iyun',
    
    sun: 'Yak', mon: 'Dush', tue: 'Sesh', wed: 'Chor', thu: 'Pay', fri: 'Jum', sat: 'Shan',
  }
};

const HISTORY_DATA = [
  {
    date: 'Today, June 11',
    isToday: true,
    totalCalories: 864,
    goalCalories: 900,
    meals: [
      { name: 'Breakfast', food: 'Oatmeal with fruits and nuts', calories: 480, icon: '🥣' },
      { name: 'Lunch', food: 'Chops with potatoes', calories: 384, icon: '🍗' },
    ],
  },
  {
    date: 'Yesterday, June 10',
    isToday: false,
    totalCalories: 920,
    goalCalories: 900,
    meals: [
      { name: 'Breakfast', food: 'Scrambled eggs & toast', calories: 340, icon: '🍳' },
      { name: 'Lunch', food: 'Carbonara pasta', calories: 384, icon: '🍝' },
      { name: 'Dinner', food: 'Grilled salmon salad', calories: 196, icon: '🥗' },
    ],
  },
  {
    date: 'June 9',
    isToday: false,
    totalCalories: 785,
    goalCalories: 900,
    meals: [
      { name: 'Breakfast', food: 'Yogurt with granola', calories: 210, icon: '🥛' },
      { name: 'Lunch', food: 'Chicken rice bowl', calories: 440, icon: '🍚' },
      { name: 'Other', food: 'Protein bar', calories: 135, icon: '🍫' },
    ],
  },
  {
    date: 'June 8',
    isToday: false,
    totalCalories: 1050,
    goalCalories: 900,
    meals: [
      { name: 'Breakfast', food: 'Avocado toast', calories: 310, icon: '🥑' },
      { name: 'Lunch', food: 'Milano pasta', calories: 401, icon: '🍝' },
      { name: 'Dinner', food: 'Vegetable stir fry', calories: 339, icon: '🥦' },
    ],
  },
  {
    date: 'June 7',
    isToday: false,
    totalCalories: 720,
    goalCalories: 900,
    meals: [
      { name: 'Breakfast', food: 'Smoothie bowl', calories: 280, icon: '🍓' },
      { name: 'Lunch', food: 'Caesar salad', calories: 310, icon: '🥗' },
      { name: 'Other', food: 'Apple', calories: 130, icon: '🍎' },
    ],
  },
];

const WEEK_CALORIES = [720, 1050, 785, 920, 864, 0, 0];

const GOAL = 900;

export default function HistoryScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);

  useEffect(() => {
    return MockStore.subscribe(() => {
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
    });
  }, []);

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';
  const t = translations[language] || translations.en;

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

  const localizedHistoryData = HISTORY_DATA.map(day => {
    let date = day.date;
    if (day.date === 'Today, June 11') date = t.todayDate;
    else if (day.date === 'Yesterday, June 10') date = t.yesterdayDate;
    else if (day.date === 'June 9') date = t.june9;
    else if (day.date === 'June 8') date = t.june8;
    else if (day.date === 'June 7') date = t.june7;
    
    const meals = day.meals.map(meal => {
      let name = meal.name;
      if (meal.name === 'Breakfast') name = t.breakfast;
      else if (meal.name === 'Lunch') name = t.lunch;
      else if (meal.name === 'Dinner') name = t.dinner;
      else if (meal.name === 'Other') name = t.other;
      
      let food = meal.food;
      if (language === 'uz') {
        if (meal.food === 'Oatmeal with fruits and nuts') food = 'Mevalar va yong\'oqlar bilan suli bo\'tqasi';
        if (meal.food === 'Chops with potatoes') food = 'Kartoshka bilan otbivnoy';
        if (meal.food === 'Scrambled eggs & toast') food = 'Qovurilgan tuxum va tost';
        if (meal.food === 'Carbonara pasta') food = 'Karbonara pastasi';
        if (meal.food === 'Grilled salmon salad') food = 'Grilda pishirilgan losos salati';
        if (meal.food === 'Yogurt with granola') food = 'Granolali yogurt';
        if (meal.food === 'Chicken rice bowl') food = 'Tovuqli guruch idishi';
        if (meal.food === 'Protein bar') food = 'Proteinli batonchik';
        if (meal.food === 'Avocado toast') food = 'Avokadoli tost';
        if (meal.food === 'Milano pasta') food = 'Milano pastasi';
        if (meal.food === 'Vegetable stir fry') food = 'Qovurilgan sabzavotlar';
        if (meal.food === 'Smoothie bowl') food = 'Smuzi idishi';
        if (meal.food === 'Caesar salad') food = 'Sezar salati';
        if (meal.food === 'Apple') food = 'Olma';
      } else if (language === 'ru') {
        if (meal.food === 'Oatmeal with fruits and nuts') food = 'Овсянка с фруктами и орехами';
        if (meal.food === 'Chops with potatoes') food = 'Отбивные с картофелем';
        if (meal.food === 'Scrambled eggs & toast') food = 'Яичница с тостом';
        if (meal.food === 'Carbonara pasta') food = 'Паста Карбонара';
        if (meal.food === 'Grilled salmon salad') food = 'Салат с лососем гриль';
        if (meal.food === 'Yogurt with granola') food = 'Йогурт с гранолой';
        if (meal.food === 'Chicken rice bowl') food = 'Рис с курицей';
        if (meal.food === 'Protein bar') food = 'Протеиновый батончик';
        if (meal.food === 'Avocado toast') food = 'Тост с авокадо';
        if (meal.food === 'Milano pasta') food = 'Паста Милано';
        if (meal.food === 'Vegetable stir fry') food = 'Овощное рагу';
        if (meal.food === 'Smoothie bowl') food = 'Смузи боул';
        if (meal.food === 'Caesar salad') food = 'Салат Цезарь';
        if (meal.food === 'Apple') food = 'Яблоко';
      }
      return { ...meal, name, food };
    });
    
    return { ...day, date, meals };
  });

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
            {WEEK_CALORIES.map((cal, i) => {
              const hasData = cal > 0;
              const heightPct = hasData ? Math.min(cal / GOAL, 1.2) : 0;
              const isOver = cal > GOAL;
              const isToday = i === 4;
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
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>5</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.dayStreak}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.statCardBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="bar-chart" size={22} color="#7EB93C" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>868</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.avgKcal}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.statCardBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="trophy" size={22} color="#F4C344" />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>3/5</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{t.goalDays}</Text>
          </View>
        </Animated.View>

        {/* Day-by-Day Log */}
        <Text style={[styles.sectionTitle, { color: theme.textBrand }]}>{t.dailyLog}</Text>

        {localizedHistoryData.map((day, i) => {
          const isExpanded = expandedIndex === i;
          const pct = Math.min((day.totalCalories / day.goalCalories) * 100, 100);
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
                      {day.date}
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
                        <Text style={[styles.overBadgeText, { color: theme.badgeOverText }]}>+{day.totalCalories - day.goalCalories}</Text>
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
                {isExpanded && (
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
    backgroundColor: '#F7FAF3',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
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
    backgroundColor: '#F0F4EC',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
    backgroundColor: '#C8E8A0',
    bottom: '75%',
    zIndex: 1,
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barDayLabel: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 6,
    fontWeight: '500',
  },
  barDayLabelActive: {
    color: '#3A5C18',
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
    color: '#888',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A2A2A',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A5C18',
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  dayCardToday: {
    borderColor: '#7EB93C',
    backgroundColor: '#FAFEF6',
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
    color: '#888',
    marginBottom: 4,
  },
  dayDateToday: {
    color: '#7EB93C',
    fontWeight: '700',
  },
  dayCalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayCalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A2A2A',
  },
  dayCalGoal: {
    fontSize: 13,
    color: '#AAA',
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  okBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FAE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF2EA',
  },
  overBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8C42',
  },
  miniBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#EBF2E5',
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
    borderTopColor: '#F0F4EC',
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
    color: '#3A5C18',
  },
  mealFood: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  mealCal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7EB93C',
  },
});
