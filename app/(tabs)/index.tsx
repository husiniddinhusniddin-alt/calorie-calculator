import { MockStore } from '@/constants/store';
import { supabase } from '@/constants/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import Animated, { Easing, FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const translations = {
  en: {
    monday: 'Monday',
    nov24: 'Nov 24, 2025',
    dailyCalorieTarget: 'Daily Calorie Target',
    ofKcal: 'of {goal} Kcal',
    addFood: 'Add food',
    carbs: 'Carbs',
    protein: 'Protein',
    fat: 'Fat',
    ofGr: 'of {max} gr',
    calorieTrends: 'Calorie Trends',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    noProducts: 'No products added yet',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    aiIdentifiedFood: 'AI Identified Food',
    success: 'Success',
    photoCaptured: 'Photo captured successfully! AI is analyzing your food...',
    permissionRequired: 'Permission required',
    cameraPermission: 'Camera permission is required to add food via photos!',
    error: 'Error',
    couldNotOpen: 'Could not open camera. Ensure you are on a physical device and the app was restarted after installing the camera module.',
    addToWhichMeal: 'Add to which meal?',
    updateDailyGoal: 'Update Daily Goal',
    cancel: 'Cancel',
    save: 'Save',
    oatmealText: 'Oatmeal with fruits and nuts',
    chopsText: 'Chops with potatoes',
  },
  ru: {
    monday: 'Понедельник',
    nov24: '24 нояб. 2025 г.',
    dailyCalorieTarget: 'Дневная цель калорий',
    ofKcal: 'из {goal} ккал',
    addFood: 'Добавить еду',
    carbs: 'Углеводы',
    protein: 'Белки',
    fat: 'Жиры',
    ofGr: 'из {max} г',
    calorieTrends: 'Тренды калорий',
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    noProducts: 'Продукты еще не добавлены',
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
    aiIdentifiedFood: 'Еда, определенная ИИ',
    success: 'Успех',
    photoCaptured: 'Фото успешно сделано! ИИ анализирует еду...',
    permissionRequired: 'Требуется разрешение',
    cameraPermission: 'Разрешение на камеру требуется для добавления еды по фото!',
    error: 'Ошибка',
    couldNotOpen: 'Не удалось открыть камеру. Убедитесь, что вы используете реальное устройство.',
    addToWhichMeal: 'В какой прием пищи?',
    updateDailyGoal: 'Изменить дневную цель',
    cancel: 'Отмена',
    save: 'Сохранить',
    oatmealText: 'Овсянка с фруктами и орехами',
    chopsText: 'Отбивные с картофелем',
  },
  uz: {
    monday: 'Dushanba',
    nov24: '24-noy, 2025',
    dailyCalorieTarget: 'Kunlik kaloriya maqsadi',
    ofKcal: '{goal} Kcal dan',
    addFood: 'Taom qo\'shish',
    carbs: 'Uglevodlar',
    protein: 'Oqsillar',
    fat: 'Yog\'lar',
    ofGr: '{max} gr dan',
    calorieTrends: 'Kaloriya tendensiyalari',
    day: 'Kun',
    week: 'Hafta',
    month: 'Oy',
    noProducts: 'Hozircha mahsulot qo\'shilmagan',
    breakfast: 'Nonushta',
    lunch: 'Tushlik',
    dinner: 'Kechki ovqat',
    snack: 'Tamaddi',
    aiIdentifiedFood: 'AI aniqlagan taom',
    success: 'Muvaffaqiyat',
    photoCaptured: 'Rasm muvaffaqiyatli olindi! AI taomingizni tahlil qilmoqda...',
    permissionRequired: 'Ruxsat talab qilinadi',
    cameraPermission: 'Rasm orqali taom qo\'shish uchun kameraga ruxsat berilishi kerak!',
    error: 'Xatolik',
    couldNotOpen: 'Kamerani ochib bo\'lmadi. Qurilmada ishlayotganingizni va kamera sozlamalari to\'g\'ri ekanligini tekshiring.',
    addToWhichMeal: 'Qaysi taomga qo\'shilsin?',
    updateDailyGoal: 'Kunlik maqsadni o\'zgartirish',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    oatmealText: 'Mevalar va yong\'oqlar bilan suli bo\'tqasi',
    chopsText: 'Kartoshka bilan otbivnoy',
  }
};

const DIARY_MEALS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    color: '#F4C344',
    calories: 300,
    items: ['Oatmeal with fruits and nuts'],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    color: '#7EB93C',
    calories: 279,
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
    id: 'snack',
    label: 'Snack',
    color: '#A8A4D8',
    calories: 0,
    items: [],
    empty: true,
  },
];

const DEFAULT_DAILY_GOAL = 2000;
const DEFAULT_CARBS_GOAL = 250; // (2000 * 0.5) / 4
const DEFAULT_PROTEIN_GOAL = 150; // (2000 * 0.3) / 4
const DEFAULT_FATS_GOAL = 44; // (2000 * 0.2) / 9

const TRENDS_DATA = {
  day: {
    max: 1500,
    data: [
      { label: '8AM', value: 300 },
      { label: '11AM', value: 250 },
      { label: '2PM', value: 600 },
      { label: '5PM', value: 200 },
      { label: '8PM', value: 800 },
      { label: '10PM', value: 0 },
    ]
  },
  week: {
    max: 3000,
    data: [
      { label: 'MON', value: 1200 },
      { label: 'TUE', value: 1400 },
      { label: 'WED', value: 1250 },
      { label: 'THU', value: 1700 },
      { label: 'FRI', value: 1500 },
      { label: 'SAT', value: 2000 },
      { label: 'SUN', value: 1750 },
    ]
  },
  month: {
    max: 2500,
    data: [
      { label: 'W1', value: 1400 },
      { label: 'W2', value: 1600 },
      { label: 'W3', value: 1550 },
      { label: 'W4', value: 1800 },
    ]
  }
};

const MOCK_SCANNED_RESULT = {
  image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  mealType: 'Breakfast',
  title: 'Combo Cheesy Sunny Side-Up',
  subtitle: 'With plain toast bread',
  serving: 1,
  calories: 475,
  macros: { carbs: 15, protein: 35, fat: 23 },
  ingredients: [
    { name: 'Bread Toast', weight: '100gr', calories: 110, carbs: 50, protein: 8, fat: 1 },
    { name: 'Fried Egg', weight: '100gr', calories: 201, carbs: 1, protein: 13, fat: 15 }
  ]
};

