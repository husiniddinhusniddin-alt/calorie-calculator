import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';

const { height, width } = Dimensions.get('window');

const translations = {
  en: {
    title: "Tell us about you",
    age: "Age",
    heightLabel: "Height (cm)",
    weightLabel: "Weight (kg)",
    purpose: "Purpose",
    purposes: {
      lose: "Losing Weight",
      gain: "Gaining Weight",
      maintain: "Stay Healthy"
    },
    calcDiet: "Calculate Diet",
    aiPlanTitle: "Your AI Diet Plan",
    howItHelps: "How it helps you",
    whyBest: "Why it's the best option",
    acceptStart: "Accept Plan & Start",
    aiOfferTitle: "AI Diet Plan",
    aiOfferDesc: "Would you like us to create a highly personalized, AI-generated diet plan based on your unique body metrics and goals?",
    noThanks: "No, thanks",
    yesPlease: "Yes, please!",
    required: "Required",
    successTitle: "Success",
    successMsg: "Registration successful! Please confirm your email.",
    errorTitle: "Error",
    unexpectedError: "Unexpected error occurred"
  },
  ru: {
    title: "Расскажите о себе",
    age: "Возраст",
    heightLabel: "Рост (см)",
    weightLabel: "Вес (кг)",
    purpose: "Цель",
    purposes: {
      lose: "Похудение",
      gain: "Набор веса",
      maintain: "Поддержание здоровья"
    },
    calcDiet: "Рассчитать диету",
    aiPlanTitle: "Ваш план диеты от ИИ",
    howItHelps: "Как это вам поможет",
    whyBest: "Почему это лучший вариант",
    acceptStart: "Принять план и начать",
    aiOfferTitle: "План диеты от ИИ",
    aiOfferDesc: "Хотели бы вы, чтобы мы создали персонализированный план диеты с помощью ИИ на основе ваших уникальных метрик и целей?",
    noThanks: "Нет, спасибо",
    yesPlease: "Да, конечно!",
    required: "Обязательно",
    successTitle: "Успех",
    successMsg: "Регистрация прошла успешно! Пожалуйста, подтвердите ваш email.",
    errorTitle: "Ошибка",
    unexpectedError: "Произошла непредвиденная ошибка"
  },
  uz: {
    title: "O'zingiz haqingizda",
    age: "Yosh",
    heightLabel: "Bo'y (sm)",
    weightLabel: "Vazn (kg)",
    purpose: "Maqsad",
    purposes: {
      lose: "Vazn tashlash",
      gain: "Vazn yig'ish",
      maintain: "Sog'lom bo'lish"
    },
    calcDiet: "Diyetani hisoblash",
    aiPlanTitle: "AI Diyeta Rejangiz",
    howItHelps: "Bu sizga qanday yordam beradi",
    whyBest: "Nima uchun bu eng yaxshi tanlov",
    acceptStart: "Rejani qabul qilish va Boshlash",
    aiOfferTitle: "AI Diyeta Rejasi",
    aiOfferDesc: "Sizning tana o'lchovlaringiz va maqsadlaringizga moslashtirilgan AI diyeta rejasini yaratishimizni xohlaysizmi?",
    noThanks: "Yo'q, rahmat",
    yesPlease: "Ha, albatta!",
    required: "Majburiy",
    successTitle: "Muvaffaqiyatli",
    successMsg: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! Iltimos, emailingizni tasdiqlang.",
    errorTitle: "Xatolik",
    unexpectedError: "Kutilmagan xatolik yuz berdi"
  }
};

