import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { 
  Provider as PaperProvider, 
  TextInput as PaperTextInput, 
  Snackbar, 
  Portal 
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';



const CURRENT_WEIGHT = 85; // Fixed current weight as per requirements
const STARTING_WEIGHT = 88; // Fixed starting weight for calculation of progress

export default function GoalSettingScreen() {
  // Goal Settings State
  const [targetWeight, setTargetWeight] = useState<string>('82');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<string>('1900');
  const [weeklyWeightGoal, setWeeklyWeightGoal] = useState<number>(0.5); // kg per week
  const [targetDate, setTargetDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90); // Default target 90 days from now
    return d;
  });

  // UI States
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Parse numeric target weight
  const parsedTargetWeight = parseFloat(targetWeight) || 0;
  
  // Calculate difference
  const weightDiff = CURRENT_WEIGHT - parsedTargetWeight;
  const isLoss = weightDiff >= 0;
  const absWeightDiff = Math.abs(weightDiff);

  // Dynamic Progress Calculation
  // Starting Weight: 88, Current Weight: 85.
  // Weight lost so far: 88 - 85 = 3 kg.
  // Total weight to lose: 88 - Target Weight.
  // Progress % = (Weight Lost So Far / Total Weight To Lose) * 100
  const totalGoalWeightChange = STARTING_WEIGHT - parsedTargetWeight;
  const progressPercent = totalGoalWeightChange > 0 
    ? Math.min(Math.max(((STARTING_WEIGHT - CURRENT_WEIGHT) / totalGoalWeightChange) * 100, 0), 100)
    : 0;

  // Estimated Days Remaining
  const getDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  const daysRemaining = getDaysRemaining();

  // Dynamic Calorie Suggestion Algorithm
  // TDEE estimated around 2400 kcal for 85kg active-moderate male
  // 0.5 kg loss per week requires ~500 kcal deficit per day.
  // Suggested Calories = TDEE - (deficit/surplus based on target)
  const calculateSuggestedCalories = () => {
    const baseTdee = 2400; // Average base maintenance
    if (parsedTargetWeight === CURRENT_WEIGHT) {
      return baseTdee;
    }
    const weightChangeFactor = isLoss ? -1 : 1;
    const dailyDeficit = (weeklyWeightGoal * 7700) / 7; // 7700 kcal per kg of body fat
    const suggestion = baseTdee + (weightChangeFactor * dailyDeficit);
    return Math.round(suggestion);
  };
  const suggestedCalories = calculateSuggestedCalories();

  // Handle Target Date selection from native picker
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  // Adjust target weight with stepper buttons
  const adjustTargetWeight = (amount: number) => {
    const current = parseFloat(targetWeight) || 0;
    const newVal = Math.max(30, Math.min(250, current + amount));
    // Round to 1 decimal place
    setTargetWeight((Math.round(newVal * 10) / 10).toString());
  };

  // Save Goal Handler
  const handleSaveGoal = () => {
    if (parsedTargetWeight <= 0) {
      setSnackbarMessage('Please enter a valid target weight.');
      setSnackbarVisible(true);
      return;
    }
    if ((parseFloat(dailyCalorieGoal) || 0) < 800) {
      setSnackbarMessage('Daily calorie goal must be at least 800 kcal.');
      setSnackbarVisible(true);
      return;
    }

    setIsSaving(true);
    // Simulate API/Async storage saving
    setTimeout(() => {
      setIsSaving(false);
      setSnackbarMessage('Goals saved successfully! 🎉');
      setSnackbarVisible(true);
    }, 1200);
  };

  // Reset Goal Handler
  const handleResetGoal = () => {
    setTargetWeight('82');
    setDailyCalorieGoal('1900');
    setWeeklyWeightGoal(0.5);
    const d = new Date();
    d.setDate(d.getDate() + 90);
    setTargetDate(d);
    
    setSnackbarMessage('Goal settings reset to defaults.');
    setSnackbarVisible(true);
  };

  // Format Date for display
  const formatDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Header Section */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
              <View style={styles.flagIconContainer}>
                <View style={styles.flagIconInner}>
                  <Ionicons name="flag" size={32} color="#7EB93C" />
                </View>
                {/* Decorative pulse ring */}
                <View style={styles.pulseRing} />
              </View>
              <Text style={styles.title}>Set Your Goal</Text>
              <Text style={styles.subtitle}>Track your progress and stay motivated.</Text>
            </Animated.View>

            {/* Goal Card */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(100)} 
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Weight Goal</Text>
                <View style={styles.currentWeightBadge}>
                  <Text style={styles.currentWeightLabel}>Current: </Text>
                  <Text style={styles.currentWeightValue}>{CURRENT_WEIGHT} kg</Text>
                </View>
              </View>

              {/* Target Weight Inputs with Stepper */}
              <View style={styles.weightInputRow}>
                <TouchableOpacity 
                  style={styles.stepperButton}
                  onPress={() => adjustTargetWeight(-0.5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={24} color="#3A5C18" />
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <PaperTextInput
                    mode="outlined"
                    label="Target Weight (kg)"
                    value={targetWeight}
                    onChangeText={setTargetWeight}
                    keyboardType="decimal-pad"
                    activeOutlineColor="#7EB93C"
                    outlineColor="#EBF2E5"
                    style={styles.textInput}
                    textColor="#1A2310"
                    dense
                  />
                </View>

                <TouchableOpacity 
                  style={styles.stepperButton}
                  onPress={() => adjustTargetWeight(0.5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color="#3A5C18" />
                </TouchableOpacity>
              </View>

              {/* Automatic Difference Callout */}
              <Animated.View layout={Layout.springify()} style={styles.diffContainer}>
                <Ionicons 
                  name={isLoss ? "arrow-down-circle" : "arrow-up-circle"} 
                  size={20} 
                  color="#7EB93C" 
                />
                <Text style={styles.diffText}>
                  {absWeightDiff === 0 
                    ? "Weight maintenance target" 
                    : `${absWeightDiff.toFixed(1)} kg ${isLoss ? 'remaining' : 'to gain'} to reach goal`
                  }
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Progress Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(200)} 
              style={styles.card}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Goal Progress</Text>
                <Text style={styles.progressPctText}>{Math.round(progressPercent)}% Completed</Text>
              </View>

              {/* Custom High-Fidelity Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]}>
                  {progressPercent > 0 && <View style={styles.progressBarThumb} />}
                </View>
              </View>

              <View style={styles.progressFooter}>
                <Ionicons name="information-circle-outline" size={16} color="#6B785E" />
                <Text style={styles.progressFooterText}>
                  {absWeightDiff === 0 
                    ? "You are exactly at your target weight!"
                    : `${absWeightDiff.toFixed(1)} kg remaining to reach your goal.`
                  }
                </Text>
              </View>
            </Animated.View>

            {/* Calorie Goal Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(300)} 
              style={styles.card}
            >
              <Text style={styles.cardTitle}>Daily Calorie Target</Text>
              <Text style={styles.sectionDesc}>
                Customize your daily target or use our suggestion based on your target weight.
              </Text>

              {/* Weekly Weight Change Selection Chips */}
              <Text style={styles.subLabel}>Weekly Change Rate</Text>
              <View style={styles.chipContainer}>
                {[0.25, 0.5, 0.75, 1.0].map((rate) => {
                  const isSelected = weeklyWeightGoal === rate;
                  return (
                    <TouchableOpacity
                      key={rate}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setWeeklyWeightGoal(rate)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {rate} kg/wk
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Calorie Goal Input */}
              <View style={styles.calorieInputRow}>
                <View style={styles.flexInput}>
                  <PaperTextInput
                    mode="outlined"
                    label="Daily Calories (kcal)"
                    value={dailyCalorieGoal}
                    onChangeText={setDailyCalorieGoal}
                    keyboardType="number-pad"
                    activeOutlineColor="#7EB93C"
                    outlineColor="#EBF2E5"
                    style={styles.textInput}
                    textColor="#1A2310"
                  />
                </View>
                <View style={styles.suggestedBox}>
                  <Text style={styles.suggestedLabel}>Suggested</Text>
                  <Text style={styles.suggestedValue}>{suggestedCalories} kcal</Text>
                </View>
              </View>
            </Animated.View>

            {/* Timeline Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(400)} 
              style={styles.card}
            >
              <Text style={styles.cardTitle}>Timeline</Text>
              <Text style={styles.sectionDesc}>
                Pick your target completion date to calculate your required daily commitment.
              </Text>

              <TouchableOpacity 
                style={styles.datePickerTrigger}
                onPress={() => setShowDatePicker(prev => !prev)}
                activeOpacity={0.7}
              >
                <View style={styles.dateInfo}>
                  <Ionicons name="calendar" size={22} color="#7EB93C" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.datePickerLabel}>Target Date</Text>
                    <Text style={styles.datePickerValue}>{formatDateString(targetDate)}</Text>
                  </View>
                </View>
                <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color="#7EB93C" />
              </TouchableOpacity>

              {/* Web Native Date input backup */}
              {Platform.OS === 'web' && showDatePicker && (
                <View style={styles.webDateContainer}>
                  <input
                    type="date"
                    value={targetDate.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) setTargetDate(new Date(e.target.value));
                      setShowDatePicker(false);
                    }}
                    style={styles.webDatePicker}
                  />
                  <TouchableOpacity 
                    style={styles.webDateCloseBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.webDateCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Native Mobile Date Picker */}
              {Platform.OS !== 'web' && showDatePicker && (
                <View style={styles.iosDatePickerContainer}>
                  <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                    accentColor="#7EB93C"
                    themeVariant="light"
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      style={styles.iosConfirmButton}
                      onPress={() => setShowDatePicker(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.iosConfirmButtonText}>Confirm Target Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Days remaining badge */}
              <View style={styles.daysRemainingContainer}>
                <Ionicons name="time-outline" size={20} color="#3A5C18" />
                <Text style={styles.daysRemainingText}>
                  Estimated <Text style={styles.daysRemainingBold}>{daysRemaining} days</Text> remaining to your target.
                </Text>
              </View>
            </Animated.View>

            {/* Motivation Card */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(450)} 
              style={styles.motivationCard}
            >
              <View style={styles.quoteIconContainer}>
                <MaterialCommunityIcons name="format-quote-close" size={24} color="#EBF2E5" style={{ opacity: 0.3 }} />
              </View>
              <Text style={styles.motivationText}>
                {"\"Every small step brings you closer to your goal.\""}
              </Text>
              <View style={styles.motivationFooter}>
                <View style={styles.motivationDot} />
                <Text style={styles.motivationAuthor}>Fitness Journey</Text>
              </View>
            </Animated.View>

            {/* Buttons Row */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(500)} 
              style={styles.buttonRow}
            >
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleResetGoal}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>Reset Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                onPress={handleSaveGoal}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveButtonText}>Save Goal</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success / Warning Toasts */}
        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={2500}
            action={{
              label: 'Dismiss',
              onPress: () => setSnackbarVisible(false),
              textColor: '#7EB93C',
            }}
            style={styles.snackbar}
          >
            {snackbarMessage}
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  flagIconContainer: {
    width: 68,
    height: 68,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FAE4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  pulseRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#7EB93C',
    opacity: 0.12,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B785E',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    shadowColor: '#3A5C18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3A5C18',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B785E',
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 2,
  },
  currentWeightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBF2E5',
  },
  currentWeightLabel: {
    fontSize: 12,
    color: '#6B785E',
    fontWeight: '600',
  },
  currentWeightValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A5C18',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepperButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F0FAE4',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
  },
  diffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAE4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A5C18',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A5C18',
  },
  progressPctText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7EB93C',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#F0FAE4',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7EB93C',
    borderRadius: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarThumb: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressFooterText: {
    fontSize: 12,
    color: '#6B785E',
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A5C18',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  chipActive: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B785E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  calorieInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  flexInput: {
    flex: 1.3,
  },
  suggestedBox: {
    flex: 1,
    backgroundColor: '#F7FAF3',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B785E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  suggestedValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7EB93C',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FAE4',
    borderWidth: 1.5,
    borderColor: '#C8E8A0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9AA88E',
  },
  datePickerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7EB93C',
    marginTop: 1,
  },
  daysRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAE4',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  daysRemainingText: {
    fontSize: 13,
    color: '#3A5C18',
    fontWeight: '600',
  },
  daysRemainingBold: {
    fontWeight: '800',
  },
  motivationCard: {
    backgroundColor: '#3A5C18',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EBF2E5',
    lineHeight: 22,
    fontStyle: 'italic',
    zIndex: 2,
  },
  motivationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  motivationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7EB93C',
  },
  motivationAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7EB93C',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6B785E',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: '#7EB93C',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#A8D27C',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  snackbar: {
    backgroundColor: '#1A2310',
    borderRadius: 14,
  },
  webDateContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webDatePicker: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#C8E8A0',
    backgroundColor: '#FAFCF8',
    color: '#7EB93C',
    borderRadius: 8,
    marginRight: 8,
  },
  webDateCloseBtn: {
    backgroundColor: '#7EB93C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  webDateCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  iosDatePickerContainer: {
    backgroundColor: '#FAFCF8',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    marginBottom: 16,
    overflow: 'hidden',
  },
  iosConfirmButton: {
    backgroundColor: '#7EB93C',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  iosConfirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
