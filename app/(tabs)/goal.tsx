import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Dimensions, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MockStore } from '@/constants/store';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const GOAL_OPTIONS = [
  { id: '1', title: 'Lose Weight', icon: 'trending-down', color: '#1890FF', unit: 'kg', defaultVal: '5' },
  { id: '2', title: 'Gain Weight', icon: 'trending-up', color: '#FF4D4F', unit: 'kg', defaultVal: '5' },
  { id: '3', title: 'Target Weight', icon: 'scale-outline', color: '#7EB93C', unit: 'kg', defaultVal: '70' },
  { id: '4', title: 'Drink More Water', icon: 'water-outline', color: '#00C2FF', unit: 'Liters', defaultVal: '2' },
  { id: '5', title: 'Daily Steps', icon: 'footsteps-outline', color: '#F4C344', unit: 'steps', defaultVal: '10000' },
];

const SmoothCircularProgress = ({ percentage, isDark }: { percentage: number; isDark: boolean }) => {
  const size = SCREEN_WIDTH * 0.65; // slightly smaller to fit card
  const strokeWidth = 24;
  const radius = size / 2;
  const angle = Math.min(Math.max(percentage / 100, 0), 1) * 360;
  
  const color = '#7EB93C';
  const unfilledColor = isDark ? '#2A3A1E' : '#E5EDE0';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 20 }}>
      {/* Base background ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: radius, borderWidth: strokeWidth, borderColor: unfilledColor }} />

      {/* Right half container */}
      <View style={{ position: 'absolute', width: radius, height: size, right: 0, overflow: 'hidden' }}>
        <View style={{
          width: size, height: size, borderRadius: radius, borderWidth: strokeWidth,
          borderColor: 'transparent', borderTopColor: color, borderRightColor: color,
          position: 'absolute', right: 0,
          transform: [{ rotate: '-135deg' }, { rotate: `${Math.min(angle, 180)}deg` }]
        }} />
      </View>

      {/* Left half container */}
      {angle > 180 && (
        <View style={{ position: 'absolute', width: radius, height: size, left: 0, overflow: 'hidden' }}>
          <View style={{
            width: size, height: size, borderRadius: radius, borderWidth: strokeWidth,
            borderColor: 'transparent', borderBottomColor: color, borderLeftColor: color,
            position: 'absolute', left: 0,
            transform: [{ rotate: '-135deg' }, { rotate: `${angle - 180}deg` }]
          }} />
        </View>
      )}

      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: '800', color: isDark ? '#FAFCF8' : '#1A1A1A' }}>
          {percentage}%
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#9AA88E' : '#666', marginTop: 4 }}>
          Remaining
        </Text>
      </View>
    </View>
  );
};

