import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

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

const TRENDS_DATA = [
  { day: 'MON', value: 1200 },
  { day: 'TUE', value: 1400 },
  { day: 'WED', value: 1250 },
  { day: 'THU', value: 1700 },
  { day: 'FRI', value: 1500 },
  { day: 'SAT', value: 2000 },
  { day: 'SUN', value: 1750 },
];
const MAX_TREND = 3000;

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
  const [meals, setMeals] = useState(DIARY_MEALS);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  const [isMealSelectorVisible, setMealSelectorVisible] = useState(false);
  const [pendingFood, setPendingFood] = useState<any>(null);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  const handleAddFood = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission required", "Camera permission is required to add food via photos!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert("Success", "Photo captured successfully! AI is analyzing your food...");
        setTimeout(() => {
          setPendingFood({
            name: 'AI Identified Food',
            calories: Math.floor(Math.random() * 300) + 100
          });
          setMealSelectorVisible(true);
        }, 1500);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open camera. Ensure you are on a physical device and the app was restarted after installing the camera module.");
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Top Row */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.datePill}>
              <View style={styles.dateIconContainer}>
                <Ionicons name="calendar-outline" size={18} color="#333" />
              </View>
              <View>
                <Text style={styles.dateDay}>Monday</Text>
                <Text style={styles.dateFull}>Nov 24, 2025</Text>
              </View>
            </View>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.replace('/(auth)/login')}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: 'https://cdn3d.iconscout.com/3d/premium/thumb/woman-avatar-5822527-4898516.png' }} style={{ width: 44, height: 44, borderRadius: 22 }} />
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
              <TouchableOpacity style={[styles.chartTab, styles.chartTabActive]}>
                <Text style={[styles.chartTabText, styles.chartTabTextActive]}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartTab}>
                <Text style={styles.chartTabText}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartTab}>
                <Text style={styles.chartTabText}>Month</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              <Text style={styles.yAxisText}>3000</Text>
              <Text style={styles.yAxisText}>2500</Text>
              <Text style={styles.yAxisText}>2000</Text>
              <Text style={styles.yAxisText}>1500</Text>
              <Text style={styles.yAxisText}>1000</Text>
              <Text style={styles.yAxisText}>500</Text>
              <Text style={styles.yAxisText}>0</Text>
            </View>
            
            <View style={styles.barsContainer}>
              {TRENDS_DATA.map((item, index) => (
                <View key={item.day} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View style={styles.barTrack} />
                    <View style={[styles.barFill, { height: `${(item.value / MAX_TREND) * 100}%` }]} />
                  </View>
                  <Text style={styles.xAxisText}>{item.day}</Text>
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

      {/* Meal Type Selector Modal */}
      <Modal visible={isMealSelectorVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add to which meal?</Text>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealId) => {
              const mealConfig = meals.find(m => m.id === mealId);
              if (!mealConfig) return null;
              return (
                <TouchableOpacity 
                  key={mealId} 
                  style={[styles.mealSelectorBtn, { backgroundColor: mealConfig.color + '20' }]} 
                  onPress={() => {
                    setMeals(current => current.map(m => {
                      if (m.id === mealId) {
                        return {
                          ...m,
                          calories: m.calories + pendingFood.calories,
                          items: [...m.items, pendingFood.name],
                          empty: false
                        };
                      }
                      return m;
                    }));
                    setMealSelectorVisible(false);
                    setPendingFood(null);
                  }}
                >
                  <Text style={[styles.mealSelectorBtnText, { color: mealConfig.color }]}>{mealConfig.label}</Text>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity style={[styles.modalCancelBtn, { marginTop: 12, width: '100%' }]} onPress={() => setMealSelectorVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
});
