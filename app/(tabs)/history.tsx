import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

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
const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GOAL = 900;

export default function HistoryScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.pageTitle}>History</Text>
        </Animated.View>

        {/* Weekly Summary Chart */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>This week</Text>
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
                  <View style={styles.barTrack}>
                    {/* Goal line marker */}
                    <View style={styles.goalLine} />
                    {hasData && (
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.min(heightPct * 100, 110)}%`,
                            backgroundColor: isOver ? '#FF8C42' : isToday ? '#3A5C18' : '#7EB93C',
                          },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={[styles.barDayLabel, isToday && styles.barDayLabelActive]}>
                    {WEEK_LABELS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#7EB93C' }]} />
              <Text style={styles.legendText}>Under goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
              <Text style={styles.legendText}>Over goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3A5C18' }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </Animated.View>

        {/* Avg + Streak Stats */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={22} color="#FF8C42" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bar-chart" size={22} color="#7EB93C" />
            <Text style={styles.statValue}>868</Text>
            <Text style={styles.statLabel}>Avg kcal / day</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={22} color="#F4C344" />
            <Text style={styles.statValue}>3/5</Text>
            <Text style={styles.statLabel}>Goal days</Text>
          </View>
        </Animated.View>

        {/* Day-by-Day Log */}
        <Text style={styles.sectionTitle}>Daily Log</Text>

        {HISTORY_DATA.map((day, i) => {
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
                style={[styles.dayCard, day.isToday && styles.dayCardToday]}
              >
                {/* Day Header row */}
                <View style={styles.dayHeader}>
                  <View>
                    <Text style={[styles.dayDate, day.isToday && styles.dayDateToday]}>
                      {day.date}
                    </Text>
                    <View style={styles.dayCalRow}>
                      <Text style={[styles.dayCalValue, isOver && { color: '#FF8C42' }]}>
                        {day.totalCalories} kcal
                      </Text>
                      <Text style={styles.dayCalGoal}> / {day.goalCalories}</Text>
                    </View>
                  </View>
                  <View style={styles.dayRight}>
                    {isOver ? (
                      <View style={styles.overBadge}>
                        <Text style={styles.overBadgeText}>+{day.totalCalories - day.goalCalories}</Text>
                      </View>
                    ) : (
                      <View style={styles.okBadge}>
                        <Ionicons name="checkmark" size={14} color="#7EB93C" />
                      </View>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#AAA"
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>

                {/* Mini progress bar */}
                <View style={styles.miniBarBg}>
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
                      <View key={mi} style={styles.mealRow}>
                        <Text style={styles.mealEmoji}>{meal.icon}</Text>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>{meal.name}</Text>
                          <Text style={styles.mealFood}>{meal.food}</Text>
                        </View>
                        <Text style={styles.mealCal}>{meal.calories} kcal</Text>
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
    paddingBottom: 40,
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