import { TextInput } from 'react-native';
import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GoalScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [goalPercentage, setGoalPercentage] = useState(0); 
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  
  const [configuringGoal, setConfiguringGoal] = useState<any>(null);
  const [goalValue, setGoalValue] = useState('');
  const [weightChange, setWeightChange] = useState(0);
  
  useEffect(() => {
    return MockStore.subscribe(() => {
      setAppTheme(MockStore.appTheme);
    });
  }, []);

  const syncToSupabase = async (newGoals: any[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: existing } = await supabase
          .from('diary_entries')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('meal_type', 'active_goals')
          .maybeSingle();

        if (existing?.id) {
          await supabase.from('diary_entries').update({ items: JSON.stringify(newGoals) }).eq('id', existing.id);
        } else {
          await supabase.from('diary_entries').insert({
            user_id: userData.user.id,
            date: '2099-12-31',
            meal_type: 'active_goals',
            items: JSON.stringify(newGoals),
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
          });
        }
      }
    } catch (e) {
      console.log('Error syncing goals to Supabase:', e);
    }
  };

  // Fetch active goals from Supabase or AsyncStorage
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from('diary_entries')
            .select('items')
            .eq('user_id', userData.user.id)
            .eq('meal_type', 'active_goals')
            .maybeSingle();
            
          if (data && data.items) {
            setActiveGoals(JSON.parse(data.items));
            return;
          }
        }
        
        // Fallback
        const stored = await AsyncStorage.getItem('active_goals');
        if (stored) setActiveGoals(JSON.parse(stored));
      } catch (e) {}
    };
    loadGoals();
  }, []);

  // Fetch diary entries and calculate weight change
  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('diary_entries')
        .select('date, calories, meal_type')
        .eq('user_id', user.id);

      if (data && !error) {
        let totalEaten = 0;
        let totalSteps = 0;
        let dates = new Set();

        data.forEach((entry: any) => {
          dates.add(entry.date);
          if (entry.meal_type === 'steps_history') {
            totalSteps += (entry.calories || 0); // steps count is stored in calories for steps_history
          } else {
            totalEaten += (entry.calories || 0);
          }
        });

        const daysTracked = dates.size || 1;
        const BMR = 2000;
        const caloriesBurnedFromSteps = totalSteps * 0.04;
        const totalBurned = (daysTracked * BMR) + caloriesBurnedFromSteps;
        
        // 1 kg = ~7700 kcal. 
        // If netCalories < 0, they lost weight (negative weightChange)
        const netCalories = totalEaten - totalBurned;
        const changeKg = netCalories / 7700;
        
        setWeightChange(changeKg);
      }
    };
    fetchStats();
  }, []);

  // Calculate Goal Percentage based on the first active goal
  useEffect(() => {
    if (activeGoals.length > 0) {
      const mainGoal = activeGoals[0];
      const targetVal = parseFloat(mainGoal.value) || 1;
      
      let progress = 0;
      if (mainGoal.id === '1') {
        // Lose Weight
        // changeKg is negative if they lost weight
        const lost = Math.max(0, -weightChange);
        progress = (lost / targetVal) * 100;
      } else if (mainGoal.id === '2') {
        // Gain Weight
        // changeKg is positive if they gained weight
        const gained = Math.max(0, weightChange);
        progress = (gained / targetVal) * 100;
      } else {
        // Other goals just show 0 for now unless implemented
        progress = 0;
      }
      
      setGoalPercentage(Math.min(Math.round(progress), 100));
    } else {
      setGoalPercentage(0);
    }
  }, [activeGoals, weightChange]);

  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';

  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A1A1A',
    textMuted: isDark ? '#6B785E' : '#888',
    activeBg: '#7EB93C',
    activeText: '#FFFFFF',
    borderBottom: isDark ? '#1F2A16' : '#EBF2E5',
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'
  };

  const handleSelectGoal = (goal: any) => {
    setConfiguringGoal(goal);
    setGoalValue(goal.defaultVal);
  };

  const handleSaveGoal = async () => {
    if (configuringGoal && goalValue) {
      const newGoal = { ...configuringGoal, value: goalValue };
      const exists = activeGoals.findIndex(g => g.id === newGoal.id);
      
      let updated = [...activeGoals];
      if (exists >= 0) {
        updated[exists] = newGoal;
      } else {
        updated.push(newGoal);
      }
      setActiveGoals(updated);
      await AsyncStorage.setItem('active_goals', JSON.stringify(updated));
      syncToSupabase(updated);
    }
    setConfiguringGoal(null);
    setModalVisible(false);
  };

  const handleRemoveGoal = async (id: string) => {
    const updated = activeGoals.filter(g => g.id !== id);
    setActiveGoals(updated);
    await AsyncStorage.setItem('active_goals', JSON.stringify(updated));
    syncToSupabase(updated);
  };

  const openModal = () => {
    setConfiguringGoal(null);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: Math.max(10, insets.top) }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Month Selector */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.monthSelectorWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.monthScroll}
        >
          {MONTHS.map((month, idx) => {
            const isActive = selectedMonth === idx;
            return (
              <TouchableOpacity
                key={month}
                onPress={() => setSelectedMonth(idx)}
                style={[
                  styles.monthBtn,
                  { 
                    backgroundColor: isActive ? theme.activeBg : theme.cardBackground, 
                    borderColor: isActive ? theme.activeBg : theme.cardBorder 
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.monthSubtitle, { color: isActive ? 'rgba(255,255,255,0.8)' : theme.textMuted }]}>
                  2025
                </Text>
                <Text style={[styles.monthText, { color: isActive ? '#FFF' : theme.textPrimary }]}>
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Progress Card (like search.tsx) */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)} 
          style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
        >
          {/* Dynamic Weight Info */}
          <View style={styles.weightInfoContainer}>
            <Text style={[styles.weightChangeText, { color: weightChange < 0 ? theme.activeBg : '#FF4D4F' }]}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(2)} kg
            </Text>
            <Text style={[styles.weightChangeLabel, { color: theme.textMuted }]}>
              Calculated from Calories Eaten & Steps
            </Text>
          </View>

          {/* Progress Circle */}
          <SmoothCircularProgress percentage={goalPercentage} isDark={isDark} />
        </Animated.View>

        {/* Active Goals List */}
        {activeGoals.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.activeGoalsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Targets</Text>
            {activeGoals.map(goal => (
              <View key={goal.id} style={[styles.activeGoalCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.goalIconBg, { backgroundColor: goal.color + '15' }]}>
                  <Ionicons name={goal.icon} size={28} color={goal.color} />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={[styles.goalTitle, { color: theme.textPrimary }]}>{goal.title}</Text>
                  <Text style={[styles.goalValue, { color: theme.textMuted }]}>
                    Target: <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{goal.value} {goal.unit}</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveGoal(goal.id)} style={[styles.removeBtn, { backgroundColor: '#FF4D4F15' }]}>
                  <Ionicons name="trash-outline" size={20} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Add Goal Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ width: '100%' }}>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: theme.activeBg }]} 
            activeOpacity={0.8}
            onPress={openModal}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Add Goal</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            
            {!configuringGoal ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select a Goal</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {GOAL_OPTIONS.map(goal => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[styles.goalOption, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
                      activeOpacity={0.7}
                      onPress={() => handleSelectGoal(goal)}
                    >
                      <View style={[styles.goalIconBg, { backgroundColor: goal.color + '20' }]}>
                        <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                      </View>
                      <Text style={[styles.goalOptionText, { color: theme.textPrimary }]}>{goal.title}</Text>
                      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setConfiguringGoal(null)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Set Target</Text>
                  <View style={{ width: 24 }} /> 
                </View>

                <View style={{ alignItems: 'center', marginVertical: 32 }}>
                  <View style={[styles.goalIconBg, { backgroundColor: configuringGoal.color + '20', width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
                    <Ionicons name={configuringGoal.icon as any} size={32} color={configuringGoal.color} />
                  </View>
                  <Text style={[styles.configuringTitle, { color: theme.textPrimary }]}>{configuringGoal.title}</Text>
                  
                  <View style={styles.inputContainer}>
                    <TextInput 
                      style={[styles.valueInput, { color: theme.textPrimary, borderBottomColor: theme.cardBorder }]} 
                      value={goalValue} 
                      onChangeText={setGoalValue} 
                      keyboardType="numeric"
                      autoFocus
                    />
                    <Text style={[styles.unitText, { color: theme.textMuted }]}>{configuringGoal.unit}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: theme.activeBg, marginTop: 0 }]} 
                  activeOpacity={0.8}
                  onPress={handleSaveGoal}
                >
                  <Text style={styles.addBtnText}>Save Goal</Text>
                </TouchableOpacity>
              </>
            )}
            
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
  monthSelectorWrapper: {
    paddingVertical: 16,
    marginTop: 10,
  },
  monthScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  monthBtn: {
    width: 68,
    height: 72,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 1,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '900',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  activeGoalsContainer: {
    width: '100%',
    marginBottom: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  activeGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  removeBtn: {
    padding: 10,
    borderRadius: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  goalIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 16,
  },
  goalTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  backBtn: {
    padding: 4,
  },
  configuringTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueInput: {
    fontSize: 48,
    fontWeight: '800',
    borderBottomWidth: 2,
    minWidth: 80,
    textAlign: 'center',
    paddingVertical: 8,
  },
  unitText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  weightInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  weightChangeText: {
    fontSize: 32,
    fontWeight: '900',
  },
  weightChangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  }
});
