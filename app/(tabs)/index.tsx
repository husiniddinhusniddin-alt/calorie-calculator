import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';
import { MockStore } from '@/constants/store';

const getFormattedDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    dayName: days[date.getDay()],
    fullDate: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  };
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

const DEFAULT_DAILY_GOAL = 1550;
const DAILY_FATS = 43;
const DAILY_CARBS = 50;
const DAILY_PROTEINS = 103;

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

export default function DiaryScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(MockStore.profileImage);

  useEffect(() => {
    return MockStore.subscribe(() => {
      setProfileImage(MockStore.profileImage);
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  });
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [meals, setMeals] = useState(DIARY_MEALS);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [activeTrendTab, setActiveTrendTab] = useState<'day' | 'week' | 'month'>('week');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStep, setScannerStep] = useState<'camera' | 'processing'>('camera');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scannedResult, setScannedResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  const scanLinePosition = useSharedValue(0);
  const resultTransition = useSharedValue(0);

  useEffect(() => {
    if (scannerStep === 'processing' && resultTransition.value === 0) {
      scanLinePosition.value = withRepeat(
        withTiming(250, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scanLinePosition.value = 0;
    }
  }, [scannerStep]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePosition.value }],
  }));

  const animatedImageWrapperStyle = useAnimatedStyle(() => ({
    height: interpolate(resultTransition.value, [0, 1], [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.45]),
  }));

  const animatedScanningOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(resultTransition.value, [0, 1], [1, 0]),
  }));

  const animatedDetailsOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(resultTransition.value, [0, 0.8, 1], [0, 0, 1]),
  }));

  const animatedBottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(resultTransition.value, [0, 1], [SCREEN_HEIGHT * 0.6, 0])
    }],
  }));

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    setCalendarModalVisible(false);
    
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const todayStr = new Date(today.getTime() - offset).toISOString().split('T')[0];
    
    if (day.dateString === todayStr) {
      setMeals(DIARY_MEALS);
    } else {
      let hash = 0;
      for (let i = 0; i < day.dateString.length; i++) {
        hash = day.dateString.charCodeAt(i) + ((hash << 5) - hash);
      }
      const randomMultiplier = Math.abs(hash % 10) / 10 + 0.5;
      setMeals(DIARY_MEALS.map(m => ({
        ...m,
        calories: m.calories > 0 ? Math.floor(m.calories * randomMultiplier) : 0,
        items: m.calories > 0 ? [`Mock item for ${day.dateString}`] : [],
        empty: m.calories === 0,
      })));
    }
  };

  const handleAddFood = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera permission is required to scan food.");
        return;
      }
    }
    setScannerStep('camera');
    setScannedResult(null);
    setSelectedMealType(null);
    setIsScanning(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Top Row */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.datePill}
              onPress={() => setCalendarModalVisible(true)}
            >
              <View style={styles.dateIconContainer}>
                <Ionicons name="calendar-outline" size={18} color="#333" />
              </View>
              <View>
                <Text style={styles.dateDay}>{getFormattedDate(selectedDate).dayName}</Text>
                <Text style={styles.dateFull}>{getFormattedDate(selectedDate).fullDate}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              <View style={[styles.avatarContainer, !profileImage && { backgroundColor: '#F0FAE4' }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#7EB93C' }}>AG</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Daily Calorie Target Gauge */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.targetCard}>
          <TouchableOpacity 
            style={styles.editTargetBtn}
            onPress={() => {
              setTempGoal(dailyGoal.toString());
              setEditModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={16} color="#888" />
          </TouchableOpacity>

          <View style={styles.targetPill}>
            <Text style={styles.targetPillText}>Daily-Calorie Target</Text>
          </View>
          
          <View style={styles.gaugeWrapper}>
            <DashedGauge
              percentage={Math.min(totalCalories / dailyGoal, 1)}
              radius={120}
              strokeWidth={24}
              filledColor="#7EB93C"
              unfilledColor="#EAEAEA"
            />
            <View style={styles.gaugeCenter}>
              <Text style={styles.gaugeValue}>{totalCalories}</Text>
              <Text style={styles.gaugeTotal}>of {dailyGoal} Kcal</Text>
            </View>
          </View>
        </Animated.View>

        {/* Add Food Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(125)}>
          <TouchableOpacity style={styles.addFoodBtn} activeOpacity={0.8} onPress={handleAddFood}>
            <Ionicons name="camera" size={22} color="#FFFFFF" />
            <Text style={styles.addFoodBtnText}>Add food</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Macros Row */}
        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.macrosRow}>
          <View style={styles.macroCard}>
            <View style={styles.macroRingWrapper}>
              <View style={[styles.macroRingBg, { borderColor: '#EAEAEA' }]} />
              <View style={[styles.macroRingFill, { borderTopColor: '#F4C344', borderRightColor: 'transparent', transform: [{ rotate: '45deg' }] }]} />
              <MaterialCommunityIcons name="corn" size={24} color="#F4C344" />
            </View>
            <Text style={styles.macroVal}>25</Text>
            <Text style={styles.macroTotal}>of 50 gr</Text>
            <View style={styles.macroNamePill}>
              <Text style={styles.macroNameText}>Carbs</Text>
            </View>
          </View>
          <View style={styles.macroCard}>
            <View style={styles.macroRingWrapper}>
              <View style={[styles.macroRingBg, { borderColor: '#EAEAEA' }]} />
              <View style={[styles.macroRingFill, { borderTopColor: '#C93A3E', borderRightColor: '#C93A3E', transform: [{ rotate: '45deg' }] }]} />
              <MaterialCommunityIcons name="food-steak" size={24} color="#C93A3E" />
            </View>
            <Text style={styles.macroVal}>63</Text>
            <Text style={styles.macroTotal}>of 103 gr</Text>
            <View style={styles.macroNamePill}>
              <Text style={styles.macroNameText}>Protein</Text>
            </View>
          </View>
          <View style={styles.macroCard}>
            <View style={styles.macroRingWrapper}>
              <View style={[styles.macroRingBg, { borderColor: '#EAEAEA' }]} />
              <View style={[styles.macroRingFill, { borderTopColor: '#E8A86F', borderRightColor: 'transparent', transform: [{ rotate: '0deg' }] }]} />
              <Ionicons name="water" size={24} color="#E8A86F" />
            </View>
            <Text style={styles.macroVal}>12</Text>
            <Text style={styles.macroTotal}>of 43 gr</Text>
            <View style={styles.macroNamePill}>
              <Text style={styles.macroNameText}>Fat</Text>
            </View>
          </View>
        </Animated.View>

        {/* Calorie Trends Chart */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Calorie Trends</Text>
            <View style={styles.chartTabs}>
              <TouchableOpacity 
                style={[styles.chartTab, activeTrendTab === 'day' && styles.chartTabActive]}
                onPress={() => setActiveTrendTab('day')}
              >
                <Text style={[styles.chartTabText, activeTrendTab === 'day' && styles.chartTabTextActive]}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chartTab, activeTrendTab === 'week' && styles.chartTabActive]}
                onPress={() => setActiveTrendTab('week')}
              >
                <Text style={[styles.chartTabText, activeTrendTab === 'week' && styles.chartTabTextActive]}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chartTab, activeTrendTab === 'month' && styles.chartTabActive]}
                onPress={() => setActiveTrendTab('month')}
              >
                <Text style={[styles.chartTabText, activeTrendTab === 'month' && styles.chartTabTextActive]}>Month</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              {Array.from({ length: 7 }, (_, i) => Math.round(TRENDS_DATA[activeTrendTab].max - (TRENDS_DATA[activeTrendTab].max / 6) * i)).map((val, idx) => (
                <Text key={idx} style={styles.yAxisText}>{val}</Text>
              ))}
            </View>
            
            <View style={styles.barsContainer}>
              {TRENDS_DATA[activeTrendTab].data.map((item) => (
                <View key={item.label} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View style={styles.barTrack} />
                    <View style={[styles.barFill, { height: `${(item.value / TRENDS_DATA[activeTrendTab].max) * 100}%` }]} />
                  </View>
                  <Text style={styles.xAxisText}>{item.label}</Text>
                </View>
              ))}
            </View>
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

      </ScrollView>

      {/* Edit Goal Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Daily Goal</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempGoal}
              onChangeText={setTempGoal}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={() => {
                const newGoal = parseInt(tempGoal, 10);
                if (!isNaN(newGoal) && newGoal > 0) {
                  setDailyGoal(newGoal);
                }
                setEditModalVisible(false);
              }}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Removed Meal Type Selector Modal */}

      {/* Calendar Modal */}
      <Modal visible={isCalendarModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { padding: 0, overflow: 'hidden' }]}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#7EB93C' }
              }}
              theme={{
                todayTextColor: '#7EB93C',
                arrowColor: '#7EB93C',
              }}
            />
            <TouchableOpacity style={[styles.modalCancelBtn, { margin: 16 }]} onPress={() => setCalendarModalVisible(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                </View>
                <Text style={styles.scanText}>Align food in frame</Text>
                
                <View style={styles.cameraActions}>
                  <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setIsScanning(false)}>
                    <Ionicons name="close" size={30} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.captureBtn} onPress={async () => {
                    if (cameraRef.current) {
                      const photo = await cameraRef.current.takePictureAsync();
                      if (photo?.uri) {
                        const dynamicResult = {
                          ...MOCK_SCANNED_RESULT,
                          image: photo.uri
                        };
                        setScannedResult(dynamicResult);
                        setScannerStep('processing');
                        resultTransition.value = 0;
                        
                        setTimeout(() => {
                          resultTransition.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
                        }, 2500);
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
                    <Text style={styles.servingText}><Text style={{fontWeight:'800'}}>{scannedResult.serving}</Text> Serving</Text>
                    <Text style={styles.caloriesText}><Text style={{color:'#C93A3E'}}>{scannedResult.calories}</Text> Kcal</Text>
                  </View>

                  <View style={styles.resultMacrosRow}>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{fontSize: 20}}>🍚</Text></View>
                      <Text style={styles.resultMacroVal}>{scannedResult.macros.carbs}<Text style={styles.resultMacroUnit}>gr</Text></Text>
                      <View style={styles.resultMacroPill}><Text style={styles.resultMacroPillText}>Carbs</Text></View>
                    </View>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{fontSize: 20}}>🍗</Text></View>
                      <Text style={styles.resultMacroVal}>{scannedResult.macros.protein}<Text style={styles.resultMacroUnit}>gr</Text></Text>
                      <View style={styles.resultMacroPill}><Text style={styles.resultMacroPillText}>Protein</Text></View>
                    </View>
                    <View style={styles.resultMacroCard}>
                      <View style={styles.resultMacroIconBg}><Text style={{fontSize: 20}}>💧</Text></View>
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
                          <Text style={styles.ingredientCals}>{ing.calories} <Text style={{color: '#888'}}>Kcal</Text></Text>
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
                    onPress={() => {
                      if (selectedMealType) {
                        setMeals(current => current.map(m => {
                          if (m.id === selectedMealType) {
                            return {
                              ...m,
                              calories: m.calories + scannedResult.calories,
                              items: [...m.items, scannedResult.title],
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
        </View>
      </Modal>

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
  header: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    top: 0,
    left: 10,
    right: 10,
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
