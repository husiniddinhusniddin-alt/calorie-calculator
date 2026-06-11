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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const DIARY_MEALS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    color: '#F4C344',
    calories: 480,
    items: ['Oatmeal with fruits and nuts'],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    color: '#7EB93C',
    calories: 384,
    items: ['Chops with potatoes'],
  },
  {
    id: 'dinner',
    label: 'Dinner',
    color: '#E8A86F',
    calories: 0,
    items: [],
    empty: true,
  },
  {
    id: 'other',
    label: 'Other',
    color: '#A8A4D8',
    calories: 0,
    items: [],
    empty: true,
  },
];

const DAILY_GOAL = 900;
const DAILY_FATS = 31;
const DAILY_CARBS = 66;
const DAILY_PROTEINS = 32;

export default function DiaryScreen() {
  const [meals, setMeals] = useState(DIARY_MEALS);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.headerTitle}>Daily calories</Text>
          <View style={styles.headerMacros}>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{DAILY_FATS}g</Text>
              <Text style={styles.macroChipLabel}>Fats</Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{DAILY_CARBS}g</Text>
              <Text style={styles.macroChipLabel}>Carbs</Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroChipValue}>{DAILY_PROTEINS}g</Text>
              <Text style={styles.macroChipLabel}>Proteins</Text>
            </View>
            <View style={[styles.macroChip, styles.macroChipGoal]}>
              <Text style={[styles.macroChipValue, { color: '#FFFFFF' }]}>{DAILY_GOAL}kcal</Text>
              <Text style={[styles.macroChipLabel, { color: '#D0EBB0' }]}>Calories</Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Today's intake</Text>
            <Text style={styles.progressValue}>
              <Text style={styles.progressCurrent}>{totalCalories}</Text>
              <Text style={styles.progressTotal}> / {DAILY_GOAL} kcal</Text>
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min((totalCalories / DAILY_GOAL) * 100, 100)}%` }
              ]}
            />
          </View>
        </Animated.View>

        {/* Meal Sections */}
        {meals.map((meal, index) => (
          <Animated.View
            key={meal.id}
            entering={FadeInDown.duration(500).delay(150 + index * 80)}
          >
            <TouchableOpacity activeOpacity={0.85} style={styles.mealCard}>
              {/* Left color stripe */}
              <View style={[styles.mealStripe, { backgroundColor: meal.color }]} />

              <View style={styles.mealContent}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealLabel}>{meal.label}</Text>
                  {meal.calories > 0 && (
                    <View style={[styles.mealCalBadge, { backgroundColor: meal.color + '22' }]}>
                      <Text style={[styles.mealCalBadgeText, { color: meal.color }]}>
                        {meal.calories} kcal
                      </Text>
                    </View>
                  )}
                </View>

                {meal.empty ? (
                  <Text style={styles.mealEmptyText}>No products added yet</Text>
                ) : (
                  meal.items.map((item, i) => (
                    <Text key={i} style={styles.mealItemText}>• {item}</Text>
                  ))
                )}
              </View>

              <TouchableOpacity style={styles.mealAddBtn}>
                <Ionicons name="add" size={20} color={meal.color} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Bottom Navigation Action Buttons */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="document-text-outline" size={22} color="#7EB93C" />
            <Text style={styles.actionBtnText}>Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="refresh-outline" size={22} color="#7EB93C" />
            <Text style={styles.actionBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={22} color="#7EB93C" />
            <Text style={styles.actionBtnText}>Share</Text>
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
    paddingBottom: 30,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 14,
  },
  headerMacros: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  macroChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    flex: 1,
  },
  macroChipGoal: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  macroChipValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  macroChipLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  progressValue: {
    fontSize: 14,
  },
  progressCurrent: {
    fontWeight: '700',
    color: '#7EB93C',
  },
  progressTotal: {
    color: '#999',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#EBF2E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7EB93C',
    borderRadius: 8,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    minHeight: 80,
  },
  mealStripe: {
    width: 6,
    alignSelf: 'stretch',
  },
  mealContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  mealCalBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  mealCalBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealEmptyText: {
    fontSize: 13,
    color: '#BBBBBB',
    fontStyle: 'italic',
  },
  mealItemText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  mealAddBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    gap: 4,
  },
  actionBtnPrimary: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7EB93C',
  },
});
