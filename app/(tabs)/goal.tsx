import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { MockStore } from '@/constants/store';
import { supabase } from '@/constants/supabase';



const translations = {
  en: {
    setGoal: 'Set Your Goal',
    trackProgress: 'Track your progress and stay motivated.',
    weightGoal: 'Weight Goal',
    current: 'Current: ',
    targetWeightLabel: 'Target Weight (kg)',
    maintenance: 'Weight maintenance target',
    remainingToLoss: '{diff} kg remaining to reach goal',
    remainingToGain: '{diff} kg to gain to reach goal',
    goalProgress: 'Goal Progress',
    completed: 'Completed',
    remainingDescLoss: '{diff} kg remaining to reach your goal.',
    remainingDescGain: '{diff} kg to gain to reach your goal.',
    atTargetWeight: 'You are exactly at your target weight!',
    dailyCalorieTarget: 'Daily Calorie Target ',
    calorieTargetDesc: 'Customize your daily target or use our suggestion based on your target weight.',
    weeklyChangeRate: 'Weekly Change Rate',
    kgWk: '{rate} kg/wk',
    dailyCaloriesLabel: 'Daily Calories (kcal)',
    suggested: 'Suggested',
    timeline: 'Timeline',
    timelineDesc: 'Pick your target completion date to calculate your required daily commitment.',
    targetDateLabel: 'Target Date',
    daysRemainingDesc: 'Estimated {days} days remaining to your target.',
    motivationQuote: '"Every small step brings you closer to your goal."',
    motivationAuthor: 'Fitness Journey',
    resetGoal: 'Reset Goal',
    saveGoal: 'Save Goal',
    
    // Alerts/Snackbars
    resetMsg: 'Goal settings reset to defaults.',
    saveSuccess: 'Goals saved successfully! 🎉',
    validWeightErr: 'Please enter a valid target weight.',
    calorieErr: 'Daily calorie goal must be at least 800 kcal.',
    confirmTargetDate: 'Confirm Target Date',
    done: 'Done',
  },
  ru: {
    setGoal: 'Установите цель',
    trackProgress: 'Отслеживайте прогресс и оставайтесь мотивированными.',
    weightGoal: 'Целевой вес',
    current: 'Текущий: ',
    targetWeightLabel: 'Целевой вес (кг)',
    maintenance: 'Поддержание веса',
    remainingToLoss: 'Осталось {diff} кг до цели',
    remainingToGain: 'Нужно набрать {diff} кг до цели',
    goalProgress: 'Прогресс цели',
    completed: 'завершено',
    remainingDescLoss: 'Осталось {diff} кг до вашей цели.',
    remainingDescGain: 'Нужно набрать {diff} кг до вашей цели.',
    atTargetWeight: 'Вы находитесь точно в целевом весе!',
    dailyCalorieTarget: 'Дневная цель калорий',
    calorieTargetDesc: 'Настройте дневную цель или используйте наши рекомендации на основе целевого веса.',
    weeklyChangeRate: 'Скорость изменения веса',
    kgWk: '{rate} кг/нед',
    dailyCaloriesLabel: 'Дневные калории (ккал)',
    suggested: 'Рекомендуется',
    timeline: 'Сроки',
    timelineDesc: 'Выберите целевую дату для расчета ваших ежедневных задач.',
    targetDateLabel: 'Целевая дата',
    daysRemainingDesc: 'До вашей цели осталось примерно {days} дней.',
    motivationQuote: '"Каждый маленький шаг приближает вас к цели."',
    motivationAuthor: 'Фитнес-путешествие',
    resetGoal: 'Сбросить цель',
    saveGoal: 'Сохранить цель',
    
    resetMsg: 'Настройки целей сброшены по умолчанию.',
    saveSuccess: 'Цели успешно сохранены! 🎉',
    validWeightErr: 'Пожалуйста, введите корректный целевой вес.',
    calorieErr: 'Дневная цель калорий должна быть не менее 800 ккал.',
    confirmTargetDate: 'Подтвердить дату',
    done: 'Готово',
  },
  uz: {
    setGoal: 'Maqsadingizni belgilang',
    trackProgress: 'Rivojlanishingizni kuzatib boring va motivatsiyada bo\'ling.',
    weightGoal: 'Vazn maqsadi',
    current: 'Hozirgi: ',
    targetWeightLabel: 'Maqsadli vazn (kg)',
    maintenance: 'Vaznni saqlash maqsadi',
    remainingToLoss: 'Maqsadgacha {diff} kg qoldi',
    remainingToGain: 'Maqsadgacha {diff} kg semirish kerak',
    goalProgress: 'Maqsad progressi',
    completed: 'bajarildi',
    remainingDescLoss: 'Maqsadingizga erishish uchun {diff} kg qoldi.',
    remainingDescGain: 'Maqsadingizga erishish uchun {diff} kg semirishingiz kerak.',
    atTargetWeight: 'Siz ayni maqsad qilgan vazndasiz!',
    dailyCalorieTarget: 'Kunlik kaloriya maqsadi',
    calorieTargetDesc: 'Kunlik maqsadingizni sozlang yoki maqsadli vazningizga asoslangan tavsiyamizdan foydalaning.',
    weeklyChangeRate: 'Haftalik o\'zgarish tezligi',
    kgWk: '{rate} kg/hafta',
    dailyCaloriesLabel: 'Kunlik kaloriya (kkal)',
    suggested: 'Tavsiya etilgan',
    timeline: 'Muddat',
    timelineDesc: 'Kunlik majburiyatingizni hisoblash uchun maqsadli tugatish sanasini tanlang.',
    targetDateLabel: 'Maqsadli sana',
    daysRemainingDesc: 'Maqsadingizga taxminan {days} kun qoldi.',
    motivationQuote: '"Har bir kichik qadam sizni maqsadingizga yaqinlashtiradi."',
    motivationAuthor: 'Salomatlik yo\'li',
    resetGoal: 'Maqsadni tiklash',
    saveGoal: 'Maqsadni saqlash',
    
    resetMsg: 'Maqsad sozlamalari boshlang\'ich holatga qaytarildi.',
    saveSuccess: 'Maqsadlar muvaffaqiyatli saqlandi! 🎉',
    validWeightErr: 'Iltimos, to\'g\'ri maqsadli vaznni kiriting.',
    calorieErr: 'Kunlik kaloriya maqsadi kamida 800 kkal bo\'lishi kerak.',
    confirmTargetDate: 'Sanani tasdiqlash',
    done: 'Tayyor',
  }
};