const DashedGauge = ({ percentage, radius, strokeWidth, filledColor, unfilledColor }: any) => {
  const totalDashes = 45;
  return (
    <View style={{ width: radius * 2, height: radius, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ width: radius * 2, height: radius * 2, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: totalDashes + 1 }).map((_, i) => {
          const angle = -90 + (180 * (i / totalDashes));
          const isFilled = (i / totalDashes) <= percentage;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 4,
                height: strokeWidth,
                backgroundColor: isFilled ? filledColor : unfilledColor,
                borderRadius: 2,
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -(radius - strokeWidth / 2) }
                ]
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

const MacroRing = ({ percentage, color, unfilledColor, children }: any) => {
  const size = 60;
  const stroke = 4;
  const radius = size / 2;
  const angle = Math.min(Math.max(percentage, 0), 1) * 360;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
      {/* Base background ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: radius, borderWidth: stroke, borderColor: unfilledColor }} />

      {/* Right half container */}
      <View style={{ position: 'absolute', width: radius, height: size, right: 0, overflow: 'hidden' }}>
        <View style={{
          width: size, height: size, borderRadius: radius, borderWidth: stroke,
          borderColor: 'transparent', borderTopColor: color, borderRightColor: color,
          position: 'absolute', right: 0,
          transform: [{ rotate: '-135deg' }, { rotate: `${Math.min(angle, 180)}deg` }]
        }} />
      </View>

      {/* Left half container */}
      {angle > 180 && (
        <View style={{ position: 'absolute', width: radius, height: size, left: 0, overflow: 'hidden' }}>
          <View style={{
            width: size, height: size, borderRadius: radius, borderWidth: stroke,
            borderColor: 'transparent', borderBottomColor: color, borderLeftColor: color,
            position: 'absolute', left: 0,
            transform: [{ rotate: '-135deg' }, { rotate: `${angle - 180}deg` }]
          }} />
        </View>
      )}

      {children}
    </View>
  );
};

const AnimatedBarFill = ({ percentage, style }: { percentage: number, style: any }) => {
  const heightProgress = useSharedValue(0);

  useEffect(() => {
    heightProgress.value = withTiming(percentage, { duration: 600, easing: Easing.out(Easing.exp) });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${heightProgress.value}%`,
    };
  });

  return <Animated.View style={[style, animatedStyle]} />;
};

const SkeletonItem = ({ style, isDark }: { style: any, isDark: boolean }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animatedStyle, { backgroundColor: isDark ? '#333' : '#E2E8F0' }]} />;
};

const analyzeFoodWithAI = async (base64Image: string) => {
  const { data: secretData, error: secretError } = await supabase
    .from('secrets')
    .select('value')
    .eq('name', 'OPENAI_API_KEY')
    .single();

  if (secretError || !secretData?.value) {
    throw new Error('OpenAI API Key not found in Supabase secrets table');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretData.value}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an AI food calorie analyzer. Your primary goal is to identify real food items from images and estimate their calories as accurately as possible.\n\n" +
                    "Rules:\n" +
                    "1. First, determine whether the image contains real, edible food.\n" +
                    "2. If you are reasonably confident (70% or higher) that the image shows real food, or if the image is uncertain but appears to contain food, analyze it and make your best estimate instead of rejecting it.\n" +
                    "3. Do NOT reject an image simply because of poor lighting, homemade appearance, low image quality, partial visibility, or if the food is in a bowl/plate/open packaging.\n" +
                    "4. Reject the image ONLY if you are highly confident it does NOT contain real food, such as drawings, illustrations, paintings, 3D renders, video game screenshots, toys, plastic food, empty scenes, people without visible food, animals, furniture, or non-food objects.\n" +
                    "5. Never hallucinate food that is clearly absent.\n" +
                    "6. If multiple foods are present, identify each separately, estimate for each, and sum them in the total.\n" +
                    "7. If confidence is low, state that the estimate is approximate (e.g. in the subtitle) rather than refusing to analyze.\n" +
                    "8. IMPORTANT: Estimate the approximate weight (in grams) of the food portion shown in the image. Base ALL your calorie and macronutrient calculations strictly on this estimated weight. Include this total estimated weight clearly in the 'subtitle' field.\n\n" +
                    "Output Format:\n" +
                    "You must return ONLY a JSON object in this format (no markdown formatting):\n" +
                    "If Food Detected is Yes:\n" +
                    "{\n" +
                    "  \"title\": \"Name of the dish(es) found\",\n" +
                    "  \"subtitle\": \"Estimated total weight (e.g., '350g') - brief description\",\n" +
                    "  \"serving\": 1,\n" +
                    "  \"calories\": 450,\n" +
                    "  \"macros\": { \"carbs\": 40, \"protein\": 20, \"fat\": 15 },\n" +
                    "  \"ingredients\": [\n" +
                    "    { \"name\": \"Ingredient / component name\", \"weight\": \"100g\", \"calories\": 200, \"carbs\": 20, \"protein\": 10, \"fat\": 8 }\n" +
                    "  ]\n" +
                    "}\n" +
                    "If Food Detected is No (rejected as non-food with high confidence):\n" +
                    "{\n" +
                    "  \"error\": \"not_food\",\n" +
                    "  \"reason\": \"Explain why the image does not appear to contain real edible food with high confidence\"\n" +
                    "}"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  }
  throw new Error("Failed to analyze image");
};

export default function DiaryScreen() {
  const router = useRouter();
  
  const [appTheme, setAppTheme] = useState(MockStore.appTheme);
  const [language, setLanguage] = useState(MockStore.language);
  const [dailyGoal, setDailyGoal] = useState(MockStore.dailyCalorieGoal);
  const [profileImage, setProfileImage] = useState<string | null>(MockStore.profileImage);
  const [userName, setUserName] = useState(MockStore.name);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return MockStore.subscribe(() => {
      setAppTheme(MockStore.appTheme);
      setLanguage(MockStore.language);
      setDailyGoal(MockStore.dailyCalorieGoal);
      setProfileImage(MockStore.profileImage);
      setUserName(MockStore.name);
    });
  }, []);

  const systemColorScheme = useColorScheme();
  const isDark = appTheme === 'system' ? systemColorScheme === 'dark' : appTheme === 'dark';
  const t = translations[language] || translations.en;

  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A1A1A',
    textSecondary: isDark ? '#9AA88E' : '#555',
    textMuted: isDark ? '#6B785E' : '#888',
    pillBackground: isDark ? '#23321A' : '#FFFFFF',
    gaugeUnfilled: isDark ? '#2A3A1E' : '#EAEAEA',
    macroRingBg: isDark ? '#2A3A1E' : '#F0F0F0',
    mealBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    mealEmptyText: isDark ? '#5A684E' : '#BBBBBB',
  };

  const [meals, setMeals] = useState<any[]>([
    { id: 'breakfast', label: 'Breakfast', color: '#F4C344', calories: 0, items: [], empty: true },
    { id: 'lunch', label: 'Lunch', color: '#7EB93C', calories: 0, items: [], empty: true },
    { id: 'dinner', label: 'Dinner', color: '#E8A86F', calories: 0, items: [], empty: true },
    { id: 'snack', label: 'Snack', color: '#A8A4D8', calories: 0, items: [], empty: true },
  ]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  // Macro goals (from profiles table)
  const [carbsGoal, setCarbsGoal] = useState(DEFAULT_CARBS_GOAL);
  const [proteinGoal, setProteinGoal] = useState(DEFAULT_PROTEIN_GOAL);
  const [fatGoal, setFatGoal] = useState(DEFAULT_FATS_GOAL);

  // Macro totals for the selected day (summed across all meals)
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  // Fetch profile data (name, calorie goal) from profiles when userId is known
  useEffect(() => {
    if (!userId) return;
    const fetchProfileData = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, daily_calorie_goal')
        .eq('id', userId)
        .single();

      if (data) {
        let storeUpdates: any = {};

        if (data.name) {
          storeUpdates.name = data.name;
        }

        if (data.daily_calorie_goal) {
          const goal = data.daily_calorie_goal;
          storeUpdates.dailyCalorieGoal = goal;
          setCarbsGoal(Math.round((goal * 0.50) / 4));
          setProteinGoal(Math.round((goal * 0.30) / 4));
          setFatGoal(Math.round((goal * 0.20) / 9));
        }

        if (Object.keys(storeUpdates).length > 0) {
          MockStore.update(storeUpdates);
        }
      }
    };
    fetchProfileData();
  }, [userId]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!userId) return;
    const fetchMeals = async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedDate);

      const baseMeals = [
        { id: 'breakfast', label: 'Breakfast', color: '#F4C344', calories: 0, items: [], empty: true },
        { id: 'lunch', label: 'Lunch', color: '#7EB93C', calories: 0, items: [], empty: true },
        { id: 'dinner', label: 'Dinner', color: '#E8A86F', calories: 0, items: [], empty: true },
        { id: 'snack', label: 'Snack', color: '#A8A4D8', calories: 0, items: [], empty: true },
      ];

      if (data && !error) {
        const updatedMeals = baseMeals.map(emptyMeal => {
          const found = data.find((d: any) => d.meal_type === emptyMeal.id);
          if (found) {
            const items = typeof found.items === 'string' ? JSON.parse(found.items) : (found.items || []);
            return {
              ...emptyMeal,
              calories: found.calories || 0,
              carbs: found.carbs || 0,
              protein: found.protein || 0,
              fat: found.fat || 0,
              items: items,
              empty: items.length === 0 && (found.calories || 0) === 0
            };
          }
          return emptyMeal;
        });
        setMeals(updatedMeals);
        // Recalculate daily macro totals
        setTotalCarbs(updatedMeals.reduce((s: number, m: any) => s + (m.carbs || 0), 0));
        setTotalProtein(updatedMeals.reduce((s: number, m: any) => s + (m.protein || 0), 0));
        setTotalFat(updatedMeals.reduce((s: number, m: any) => s + (m.fat || 0), 0));
      } else {
        setMeals(baseMeals);
        setTotalCarbs(0); setTotalProtein(0); setTotalFat(0);
      }
    };
    fetchMeals();
  }, [userId, selectedDate]);

  const dateObj = new Date(selectedDate);
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';
  const formattedDayName = dateObj.toLocaleDateString(locale, { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const [activeTrendTab, setActiveTrendTab] = useState<'day' | 'week' | 'month'>('day');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsFetching(true);
    const fetchAll = async () => {
      // Fake delay to ensure a smooth, visible loading screen during date switch
      await new Promise(res => setTimeout(res, 500));
      setIsFetching(false);
    };
    fetchAll();
  }, [userId, selectedDate]);

  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  const [tempCarbs, setTempCarbs] = useState(carbsGoal.toString());
  const [tempProtein, setTempProtein] = useState(proteinGoal.toString());
  const [tempFat, setTempFat] = useState(fatGoal.toString());
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStep, setScannerStep] = useState<'camera' | 'processing' | 'error'>('camera');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scannedResult, setScannedResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  // Real trend chart data from Supabase
  const [trendChartData, setTrendChartData] = useState<{ label: string; value: number }[]>([]);
  const [trendMax, setTrendMax] = useState(2000);

  useEffect(() => {
    if (!userId) return;
    const fetchTrendData = async () => {
      const today = new Date();
      let rows: { label: string; value: number }[] = [];
      let maxVal = 2000;

      if (activeTrendTab === 'day') {
        // Sum calories per meal for today
        const { data } = await supabase
          .from('diary_entries')
          .select('meal_type, calories')
          .eq('user_id', userId)
          .eq('date', selectedDate);
        const slots = ['8AM', '11AM', '2PM', '5PM', '8PM', '10PM'];
        // Map meal entries to time slots with their calories
        const mealCalMap: Record<string, number> = {};
        (data || []).forEach((r: any) => { mealCalMap[r.meal_type] = r.calories || 0; });
        const mealOrder = ['breakfast', 'lunch', 'lunch', 'dinner', 'dinner', 'snack'];
        rows = slots.map((label, i) => ({ label, value: mealCalMap[mealOrder[i]] || 0 }));
        maxVal = Math.max(2000, ...rows.map(r => r.value));

      } else if (activeTrendTab === 'week') {
        // Fetch last 7 days in a single query
        const dStart = new Date(today);
        dStart.setDate(today.getDate() - 6);
        const startDateStr = dStart.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        const { data } = await supabase
          .from('diary_entries')
          .select('date, calories')
          .eq('user_id', userId)
          .gte('date', startDateStr)
          .lte('date', endDateStr);

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);

          const total = (data || [])
            .filter((r: any) => r.date === dateStr)
            .reduce((s: number, r: any) => s + (r.calories || 0), 0);

          rows.push({ label: dayLabel, value: total });
        }
        maxVal = Math.max(2000, ...rows.map(r => r.value));

      } else {
        // Fetch last 4 weeks in a single query
        const wsStart = new Date(today);
        wsStart.setDate(today.getDate() - 3 * 7 - today.getDay());
        const startDateStr = wsStart.toISOString().split('T')[0];

        const weEnd = new Date(today);
        weEnd.setDate(today.getDate() - today.getDay() + 6);
        const endDateStr = weEnd.toISOString().split('T')[0];

        const { data } = await supabase
          .from('diary_entries')
          .select('date, calories')
          .eq('user_id', userId)
          .gte('date', startDateStr)
          .lte('date', endDateStr);

        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - i * 7 - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const s = weekStart.toISOString().split('T')[0];
          const e = weekEnd.toISOString().split('T')[0];

          const total = (data || [])
            .filter((r: any) => r.date >= s && r.date <= e)
            .reduce((s2: number, r: any) => s2 + (r.calories || 0), 0);

          rows.push({ label: `W${4 - i}`, value: total });
        }
        maxVal = Math.max(2000, ...rows.map(r => r.value));
      }

      setTrendChartData(rows);
      setTrendMax(maxVal);
    };
    fetchTrendData();
  }, [userId, activeTrendTab, selectedDate]);

  const resultTransition = useSharedValue(0);

  const trendTabsList = ['day', 'week', 'month'];
  const activeTabIndex = trendTabsList.indexOf(activeTrendTab);

  const animatedTabIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(activeTabIndex * 60, { duration: 400, easing: Easing.out(Easing.exp) }) }]
    };
  });

  const animatedImageWrapperStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(resultTransition.value, [0, 1], [SCREEN_HEIGHT * 0.8, SCREEN_HEIGHT * 0.4]),
      borderRadius: interpolate(resultTransition.value, [0, 1], [0, 24]),
    };
  });

  const animatedDetailsOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: resultTransition.value,
    };
  });

  const animatedScanningOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - resultTransition.value,
    };
  });

  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanLinePosition.value = 0;
      scanLinePosition.value = withRepeat(
        withTiming(240, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      // Reset position when not scanning
      scanLinePosition.value = 0;
    }
  }, [isScanning, scanLinePosition]);

  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLinePosition.value }]
    };
  });

  const animatedBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: interpolate(resultTransition.value, [0, 1], [SCREEN_HEIGHT, 0]) }],
    };
  });


  useEffect(() => {
    setTempGoal(dailyGoal.toString());
    setTempCarbs(carbsGoal.toString());
    setTempProtein(proteinGoal.toString());
    setTempFat(fatGoal.toString());
  }, [dailyGoal, carbsGoal, proteinGoal, fatGoal]);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  const localizedMeals = meals.map(meal => ({
    ...meal,
    label: t[meal.id as keyof typeof t] || meal.label,
    items: meal.items.map((item: string) => {
      if (item === 'Oatmeal with fruits and nuts') return t.oatmealText;
      if (item === 'Chops with potatoes') return t.chopsText;
      if (item === 'AI Identified Food') return t.aiIdentifiedFood;
      return item;
    })
  }));

  const handleAddFood = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(t.permissionRequired, t.cameraPermission);
        return;
      }

      setScannerStep('camera');
      setScannedResult(null);
      setSelectedMealType(null);
      setIsScanning(true);
    } catch (error) {
      Alert.alert(t.error, t.couldNotOpen);
      console.log(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header Top Row - Fixed */}
      <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[styles.header, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Math.max(10, insets.top) + 4 }]}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={[styles.datePill, { backgroundColor: theme.pillBackground }]}
              onPress={() => setCalendarVisible(true)}
            >
              <View style={[styles.dateIconContainer, { borderColor: theme.macroRingBg }]}>
                <Ionicons name="calendar-outline" size={18} color={theme.textPrimary} />
              </View>
              <View>
                <Text style={[styles.dateDay, { color: theme.textPrimary, textTransform: 'capitalize' }]}>{formattedDayName}</Text>
                <Text style={[styles.dateFull, { color: theme.textMuted }]}>{formattedDate}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              <View style={[styles.avatarContainer, { backgroundColor: theme.pillBackground, justifyContent: 'center', alignItems: 'center' }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#7EB93C' }}>
                    {userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: Math.max(10, insets.top) + 60 }]} showsVerticalScrollIndicator={false}>
        {isFetching ? (
          <View style={{ marginTop: 0 }}>
            {/* Target Card Skeleton */}
            <SkeletonItem style={{ height: 260, borderRadius: 24, marginBottom: 16 }} isDark={isDark} />
            {/* Macros Skeleton */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
              <SkeletonItem style={{ flex: 1, height: 120, borderRadius: 24 }} isDark={isDark} />
              <SkeletonItem style={{ flex: 1, height: 120, borderRadius: 24 }} isDark={isDark} />
              <SkeletonItem style={{ flex: 1, height: 120, borderRadius: 24 }} isDark={isDark} />
            </View>
            {/* Trend Chart Skeleton */}
            <SkeletonItem style={{ height: 250, borderRadius: 24, marginBottom: 16 }} isDark={isDark} />
            {/* Meal Cards Skeleton */}
            <SkeletonItem style={{ height: 80, borderRadius: 24, marginBottom: 14 }} isDark={isDark} />
            <SkeletonItem style={{ height: 80, borderRadius: 24, marginBottom: 14 }} isDark={isDark} />
            <SkeletonItem style={{ height: 80, borderRadius: 24, marginBottom: 14 }} isDark={isDark} />
            <SkeletonItem style={{ height: 80, borderRadius: 24, marginBottom: 14 }} isDark={isDark} />
          </View>
        ) : (
          <>
            {/* Daily Calorie Target Gauge */}
            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.targetCard, { backgroundColor: theme.cardBackground }]}>
              <TouchableOpacity
                style={[styles.editTargetBtn, { backgroundColor: theme.pillBackground }]}
                onPress={() => {
                  setTempGoal(dailyGoal.toString());
                  setEditModalVisible(true);
                }}
              >
                <Ionicons name="pencil" size={16} color={theme.textMuted} />
              </TouchableOpacity>

              <View style={[styles.targetPill, { borderColor: theme.macroRingBg }]}>
                <Text style={[styles.targetPillText, { color: theme.textSecondary }]}>{t.dailyCalorieTarget}</Text>
              </View>

              <View style={styles.gaugeWrapper}>
                <DashedGauge
                  percentage={Math.min(totalCalories / dailyGoal, 1)}
                  radius={120}
                  strokeWidth={24}
                  filledColor="#7EB93C"
                  unfilledColor={theme.gaugeUnfilled}
                />
                <View style={styles.gaugeCenter}>
                  <Text style={[styles.gaugeValue, { color: theme.textPrimary }]}>{totalCalories}</Text>
                  <Text style={[styles.gaugeTotal, { color: theme.textMuted }]}>{t.ofKcal.replace('{goal}', dailyGoal.toString())}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Add Food Button */}
            <Animated.View entering={FadeInDown.duration(500).delay(125)}>
              <TouchableOpacity style={styles.addFoodBtn} activeOpacity={0.8} onPress={handleAddFood}>
                <Ionicons name="camera" size={22} color="#FFFFFF" />
                <Text style={styles.addFoodBtnText}>{t.addFood}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Macros Row */}
            <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.macrosRow}>
              <View style={[styles.macroCard, { backgroundColor: theme.cardBackground }]}>
                <MacroRing percentage={carbsGoal ? totalCarbs / carbsGoal : 0} color="#F4C344" unfilledColor={theme.macroRingBg}>
                  <MaterialCommunityIcons name="corn" size={24} color="#F4C344" />
                </MacroRing>
                <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{totalCarbs}</Text>
                <Text style={[styles.macroTotal, { color: theme.textMuted }]}>{t.ofGr.replace('{max}', carbsGoal.toString())}</Text>
                <View style={[styles.macroNamePill, { borderColor: theme.macroRingBg }]}>
                  <Text style={[styles.macroNameText, { color: theme.textSecondary }]}>{t.carbs}</Text>
                </View>
              </View>
              <View style={[styles.macroCard, { backgroundColor: theme.cardBackground }]}>
                <MacroRing percentage={proteinGoal ? totalProtein / proteinGoal : 0} color="#C93A3E" unfilledColor={theme.macroRingBg}>
                  <MaterialCommunityIcons name="food-steak" size={24} color="#C93A3E" />
                </MacroRing>
                <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{totalProtein}</Text>
                <Text style={[styles.macroTotal, { color: theme.textMuted }]}>{t.ofGr.replace('{max}', proteinGoal.toString())}</Text>
                <View style={[styles.macroNamePill, { borderColor: theme.macroRingBg }]}>
                  <Text style={[styles.macroNameText, { color: theme.textSecondary }]}>{t.protein}</Text>
                </View>
              </View>
              <View style={[styles.macroCard, { backgroundColor: theme.cardBackground }]}>
                <MacroRing percentage={fatGoal ? totalFat / fatGoal : 0} color="#E8A86F" unfilledColor={theme.macroRingBg}>
                  <Ionicons name="water" size={24} color="#E8A86F" />
                </MacroRing>
                <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{totalFat}</Text>
                <Text style={[styles.macroTotal, { color: theme.textMuted }]}>{t.ofGr.replace('{max}', fatGoal.toString())}</Text>
                <View style={[styles.macroNamePill, { borderColor: theme.macroRingBg }]}>
                  <Text style={[styles.macroNameText, { color: theme.textSecondary }]}>{t.fat}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Calorie Trends Chart */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)} style={[styles.chartCard, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>{t.calorieTrends}</Text>
                <View style={[styles.chartTabs, { backgroundColor: theme.pillBackground, position: 'relative', overflow: 'hidden' }]}>
                  <Animated.View style={[{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: 60,
                    backgroundColor: '#7EB93C',
                    borderRadius: 6,
                  }, animatedTabIndicatorStyle]} />

                  {trendTabsList.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.chartTab, { width: 60, alignItems: 'center', backgroundColor: 'transparent' }]}
                      onPress={() => setActiveTrendTab(tab as any)}
                    >
                      <Text style={[styles.chartTabText, activeTrendTab === tab ? styles.chartTabTextActive : { color: theme.textMuted }]}>
                        {t[tab as keyof typeof t] || tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.chartBody}>
                <View style={styles.yAxis}>
                  {[trendMax, Math.round(trendMax * 0.8), Math.round(trendMax * 0.6), Math.round(trendMax * 0.4), Math.round(trendMax * 0.2), 0].map((v) => (
                    <Text key={v} style={[styles.yAxisText, { color: theme.textMuted }]}>{v}</Text>
                  ))}
                </View>

                <View style={styles.barsContainer}>
                  {trendChartData.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: theme.textMuted, fontSize: 12 }}>No data yet</Text>
                    </View>
                  ) : trendChartData.map((item) => (
                    <View key={item.label} style={styles.barCol}>
                      <View style={styles.barWrapper}>
                        <View style={[styles.barTrack, { backgroundColor: theme.pillBackground }]} />
                        <AnimatedBarFill
                          percentage={trendMax > 0 ? (item.value / trendMax) * 100 : 0}
                          style={styles.barFill}
                        />
                      </View>
                      <Text style={[styles.xAxisText, { color: theme.textMuted }]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Meal Sections */}
            {localizedMeals.map((meal, index) => (
              <Animated.View
                key={meal.id}
                entering={FadeInDown.duration(500).delay(150 + index * 80)}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.mealCard, { backgroundColor: theme.cardBackground, borderColor: theme.mealBorder }]}
                  onPress={() => router.push('/history')}
                >
                  {/* Left color stripe */}
                  <View style={[styles.mealStripe, { backgroundColor: meal.color }]} />

                  <View style={styles.mealContent}>
                    <View style={styles.mealHeader}>
                      <Text style={[styles.mealLabel, { color: theme.textPrimary }]}>{meal.label}</Text>
                      {meal.calories > 0 && (
                        <View style={[styles.mealCalBadge, { backgroundColor: meal.color + '22' }]}>
                          <Text style={[styles.mealCalBadgeText, { color: meal.color }]}>
                            {meal.calories} kcal
                          </Text>
                        </View>
                      )}
                    </View>

                    {meal.empty ? (
                      <Text style={[styles.mealEmptyText, { color: theme.mealEmptyText }]}>{t.noProducts}</Text>
                    ) : (
                      meal.items.map((item: any, i: number) => {
                        const title = typeof item === 'object' && item !== null ? item.title : item;
                        return (
                          <Text key={i} style={[styles.mealItemText, { color: theme.textSecondary }]} numberOfLines={1}>• {title}</Text>
                        );
                      })
                    )}
                  </View>

                  <View style={{ paddingRight: 16 }}>
                    <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </>
        )}

      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setCalendarVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1.5, padding: 0, overflow: 'hidden' }]}>
                <Calendar
                  current={selectedDate}
                  onDayPress={(day: any) => {
                    setSelectedDate(day.dateString);
                    setCalendarVisible(false);
                  }}
                  theme={{
                    backgroundColor: theme.cardBackground,
                    calendarBackground: theme.cardBackground,
                    textSectionTitleColor: theme.textSecondary,
                    selectedDayBackgroundColor: '#7EB93C',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#7EB93C',
                    dayTextColor: theme.textPrimary,
                    textDisabledColor: theme.textMuted,
                    dotColor: '#7EB93C',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#7EB93C',
                    monthTextColor: theme.textPrimary,
                    indicatorColor: '#7EB93C',
                  }}
                  markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true }
                  }}
                />
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: theme.pillBackground, margin: 16 }]}
                  onPress={() => setCalendarVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>{t.cancel}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1.5, width: '85%' }]}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary, marginBottom: 8 }]}>{t.updateDailyGoal}</Text>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20, textAlign: 'center' }}>
                  Edit total calories or specific macros. Calories will recalculate automatically.
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                  <Text style={{ width: 90, color: theme.textSecondary, fontWeight: '600' }}>Calories</Text>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0, backgroundColor: theme.pillBackground, color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={tempGoal}
                    onChangeText={(val) => {
                      setTempGoal(val);
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        setTempCarbs(Math.round((parsed * 0.50) / 4).toString());
                        setTempProtein(Math.round((parsed * 0.30) / 4).toString());
                        setTempFat(Math.round((parsed * 0.20) / 9).toString());
                      }
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                  <Text style={{ width: 90, color: theme.textSecondary, fontWeight: '600' }}>Carbs (g)</Text>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0, backgroundColor: theme.pillBackground, color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={tempCarbs}
                    onChangeText={(val) => {
                      setTempCarbs(val);
                      const c = parseInt(val, 10) || 0;
                      const p = parseInt(tempProtein, 10) || 0;
                      const f = parseInt(tempFat, 10) || 0;
                      setTempGoal(((c * 4) + (p * 4) + (f * 9)).toString());
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                  <Text style={{ width: 90, color: theme.textSecondary, fontWeight: '600' }}>Protein (g)</Text>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0, backgroundColor: theme.pillBackground, color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={tempProtein}
                    onChangeText={(val) => {
                      setTempProtein(val);
                      const c = parseInt(tempCarbs, 10) || 0;
                      const p = parseInt(val, 10) || 0;
                      const f = parseInt(tempFat, 10) || 0;
                      setTempGoal(((c * 4) + (p * 4) + (f * 9)).toString());
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 }}>
                  <Text style={{ width: 90, color: theme.textSecondary, fontWeight: '600' }}>Fat (g)</Text>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0, backgroundColor: theme.pillBackground, color: theme.textPrimary }]}
                    keyboardType="numeric"
                    value={tempFat}
                    onChangeText={(val) => {
                      setTempFat(val);
                      const c = parseInt(tempCarbs, 10) || 0;
                      const p = parseInt(tempProtein, 10) || 0;
                      const f = parseInt(val, 10) || 0;
                      setTempGoal(((c * 4) + (p * 4) + (f * 9)).toString());
                    }}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: theme.pillBackground }]} onPress={() => setEditModalVisible(false)}>
                    <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveBtn} onPress={async () => {
                    const newGoal = parseInt(tempGoal, 10);
                    const newCarbs = parseInt(tempCarbs, 10);
                    const newProtein = parseInt(tempProtein, 10);
                    const newFat = parseInt(tempFat, 10);

                    if (!isNaN(newGoal) && newGoal > 0) {
                      MockStore.update({ dailyCalorieGoal: newGoal });
                      setCarbsGoal(newCarbs || 0);
                      setProteinGoal(newProtein || 0);
                      setFatGoal(newFat || 0);

                      if (userId) {
                        const { error } = await supabase
                          .from('profiles')
                          .update({
                            daily_calorie_goal: newGoal
                          })
                          .eq('id', userId);
                        if (error) {
                          console.error("Error updating goal:", error);
                        }
                      }
                    }
                    setEditModalVisible(false);
                  }}>
                    <Text style={styles.modalSaveText}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Removed Meal Type Selector Modal */}

      {/* Custom Camera Scanner Modal */}
      <Modal visible={isScanning} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          {scannerStep === 'camera' && (
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                  <Animated.View style={[styles.scanLine, scanLineStyle]} />
                </View>
                <Text style={styles.scanText}>Align food in frame</Text>

                <View style={styles.cameraActions}>
                  <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setIsScanning(false)}>
                    <Ionicons name="close" size={30} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.captureBtn} onPress={async () => {
                    if (cameraRef.current) {
                      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5, exif: true });
                      if (photo?.uri && photo.base64) {
                        const placeholderResult = {
                          ...MOCK_SCANNED_RESULT,
                          image: photo.uri
                        };
                        setScannedResult(placeholderResult);
                        setScannerStep('processing');
                        resultTransition.value = 0;

                        try {
                          const aiResult = await analyzeFoodWithAI(photo.base64);
                          if (aiResult.error === 'not_food') {
                            setScannerStep('error');
                          } else {
                            const dynamicResult = {
                              ...aiResult,
                              image: photo.uri
                            };
                            setScannedResult(dynamicResult);
                            resultTransition.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
                          }
                        } catch (e) {
                          console.log("Error analyzing food:", e);
                          Alert.alert("Error", "Could not analyze the image. Please try again.");
                          setIsScanning(false);
                          setScannerStep('camera');
                        }
                      }
                    }
                  }}>
                    <View style={styles.captureBtnInner} />
                  </TouchableOpacity>
                  <View style={{ width: 44 }} />
                </View>
              </View>
            </CameraView>
          )}

          {scannerStep === 'processing' && scannedResult && (
            <View style={styles.resultContainer}>
              <Animated.View style={[styles.resultImageWrapper, animatedImageWrapperStyle]}>
                <Image source={{ uri: scannedResult.image }} style={styles.resultImage} />

                {/* Result header buttons fade in */}
                <Animated.View style={[styles.resultTopBar, animatedDetailsOpacityStyle]}>
                  <TouchableOpacity style={styles.iconBtnBack} onPress={() => { setScannerStep('camera'); setScannedResult(null); }}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnEdit}>
                    <Ionicons name="pencil" size={20} color="#FFF" />
                  </TouchableOpacity>
                </Animated.View>

                {/* Meal type overlay fades in */}
                <Animated.View style={[styles.mealTypeOverlay, animatedDetailsOpacityStyle]}>
                  <Text style={styles.mealTypeLabel}>Meal Type</Text>
                  <Text style={styles.mealTypeValue}>{selectedMealType ? selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1) : 'Select below'}</Text>
                </Animated.View>

                {/* Scanning overlay fades out */}
                <Animated.View style={[StyleSheet.absoluteFillObject, styles.cameraOverlay, animatedScanningOverlayStyle]}>
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <Animated.View style={[styles.scanLine, scanLineStyle]} />
                  </View>
                  <Text style={styles.scanText}>Analyzing image...</Text>
                </Animated.View>
              </Animated.View>

              {/* Bottom Sheet sliding up */}
              <Animated.View style={[styles.resultBottomSheetAbsolute, animatedBottomSheetStyle]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultScrollContent}>
                  <Text style={styles.resultTitle}>{scannedResult.title}</Text>
                  <Text style={styles.resultSubtitle}>{scannedResult.subtitle}</Text>

                  <View style={styles.servingRow}>
                    <Text style={styles.servingText}><Text style={{ fontWeight: '800' }}>{scannedResult.serving}</Text> Serving</Text>
                    <Text style={styles.caloriesText}><Text style={{ color: '#C93A3E' }}>{scannedResult.calories}</Text> Kcal</Text>
                  </View>

                  <View style={styles.resultMacrosRow}>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{ fontSize: 20 }}>🍚</Text></View>
                      <Text style={styles.resultMacroVal}>{scannedResult.macros.carbs}<Text style={styles.resultMacroUnit}>gr</Text></Text>
                      <View style={styles.resultMacroPill}><Text style={styles.resultMacroPillText}>Carbs</Text></View>
                    </View>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{ fontSize: 20 }}>🍗</Text></View>
                      <Text style={styles.resultMacroVal}>{scannedResult.macros.protein}<Text style={styles.resultMacroUnit}>gr</Text></Text>
                      <View style={styles.resultMacroPill}><Text style={styles.resultMacroPillText}>Protein</Text></View>
                    </View>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{ fontSize: 20 }}>💧</Text></View>
                      <Text style={styles.resultMacroVal}>{scannedResult.macros.fat}<Text style={styles.resultMacroUnit}>gr</Text></Text>
                      <View style={styles.resultMacroPill}><Text style={styles.resultMacroPillText}>Fat</Text></View>
                    </View>
                  </View>

                  <Text style={styles.ingredientsTitle}>Ingredients</Text>
                  <View style={styles.ingredientsList}>
                    {scannedResult.ingredients.map((ing: any, idx: number) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <View style={styles.ingredientTop}>
                          <Text style={styles.ingredientName}>{ing.name}</Text>
                          <Text style={styles.ingredientWeight}>{ing.weight}</Text>
                        </View>
                        <View style={styles.ingredientBottom}>
                          <Text style={styles.ingredientCals}>{ing.calories} <Text style={{ color: '#888' }}>Kcal</Text></Text>
                          <View style={styles.ingredientMacros}>
                            <View style={styles.ingMacroBadge}><Text style={styles.ingMacroText}>🍚 {ing.carbs}gr</Text></View>
                            <View style={styles.ingMacroBadge}><Text style={styles.ingMacroText}>🍗 {ing.protein}gr</Text></View>
                            <View style={styles.ingMacroBadge}><Text style={styles.ingMacroText}>💧 {ing.fat}gr</Text></View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.resultAddBtnContainer}>
                  <View style={styles.mealTypeChips}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.mealTypeChip,
                          selectedMealType === type && styles.mealTypeChipSelected
                        ]}
                        onPress={() => setSelectedMealType(type)}
                      >
                        <Text style={[
                          styles.mealTypeChipText,
                          selectedMealType === type && styles.mealTypeChipTextSelected
                        ]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.resultAddBtn, !selectedMealType && { opacity: 0.5 }]}
                    disabled={!selectedMealType}
                    onPress={async () => {
                      if (selectedMealType && userId) {
                        const targetMeal = meals.find(m => m.id === selectedMealType);
                        const currentItems = targetMeal ? targetMeal.items : [];
                        const currentCalories = targetMeal ? targetMeal.calories : 0;
                        const currentCarbs = targetMeal ? (targetMeal.carbs || 0) : 0;
                        const currentProtein = targetMeal ? (targetMeal.protein || 0) : 0;
                        const currentFat = targetMeal ? (targetMeal.fat || 0) : 0;
                        const newItemObj = {
                          title: scannedResult.title,
                          calories: scannedResult.calories,
                          carbs: scannedResult.macros?.carbs || 0,
                          protein: scannedResult.macros?.protein || 0,
                          fat: scannedResult.macros?.fat || 0,
                        };
                        const newItems = [...currentItems, newItemObj];
                        const newCalories = currentCalories + scannedResult.calories;
                        const newCarbs = currentCarbs + (scannedResult.macros?.carbs || 0);
                        const newProtein = currentProtein + (scannedResult.macros?.protein || 0);
                        const newFat = currentFat + (scannedResult.macros?.fat || 0);

                        const updatedMeals = meals.map(m => {
                          if (m.id === selectedMealType) {
                            return { ...m, calories: newCalories, carbs: newCarbs, protein: newProtein, fat: newFat, items: newItems, empty: false };
                          }
                          return m;
                        });
                        setMeals(updatedMeals);
                        setTotalCarbs(updatedMeals.reduce((s: number, m: any) => s + (m.carbs || 0), 0));
                        setTotalProtein(updatedMeals.reduce((s: number, m: any) => s + (m.protein || 0), 0));
                        setTotalFat(updatedMeals.reduce((s: number, m: any) => s + (m.fat || 0), 0));

                        setIsScanning(false);
                        setTimeout(() => {
                          setScannedResult(null);
                          setSelectedMealType(null);
                          setScannerStep('camera');
                        }, 300);

                        const { error } = await supabase
                          .from('diary_entries')
                          .upsert({
                            user_id: userId,
                            date: selectedDate,
                            meal_type: selectedMealType,
                            calories: newCalories,
                            carbs: newCarbs,
                            protein: newProtein,
                            fat: newFat,
                            items: JSON.stringify(newItems)
                          }, { onConflict: 'user_id, date, meal_type' });

                        if (error) {
                          console.error("Error saving to diary_entries:", error);
                        }
                      } else if (selectedMealType) {
                        // Fallback for non-authenticated local usage just in case
                        setMeals(current => current.map(m => {
                          if (m.id === selectedMealType) {
                            return {
                              ...m,
                              calories: m.calories + scannedResult.calories,
                              items: [...m.items, {
                                title: scannedResult.title,
                                calories: scannedResult.calories,
                                carbs: scannedResult.macros?.carbs || 0,
                                protein: scannedResult.macros?.protein || 0,
                                fat: scannedResult.macros?.fat || 0,
                              }],
                              empty: false
                            };
                          }
                          return m;
                        }));
                        setIsScanning(false);
                        setTimeout(() => {
                          setScannedResult(null);
                          setSelectedMealType(null);
                          setScannerStep('camera');
                        }, 300);
                      }
                    }}
                  >
                    <Text style={styles.resultAddBtnText}>Add to Diary</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          )}

          {scannerStep === 'error' && (
            <View style={[styles.resultContainer, { justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#111' }]}>
              <Ionicons name="warning-outline" size={80} color="#FFD700" style={{ marginBottom: 24 }} />
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 12 }}>We couldn't identify any food.</Text>
              <Text style={{ fontSize: 16, color: '#AAA', textAlign: 'center', marginBottom: 40 }}>Please make sure the dish is clearly visible and the photo is of good quality.</Text>
              <View style={{ width: '100%', gap: 16, paddingHorizontal: 20 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#7EB93C', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                  onPress={() => {
                    setScannedResult(null);
                    setScannerStep('camera');
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#333', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                  onPress={() => {
                    setIsScanning(false);
                    setScannerStep('camera');
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF3',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    paddingRight: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateFull: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  editTargetBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetPill: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  targetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  gaugeWrapper: {
    width: 240,
    height: 120,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeBackground: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 24,
    borderColor: '#EBF2E5',
    position: 'absolute',
  },
  gaugeFillContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 120,
    overflow: 'hidden',
  },
  gaugeFill: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 24,
    borderColor: '#7EB93C',
  },
  gaugeCenter: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  flameIcon: {
    backgroundColor: '#F5FAF0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 52,
  },
  gaugeTotal: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  macroRingWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroRingBg: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#F0F0F0',
  },
  macroRingFill: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  macroIcon: {
    fontSize: 24,
  },
  macroVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  macroTotal: {
    fontSize: 11,
    color: '#888',
    marginBottom: 12,
    marginTop: 2,
  },
  macroNamePill: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  macroNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
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

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  chartTab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  chartTabActive: {
    backgroundColor: '#7EB93C',
  },
  chartTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  chartTabTextActive: {
    color: '#FFFFFF',
  },
  chartBody: {
    flexDirection: 'row',
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingBottom: 24,
  },
  yAxisText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    height: 12,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barCol: {
    alignItems: 'center',
  },
  barWrapper: {
    height: 150,
    width: 14,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  barTrack: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#7EB93C',
    borderRadius: 7,
  },
  xAxisText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7EB93C',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addFoodBtn: {
    flexDirection: 'row',
    backgroundColor: '#7EB93C',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  addFoodBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mealSelectorBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  mealSelectorBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    top: 4,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#7EB93C',
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  scanText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 60,
  },
  cameraActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeCameraBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  resultImageWrapper: {
    width: '100%',
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultTopBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtnBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnEdit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  mealTypeLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  mealTypeValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  resultBottomSheetAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  resultScrollContent: {
    paddingBottom: 160,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  servingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  servingText: {
    fontSize: 14,
    color: '#555',
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  resultMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  resultMacroCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resultMacroIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultMacroVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  resultMacroUnit: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  resultMacroPill: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  resultMacroPillText: {
    fontSize: 10,
    color: '#555',
    fontWeight: '600',
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  ingredientsList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 20,
  },
  ingredientRow: {
    flexDirection: 'column',
  },
  ingredientTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  ingredientWeight: {
    fontSize: 13,
    color: '#999',
  },
  ingredientBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientCals: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C93A3E',
  },
  ingredientMacros: {
    flexDirection: 'row',
    gap: 6,
  },
  ingMacroBadge: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  ingMacroText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  resultAddBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  resultAddBtn: {
    backgroundColor: '#7EB93C',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultAddBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mealTypeChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealTypeChip: {
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  mealTypeChipSelected: {
    backgroundColor: '#7EB93C',
  },
  mealTypeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  mealTypeChipTextSelected: {
    color: '#FFF',
  },
});