export default function RegisterDetailsScreen() {
  const router = useRouter();
  const { email, password, phone } = useLocalSearchParams();
  const [language] = useState<'en' | 'ru' | 'uz'>(MockStore.language as 'en' | 'ru' | 'uz');

  const t = translations[language];

  const PURPOSES = [
    { id: 'lose', label: t.purposes.lose },
    { id: 'gain', label: t.purposes.gain },
    { id: 'maintain', label: t.purposes.maintain },
  ];

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const [purpose, setPurpose] = useState('maintain');
  const [loading, setLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<'form' | 'plan'>('form');
  const [aiPlan, setAiPlan] = useState<any>(null);

  const [ageError, setAgeError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [heightError, setHeightError] = useState('');

  const registerUser = async (calorieGoal: number) => {
    setLoading(true);
    try {
      const numWeight = parseFloat(weight) || 80;
      let targetW = numWeight;
      if (purpose === 'lose') targetW -= 5;
      if (purpose === 'gain') targetW += 5;
      const numAge = parseInt(age, 10) || null;
      const numHeight = parseFloat(heightVal) || null;

      const { data, error } = await supabase.auth.signUp({
        email: email as string,
        password: password as string,
        options: {
          data: {
            phone: phone as string,
            current_weight: numWeight,
            starting_weight: numWeight,
            target_weight: targetW,
            daily_calorie_goal: calorieGoal,
            weekly_weight_goal: purpose === 'maintain' ? 0 : 0.5,
            age: numAge,
            height: numHeight,
          }
        }
      });

      if (error) {
        Alert.alert(t.errorTitle, error.message);
        setLoading(false);
        return;
      }

      if (data.session || data.user) {
        const userId = data.user?.id;

        if (userId) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: email as string,
            phone: phone as string,
            name: (email as string).split('@')[0],
            current_weight: numWeight,
            starting_weight: numWeight,
            target_weight: targetW,
            daily_calorie_goal: calorieGoal,
            weekly_weight_goal: purpose === 'maintain' ? 0 : 0.5,
            target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            age: numAge,
            height: numHeight,
            calorie_streak: 0,
            water_streak: 0,
            app_theme: 'system',
            language: language,
            notifications: MockStore.notifications,
          });

          if (profileError) {
            console.warn('Profile creation failed:', profileError.message);
          }
        }

        MockStore.update({
          profileImage: null,
          targetWeight: targetW,
          currentWeight: numWeight,
          startingWeight: numWeight,
          dailyCalorieGoal: calorieGoal,
          weeklyWeightGoal: purpose === 'maintain' ? 0 : 0.5,
          name: (email as string).split('@')[0],
          email: email as string,
          age: numAge,
          height: numHeight,
        });

        if (data.session) {
          router.replace('/(tabs)');
        } else {
          Alert.alert(t.successTitle, t.successMsg);
          router.replace('/(auth)/login');
        }
      }
    } catch (err: any) {
      Alert.alert(t.errorTitle, err.message || t.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (loading) return;
    
    let isValid = true;

    if (!age.trim()) { setAgeError(t.required); isValid = false; } else { setAgeError(''); }
    if (!weight.trim()) { setWeightError(t.required); isValid = false; } else { setWeightError(''); }
    if (!heightVal.trim()) { setHeightError(t.required); isValid = false; } else { setHeightError(''); }

    if (!isValid) return;

    setShowOfferModal(true);
  };

  const handleAcceptAI = async () => {
    setLoading(true);
    try {
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .single();

      if (secretError || !secretData?.value) {
        throw new Error('OpenAI API Key not found');
      }

      const langName = language === 'ru' ? 'Russian' : language === 'uz' ? 'Uzbek' : 'English';
      const prompt = `I am a ${age} years old person, my weight is ${weight} kg and my height is ${heightVal} cm. My goal is ${purpose === 'lose' ? 'losing weight' : purpose === 'gain' ? 'gaining weight' : 'maintaining health'}. Please calculate my recommended daily calorie intake. Also calculate my BMI and current BMI status (e.g., Overweight, Normal). Explain how this diet will help me and why it is the best option.
      
      CRITICAL: You MUST write the 'status', 'explanation', and 'why_best' fields entirely in ${langName} language. Do not use English for these text fields.
      
      Return ONLY a JSON object strictly following this structure:
      {
        "calories": <number: calculated total daily calories>,
        "bmi": <number: calculated BMI>,
        "status": "<string: BMI status in ${langName}>",
        "explanation": "<string: explanation of diet in ${langName}>",
        "why_best": "<string: why it's best in ${langName}>"
      }`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretData.value}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
          const content = JSON.parse(data.choices[0].message.content);
          if (content.calories && content.bmi) {
            setAiPlan(content);
            setCurrentStep('plan');
          } else {
            throw new Error("Invalid AI response");
          }
      } else {
          throw new Error("Invalid AI response");
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert('AI Error', 'Failed to generate AI diet. Falling back to standard 2000 kcal.');
      registerUser(2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.headerBackground}>
            <TouchableOpacity style={styles.backButton} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/register'))}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.patternDot} />
            <View style={[styles.patternDot, { top: 70, right: 60, width: 10, height: 10 }]} />
            <View style={[styles.patternLeaf, { top: 90, left: 40 }]} />
            <View style={[styles.patternLeaf, { top: 50, right: 100, transform: [{ rotate: '-30deg' }] }]} />
          </View>

          <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.card}>
            <View style={styles.formContainer}>
              {currentStep === 'form' ? (
                <>
                  <Text style={styles.title}>{t.title}</Text>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>{t.age}</Text>
                      <View style={[styles.inputWrapper, ageError ? styles.inputWrapperError : null]}>
                        <TextInput style={styles.input} placeholder="e.g. 25" placeholderTextColor="#A9A9A9" value={age} onChangeText={(text) => { setAge(text); if (ageError) setAgeError(''); }} keyboardType="numeric" />
                      </View>
                      {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
                    </View>

                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                      <Text style={styles.inputLabel}>{t.heightLabel}</Text>
                      <View style={[styles.inputWrapper, heightError ? styles.inputWrapperError : null]}>
                        <TextInput style={styles.input} placeholder="e.g. 175" placeholderTextColor="#A9A9A9" value={heightVal} onChangeText={(text) => { setHeightVal(text); if (heightError) setHeightError(''); }} keyboardType="numeric" />
                      </View>
                      {heightError ? <Text style={styles.errorText}>{heightError}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t.weightLabel}</Text>
                    <View style={[styles.inputWrapper, weightError ? styles.inputWrapperError : null]}>
                      <TextInput style={styles.input} placeholder="e.g. 70" placeholderTextColor="#A9A9A9" value={weight} onChangeText={(text) => { setWeight(text); if (weightError) setWeightError(''); }} keyboardType="numeric" />
                    </View>
                    {weightError ? <Text style={styles.errorText}>{weightError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t.purpose}</Text>
                    <View style={styles.purposeContainer}>
                      {PURPOSES.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.purposeOption, purpose === item.id && styles.purposeOptionSelected]}
                          onPress={() => setPurpose(item.id)}
                        >
                          <Text style={[styles.purposeText, purpose === item.id && styles.purposeTextSelected]}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity activeOpacity={0.8} style={[styles.nextButton, loading && { opacity: 0.7 }]} onPress={handleNext} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#7EB93C" /> : <Text style={styles.nextButtonText}>{t.calcDiet}</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.title}>{t.aiPlanTitle}</Text>

                  <View style={styles.planCard}>
                    <View style={styles.planMetricRow}>
                      <View style={styles.planMetric}>
                        <Text style={styles.planMetricValue}>{aiPlan?.calories}</Text>
                        <Text style={styles.planMetricLabel}>Kcal / day</Text>
                      </View>
                      <View style={styles.planMetricDivider} />
                      <View style={styles.planMetric}>
                        <Text style={styles.planMetricValue}>{aiPlan?.bmi}</Text>
                        <Text style={styles.planMetricLabel}>BMI ({aiPlan?.status})</Text>
                      </View>
                    </View>

                    <Text style={styles.planSubtitle}>{t.howItHelps}</Text>
                    <Text style={styles.planText}>{aiPlan?.explanation}</Text>

                    <Text style={styles.planSubtitle}>{t.whyBest}</Text>
                    <Text style={styles.planText}>{aiPlan?.why_best}</Text>
                  </View>

                  <TouchableOpacity activeOpacity={0.8} style={[styles.nextButton, loading && { opacity: 0.7 }]} onPress={() => registerUser(aiPlan?.calories || 2000)} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#7EB93C" /> : <Text style={styles.nextButtonText}>{t.acceptStart}</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* AI Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.offerModalContent}>
            <View style={styles.offerIconContainer}>
              <Ionicons name="sparkles" size={40} color="#FFF" />
            </View>
            <Text style={styles.offerModalTitle}>{t.aiOfferTitle}</Text>
            <Text style={styles.offerModalText}>
              {t.aiOfferDesc}
            </Text>
            
            <View style={styles.offerButtonsContainer}>
              <TouchableOpacity
                style={[styles.offerBtn, styles.offerBtnReject]}
                onPress={() => {
                  setShowOfferModal(false);
                  registerUser(2000);
                }}
              >
                <Text style={styles.offerBtnRejectText}>{t.noThanks}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.offerBtn, styles.offerBtnAccept]}
                onPress={async () => {
                  setShowOfferModal(false);
                  await handleAcceptAI();
                }}
              >
                <Text style={styles.offerBtnAcceptText}>{t.yesPlease}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7EB93C' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerBackground: { height: height * 0.15, width: '100%', position: 'absolute', top: 0, backgroundColor: '#7EB93C' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  patternDot: { position: 'absolute', top: 60, left: 50, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  patternLeaf: { position: 'absolute', width: 14, height: 14, borderTopLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  card: { flex: 1, marginTop: height * 0.12, backgroundColor: '#FFFFFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  formContainer: { paddingHorizontal: 30, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#3A5C18', textAlign: 'center', marginBottom: 35 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 25 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#8CC33F', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderColor: '#E8F5D8', paddingBottom: 8 },
  input: { flex: 1, fontSize: 16, color: '#333333', paddingVertical: 4 },
  purposeContainer: { gap: 12 },
  purposeOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#E8F5D8', backgroundColor: '#FFFFFF' },
  purposeOptionSelected: { borderColor: '#7EB93C', backgroundColor: '#F5FAF0' },
  purposeText: { fontSize: 15, color: '#555555', fontWeight: '500', textAlign: 'center' },
  purposeTextSelected: { color: '#7EB93C', fontWeight: '700' },
  nextButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#7EB93C', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#7EB93C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  nextButtonText: { color: '#7EB93C', fontSize: 18, fontWeight: '700' },
  inputWrapperError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  offerModalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  offerIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7EB93C', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#7EB93C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  offerModalTitle: { fontSize: 24, fontWeight: '800', color: '#3A5C18', marginBottom: 12 },
  offerModalText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  offerButtonsContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  offerBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  offerBtnReject: { backgroundColor: '#F5F5F5' },
  offerBtnAccept: { backgroundColor: '#7EB93C', shadowColor: '#7EB93C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  offerBtnRejectText: { color: '#888', fontSize: 16, fontWeight: '700' },
  offerBtnAcceptText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  planCard: { backgroundColor: '#F5FAF0', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E8F5D8' },
  planMetricRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E8F5D8' },
  planMetric: { alignItems: 'center' },
  planMetricValue: { fontSize: 26, fontWeight: '800', color: '#7EB93C', marginBottom: 4 },
  planMetricLabel: { fontSize: 12, color: '#666', fontWeight: '600', textTransform: 'uppercase' },
  planMetricDivider: { width: 1, height: 40, backgroundColor: '#E8F5D8' },
  planSubtitle: { fontSize: 16, fontWeight: '700', color: '#3A5C18', marginBottom: 8, marginTop: 4 },
  planText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 16 },
});