export default function GoalSettingScreen() {
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);

  // Dynamic weight state from MockStore/Supabase (no more hardcoded constants)
  const [currentWeight, setCurrentWeight] = useState<number>(MockStore.currentWeight);
  const [startingWeight, setStartingWeight] = useState<number>(MockStore.startingWeight);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load goal data from Supabase on mount
  useEffect(() => {
    async function loadGoalData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('target_weight, daily_calorie_goal, weekly_weight_goal, target_date, current_weight, starting_weight')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            const tw = parseFloat(profile.target_weight) || 82;
            const dcg = parseFloat(profile.daily_calorie_goal) || 1900;
            const wwg = parseFloat(profile.weekly_weight_goal) || 0.5;
            const td = profile.target_date ? new Date(profile.target_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            const cw = parseFloat(profile.current_weight) || 85;
            const sw = parseFloat(profile.starting_weight) || 88;

            setTargetWeight(tw.toString());
            setDailyCalorieGoal(dcg.toString());
            setWeeklyWeightGoal(wwg);
            setTargetDate(td);
            setCurrentWeight(cw);
            setStartingWeight(sw);

            // Sync MockStore with loaded data
            MockStore.update({
              targetWeight: tw,
              dailyCalorieGoal: dcg,
              weeklyWeightGoal: wwg,
              targetDate: td,
              currentWeight: cw,
              startingWeight: sw,
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load goal data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGoalData();
  }, []);

  // Subscribe to MockStore updates
  useEffect(() => {
    return MockStore.subscribe(() => {
      setTargetWeight(MockStore.targetWeight.toString());
      setDailyCalorieGoal(MockStore.dailyCalorieGoal.toString());
      setWeeklyWeightGoal(MockStore.weeklyWeightGoal);
      setTargetDate(MockStore.targetDate);
      setCurrentWeight(MockStore.currentWeight);
      setStartingWeight(MockStore.startingWeight);
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
    });
  }, []);

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';
  const t = translations[language] || translations.en;

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
    inputText: isDark ? '#FAFCF8' : '#1A2310',
    inputBackground: isDark ? '#171E10' : '#FFFFFF',
    inputOutline: isDark ? '#2A3A1E' : '#EBF2E5',
    suggestedBoxBg: isDark ? '#23321A' : '#F5F5F5',
  };

  // Goal Settings State (Synced with MockStore)
  const [targetWeight, setTargetWeight] = useState<string>(MockStore.targetWeight.toString());
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<string>(MockStore.dailyCalorieGoal.toString());
  const [weeklyWeightGoal, setWeeklyWeightGoal] = useState<number>(MockStore.weeklyWeightGoal);
  const [targetDate, setTargetDate] = useState<Date>(MockStore.targetDate);

  // UI States
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const parsedTargetWeight = parseFloat(targetWeight) || 0;
  const weightDiff = currentWeight - parsedTargetWeight;
  const isLoss = weightDiff >= 0;
  const absWeightDiff = Math.abs(weightDiff);

  const totalGoalWeightChange = startingWeight - parsedTargetWeight;
  const progressPercent = totalGoalWeightChange > 0 
    ? Math.min(Math.max(((startingWeight - currentWeight) / totalGoalWeightChange) * 100, 0), 100)
    : 0;

  const getDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  const daysRemaining = getDaysRemaining();

  const calculateSuggestedCalories = () => {
    const baseTdee = 2400; 
    if (parsedTargetWeight === currentWeight) {
      return baseTdee;
    }
    const weightChangeFactor = isLoss ? -1 : 1;
    const dailyDeficit = (weeklyWeightGoal * 7700) / 7; 
    const suggestion = baseTdee + (weightChangeFactor * dailyDeficit);
    return Math.round(suggestion);
  };
  const suggestedCalories = calculateSuggestedCalories();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const adjustTargetWeight = (amount: number) => {
    const current = parseFloat(targetWeight) || 0;
    const newVal = Math.max(30, Math.min(250, current + amount));
    setTargetWeight((Math.round(newVal * 10) / 10).toString());
  };

  const handleSaveGoal = async () => {
    if (parsedTargetWeight <= 0) {
      setSnackbarMessage(t.validWeightErr);
      setSnackbarVisible(true);
      return;
    }
    if ((parseFloat(dailyCalorieGoal) || 0) < 800) {
      setSnackbarMessage(t.calorieErr);
      setSnackbarVisible(true);
      return;
    }

    setIsSaving(true);
    try {
      const parsedCalories = parseFloat(dailyCalorieGoal) || 1900;

      // Save to MockStore
      MockStore.update({
        targetWeight: parsedTargetWeight,
        dailyCalorieGoal: parsedCalories,
        weeklyWeightGoal: weeklyWeightGoal,
        targetDate: targetDate,
      });

      // Save to Supabase profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          target_weight: parsedTargetWeight,
          daily_calorie_goal: parsedCalories,
          weekly_weight_goal: weeklyWeightGoal,
          target_date: targetDate.toISOString(),
        }).eq('id', user.id);
      }

      setSnackbarMessage(t.saveSuccess);
      setSnackbarVisible(true);
    } catch (err) {
      console.warn('Failed to save goals to DB:', err);
      setSnackbarMessage(t.saveSuccess);
      setSnackbarVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetGoal = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 90);
    
    setTargetWeight('82');
    setDailyCalorieGoal('1900');
    setWeeklyWeightGoal(0.5);
    setTargetDate(defaultDate);

    MockStore.update({
      targetWeight: 82,
      dailyCalorieGoal: 1900,
      weeklyWeightGoal: 0.5,
      targetDate: defaultDate,
    });
    
    setSnackbarMessage(t.resetMsg);
    setSnackbarVisible(true);
  };

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PaperProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7EB93C" />
          </View>
        ) : (
          <>
        <StatusBar style={isDark ? "light" : "dark"} />
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
                <View style={[styles.flagIconInner, { backgroundColor: theme.badgeBackground, borderColor: theme.cardBorder }]}>
                  <Ionicons name="flag" size={32} color="#7EB93C" />
                </View>
                <View style={styles.pulseRing} />
              </View>
              <Text style={[styles.title, { color: theme.textBrand }]}>{t.setGoal}</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t.trackProgress}</Text>
            </Animated.View>

            {/* Goal Card */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(100)} 
              style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.textBrand }]}>{t.weightGoal}</Text>
                <View style={[styles.currentWeightBadge, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.currentWeightLabel, { color: theme.textMuted }]}>{t.current}</Text>
                  <Text style={[styles.currentWeightValue, { color: theme.textBrand }]}>{currentWeight} kg</Text>
                </View>
              </View>

              {/* Target Weight Inputs with Stepper */}
              <View style={styles.weightInputRow}>
                <TouchableOpacity 
                  style={[styles.stepperButton, { backgroundColor: theme.badgeBackground, borderColor: theme.cardBorder }]}
                  onPress={() => adjustTargetWeight(-0.5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={24} color="#7EB93C" />
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <PaperTextInput
                    mode="outlined"
                    label={t.targetWeightLabel}
                    value={targetWeight}
                    onChangeText={setTargetWeight}
                    keyboardType="decimal-pad"
                    activeOutlineColor="#7EB93C"
                    outlineColor={theme.inputOutline}
                    textColor={theme.inputText}
                    theme={{ colors: { background: theme.inputBackground } }}
                    style={styles.textInput}
                    dense
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.stepperButton, { backgroundColor: theme.badgeBackground, borderColor: theme.cardBorder }]}
                  onPress={() => adjustTargetWeight(0.5)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color="#7EB93C" />
                </TouchableOpacity>
              </View>

              {/* Automatic Difference Callout */}
              <Animated.View layout={Layout.springify()} style={[styles.diffContainer, { backgroundColor: theme.badgeBackground }]}>
                <Ionicons 
                  name={isLoss ? "arrow-down-circle" : "arrow-up-circle"} 
                  size={20} 
                  color="#7EB93C" 
                />
                <Text style={[styles.diffText, { color: theme.textBrand }]}>
                  {absWeightDiff === 0 
                    ? t.maintenance
                    : isLoss
                      ? t.remainingToLoss.replace('{diff}', absWeightDiff.toFixed(1))
                      : t.remainingToGain.replace('{diff}', absWeightDiff.toFixed(1))
                  }
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Progress Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(200)} 
              style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            >
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: theme.textBrand }]}>{t.goalProgress}</Text>
                <Text style={styles.progressPctText}>{Math.round(progressPercent)}% {t.completed}</Text>
              </View>

              <View style={[styles.progressBarBackground, { backgroundColor: theme.badgeBackground }]}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]}>
                  {progressPercent > 0 && <View style={styles.progressBarThumb} />}
                </View>
              </View>

              <View style={styles.progressFooter}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
                <Text style={[styles.progressFooterText, { color: theme.textMuted }]}>
                  {absWeightDiff === 0 
                    ? t.atTargetWeight
                    : isLoss
                      ? t.remainingDescLoss.replace('{diff}', absWeightDiff.toFixed(1))
                      : t.remainingDescGain.replace('{diff}', absWeightDiff.toFixed(1))
                  }
                </Text>
              </View>
            </Animated.View>

            {/* Calorie Goal Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(300)} 
              style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.cardTitle, { color: theme.textBrand }]}>{t.dailyCalorieTarget}</Text>
              <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>{t.calorieTargetDesc}</Text>

              <Text style={[styles.subLabel, { color: theme.textBrand }]}>{t.weeklyChangeRate}</Text>
              <View style={styles.chipContainer}>
                {[0.25, 0.5, 0.75, 1.0].map((rate) => {
                  const isSelected = weeklyWeightGoal === rate;
                  return (
                    <TouchableOpacity
                      key={rate}
                      style={[styles.chip, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }, isSelected && styles.chipActive]}
                      onPress={() => setWeeklyWeightGoal(rate)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, { color: theme.textMuted }, isSelected && styles.chipTextActive]}>
                        {t.kgWk.replace('{rate}', rate.toString())}
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
                    label={t.dailyCaloriesLabel}
                    value={dailyCalorieGoal}
                    onChangeText={setDailyCalorieGoal}
                    keyboardType="number-pad"
                    activeOutlineColor="#7EB93C"
                    outlineColor={theme.inputOutline}
                    textColor={theme.inputText}
                    theme={{ colors: { background: theme.inputBackground } }}
                    style={styles.textInput}
                  />
                </View>
                <View style={[styles.suggestedBox, { backgroundColor: theme.suggestedBoxBg, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.suggestedLabel, { color: theme.textMuted }]}>{t.suggested}</Text>
                  <Text style={styles.suggestedValue}>{suggestedCalories} kcal</Text>
                </View>
              </View>
            </Animated.View>

            {/* Timeline Section */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(400)} 
              style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.cardTitle, { color: theme.textBrand }]}>{t.timeline}</Text>
              <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>{t.timelineDesc}</Text>

              <TouchableOpacity 
                style={[styles.datePickerTrigger, { backgroundColor: theme.badgeBackground, borderColor: theme.badgeBorder }]}
                onPress={() => setShowDatePicker(prev => !prev)}
                activeOpacity={0.7}
              >
                <View style={styles.dateInfo}>
                  <Ionicons name="calendar" size={22} color="#7EB93C" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.datePickerLabel, { color: theme.textMuted }]}>{t.targetDateLabel}</Text>
                    <Text style={styles.datePickerValue}>{formatDateString(targetDate)}</Text>
                  </View>
                </View>
                <Ionicons name={showDatePicker ? "chevron-up" : "chevron-down"} size={20} color="#7EB93C" />
              </TouchableOpacity>

              {/* Web Native Date input backup */}
              {Platform.OS === 'web' && showDatePicker && (
                <View style={[styles.webDateContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                  <input
                    type="date"
                    value={targetDate.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) setTargetDate(new Date(e.target.value));
                      setShowDatePicker(false);
                    }}
                    style={StyleSheet.flatten([styles.webDatePicker, { borderColor: theme.badgeBorder, color: '#7EB93C', backgroundColor: theme.suggestedBoxBg }]) as any}
                  />
                  <TouchableOpacity 
                    style={styles.webDateCloseBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.webDateCloseText}>{t.done}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Native Mobile Date Picker */}
              {Platform.OS !== 'web' && showDatePicker && (
                <View style={[styles.iosDatePickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                  <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                    accentColor="#7EB93C"
                    themeVariant={isDark ? 'dark' : 'light'}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      style={styles.iosConfirmButton}
                      onPress={() => setShowDatePicker(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.iosConfirmButtonText}>{t.confirmTargetDate}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Days remaining badge */}
              <View style={[styles.daysRemainingContainer, { backgroundColor: theme.badgeBackground }]}>
                <Ionicons name="time-outline" size={20} color="#7EB93C" />
                <Text style={[styles.daysRemainingText, { color: theme.textBrand }]}>
                  {t.daysRemainingDesc.replace('{days}', daysRemaining.toString())}
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
              <Text style={styles.motivationText}>{t.motivationQuote}</Text>
              <View style={styles.motivationFooter}>
                <View style={styles.motivationDot} />
                <Text style={styles.motivationAuthor}>{t.motivationAuthor}</Text>
              </View>
            </Animated.View>

            {/* Buttons Row */}
            <Animated.View 
              entering={FadeInDown.duration(500).delay(500)} 
              style={styles.buttonRow}
            >
              <TouchableOpacity 
                style={[styles.resetButton, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]} 
                onPress={handleResetGoal}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>{t.resetGoal}</Text>
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
                    <Text style={styles.saveButtonText}>{t.saveGoal}</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={2500}
            action={{
              label: t.done,
              onPress: () => setSnackbarVisible(false),
              textColor: '#7EB93C',
            }}
            style={styles.snackbar}
          >
            {snackbarMessage}
          </Snackbar>
        </Portal>
          </>
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1.5,
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
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
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
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 2,
  },
  currentWeightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentWeightLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentWeightValue: {
    fontSize: 13,
    fontWeight: '800',
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
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  textInput: {
    height: 48,
  },
  diffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700',
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
  },
  progressPctText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7EB93C',
  },
  progressBarBackground: {
    height: 12,
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
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
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
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
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
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedLabel: {
    fontSize: 10,
    fontWeight: '700',
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
    borderWidth: 1.5,
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
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  daysRemainingText: {
    fontSize: 13,
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
    borderWidth: 1.5,
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
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
    borderWidth: 1.5,
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
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
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
