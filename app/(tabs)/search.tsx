import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { MockStore } from '@/constants/store';

const { width, height } = Dimensions.get('window');

const translations = {
  en: {
    searchFood: 'Search Food',
    searchDishes: 'Search dishes...',
    pasta: 'Pasta',
    chicken: 'Chicken',
    vegetables: 'Vegetables',
    seafood: 'Seafood',
    addedToDiary: 'Added to Diary',
    addedMsg: '{name} ({weight}g) has been added.',
    ok: 'OK',
    done: 'Done',
    portionWeightText: 'Your portion in grams',
    kcal: 'kcal',
    carbohydrates: 'Carbohydrates',
    proteins: 'Proteins',
    fats: 'Fats',
    fatsShort: 'Fats',
    carbsShort: 'Carbs',
    protShort: 'Prot',
    
    // Dish names
    carbonaraName: 'Carbonara',
    milanoName: 'Milano',
    pestoPastaName: 'Pesto Pasta',
    
    // Dish descriptions
    carbonaraDesc: 'This cheesy pasta dish',
    milanoDesc: 'Classic Milanese tomato pasta',
    pestoPastaDesc: 'Fresh basil pesto spaghetti',
  },
  ru: {
    searchFood: 'Поиск еды',
    searchDishes: 'Поиск блюд...',
    pasta: 'Паста',
    chicken: 'Курица',
    vegetables: 'Овощи',
    seafood: 'Морепродукты',
    addedToDiary: 'Добавлено в дневник',
    addedMsg: '{name} ({weight}г) было добавлено.',
    ok: 'OK',
    done: 'Готово',
    portionWeightText: 'Ваша порция в граммах',
    kcal: 'ктал',
    carbohydrates: 'Углеводы',
    proteins: 'Белки',
    fats: 'Жиры',
    fatsShort: 'Жиры',
    carbsShort: 'Угл',
    protShort: 'Бел',
    
    carbonaraName: 'Карбонара',
    milanoName: 'Милано',
    pestoPastaName: 'Паста с песто',
    
    carbonaraDesc: 'Это сырное блюдо из пасты',
    milanoDesc: 'Классическая миланская томатная паста',
    pestoPastaDesc: 'Спагетти со свежим базиликовым песто',
  },
  uz: {
    searchFood: 'Taom qidirish',
    searchDishes: 'Taomlarni qidirish...',
    pasta: 'Pasta',
    chicken: 'Tovuq',
    vegetables: 'Sabzavotlar',
    seafood: 'Dengiz mahsulotlari',
    addedToDiary: 'Kundalikka qo\'shildi',
    addedMsg: '{name} ({weight}g) qo\'shildi.',
    ok: 'OK',
    done: 'Tayyor',
    portionWeightText: 'Sizning porsiyangiz grammda',
    kcal: 'kkal',
    carbohydrates: 'Uglevodlar',
    proteins: 'Oqsillar',
    fats: 'Yog\'lar',
    fatsShort: 'Yog\'',
    carbsShort: 'Ugl',
    protShort: 'Oqsil',
    
    carbonaraName: 'Karbonara',
    milanoName: 'Milano',
    pestoPastaName: 'Pesto Pastasi',
    
    carbonaraDesc: 'Bu pishloqli pasta taomi',
    milanoDesc: 'Klassik Milan pomidorli pastasi',
    pestoPastaDesc: 'Yangi rayhon pestoli spagetti',
  }
};

const DISH_RESULTS = [
  {
    id: '1',
    name: 'Carbonara',
    description: 'This cheesy pasta dish',
    calories: 384,
    carbs: '51.7g',
    protein: '16.2g',
    fats: '10.8g',
    image: require('@/assets/images/pasta_carbonara.png'),
    category: 'pasta',
  },
  {
    id: '2',
    name: 'Milano',
    description: 'Classic Milanese tomato pasta',
    calories: 401,
    carbs: '54.0g',
    protein: '16.9g',
    fats: '11.2g',
    image: require('@/assets/images/pasta_carbonara.png'), // Reuse pasta image
    category: 'pasta',
  },
  {
    id: '3',
    name: 'Pesto Pasta',
    description: 'Fresh basil pesto spaghetti',
    calories: 342,
    carbs: '48.2g',
    protein: '12.4g',
    fats: '14.1g',
    image: require('@/assets/images/pasta_carbonara.png'),
    category: 'vegetables',
  }
];

export default function SearchScreen() {
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
    textSecondary: isDark ? '#9AA88E' : '#555555',
    textMuted: isDark ? '#6B785E' : '#888888',
    pillBackground: isDark ? '#23321A' : '#FFFFFF',
    inputText: isDark ? '#FAFCF8' : '#333333',
    dialBg: isDark ? '#23321A' : '#F5FAF0',
    dialTextActive: isDark ? '#FAFCF8' : '#1C2E0A',
    doneBtnBg: isDark ? '#7EB93C' : '#1C2E0A',
    doneBtnText: '#FFFFFF',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pasta');
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  
  // Detail slider state (portion weight in grams)
  const [portionWeight, setPortionWeight] = useState(214);
  const weights = Array.from({ length: 11 }, (_, i) => 210 + i);

  const localizedDishes = DISH_RESULTS.map(dish => {
    let name = dish.name;
    let description = dish.description;
    const categoryKey = dish.category as keyof typeof t;
    const category = t[categoryKey] || dish.category;
    
    if (dish.id === '1') {
      name = t.carbonaraName;
      description = t.carbonaraDesc;
    } else if (dish.id === '2') {
      name = t.milanoName;
      description = t.milanoDesc;
    } else if (dish.id === '3') {
      name = t.pestoPastaName;
      description = t.pestoPastaDesc;
    }
    
    return {
      ...dish,
      name,
      description,
      category,
    };
  });

  const filteredDishes = localizedDishes.filter(dish => {
    const matchesQuery = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? dish.category.toLowerCase() === (t[selectedCategory as keyof typeof t] || selectedCategory).toLowerCase() : true;
    return matchesQuery && matchesCategory;
  });

  const handleAddPortion = () => {
    if (selectedDish) {
      Alert.alert(
        t.addedToDiary,
        t.addedMsg.replace('{name}', selectedDish.name).replace('{weight}', portionWeight.toString()),
        [{ text: t.ok, onPress: () => setSelectedDish(null) }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {!selectedDish ? (
        // SEARCH LIST VIEW
        <View style={styles.mainView}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.searchFood}</Text>
          
          {/* Custom Search Box with voice mic */}
          <View style={[styles.searchBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Ionicons name="search" size={20} color="#7EB93C" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.inputText }]}
              placeholder={t.searchDishes}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Filter Tags */}
          <View style={styles.tagsContainer}>
            {['pasta', 'chicken', 'vegetables', 'seafood'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.tag,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                  selectedCategory === cat && styles.tagActive
                ]}
              >
                <Text style={[
                  styles.tagText,
                  { color: theme.textSecondary },
                  selectedCategory === cat && styles.tagTextActive
                ]}>
                  {t[cat as keyof typeof t] || cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dishes List */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filteredDishes.map((dish, index) => (
              <Animated.View
                key={dish.id}
                entering={FadeInDown.duration(500).delay(index * 100)}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedDish(dish)}
                  style={[styles.dishCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
                >
                  <Image source={dish.image} style={styles.dishCardImage} />
                  <View style={styles.dishCardInfo}>
                    <Text style={styles.dishCardCalories}>{dish.calories} {t.kcal}</Text>
                    <Text style={[styles.dishCardName, { color: theme.textPrimary }]}>{dish.name}</Text>
                    <Text style={[styles.dishCardMacros, { color: theme.textMuted }]}>
                      {t.fatsShort} {dish.fats} • {t.carbsShort} {dish.carbs} • {t.protShort} {dish.protein}
                    </Text>
                  </View>
                  <View style={[styles.arrowContainer, { backgroundColor: theme.pillBackground }]}>
                    <Ionicons name="chevron-forward" size={20} color="#7EB93C" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      ) : (
        // DISH DETAIL VIEW (CARBONARA SCREEN)
        <Animated.View entering={SlideInRight.duration(400)} style={[styles.detailView, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedDish(null)}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
            {/* Category / Name Header */}
            <Text style={styles.detailCategory}>{selectedDish.category.toUpperCase()}</Text>
            <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>{selectedDish.name}</Text>
            <Text style={[styles.detailDesc, { color: theme.textMuted }]}>{selectedDish.description}</Text>

            {/* Food Image and Macro Details Container */}
            <View style={styles.detailBody}>
              <View style={styles.detailImageContainer}>
                <Image source={selectedDish.image} style={styles.detailImage} resizeMode="contain" />
              </View>

              <View style={styles.detailMacros}>
                <View style={styles.detailCalContainer}>
                  <Text style={[styles.detailCalLabel, { color: theme.textMuted }]}>{t.kcal}</Text>
                  <Text style={[styles.detailCalValue, { color: theme.textPrimary }]}>{selectedDish.calories}</Text>
                </View>

                {/* Macro Items */}
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#7EB93C' }]} />
                  <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{t.carbohydrates}</Text>
                  <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{selectedDish.carbs}</Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FAD02C' }]} />
                  <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{t.proteins}</Text>
                  <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{selectedDish.protein}</Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF8C42' }]} />
                  <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{t.fats}</Text>
                  <Text style={[styles.macroVal, { color: theme.textPrimary }]}>{selectedDish.fats}</Text>
                </View>
              </View>
            </View>

            {/* Weight Dial Selector */}
            <View style={styles.weightSelectorContainer}>
              <Text style={[styles.weightLabel, { color: theme.textMuted }]}>{t.portionWeightText}</Text>
              <View style={[styles.dialWrapper, { backgroundColor: theme.dialBg, borderColor: theme.cardBorder }]}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dialScroll}
                >
                  {weights.map((w) => {
                    const isSelected = portionWeight === w;
                    return (
                      <TouchableOpacity 
                        key={w} 
                        onPress={() => setPortionWeight(w)}
                        style={styles.dialItem}
                      >
                        <Text style={[
                          styles.dialText,
                          { color: theme.textMuted },
                          isSelected && [styles.dialTextActive, { color: theme.dialTextActive }]
                        ]}>
                          {w}
                        </Text>
                        <View style={[
                          styles.dialTick,
                          isSelected && styles.dialTickActive
                        ]} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </ScrollView>

          {/* Action button */}
          <View style={[styles.bottomBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.cardBorder }]}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.doneButton, { backgroundColor: theme.doneBtnBg }]}
              onPress={handleAddPortion}
            >
              <Text style={[styles.doneButtonText, { color: theme.doneBtnText }]}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF3',
  },
  mainView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  micButton: {
    padding: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 8,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  tagActive: {
    backgroundColor: '#7EB93C',
    borderColor: '#7EB93C',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 80,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  dishCardImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  dishCardInfo: {
    flex: 1,
  },
  dishCardCalories: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7EB93C',
    marginBottom: 2,
  },
  dishCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  dishCardMacros: {
    fontSize: 12,
    color: '#888',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5FAF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // DETAIL VIEW STYLES
  detailView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  detailScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  detailCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7EB93C',
    letterSpacing: 1,
  },
  detailTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  detailDesc: {
    fontSize: 16,
    color: '#777777',
    marginTop: 4,
    marginBottom: 20,
  },
  detailBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailImageContainer: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailMacros: {
    flex: 1,
    marginLeft: 20,
  },
  detailCalContainer: {
    marginBottom: 15,
  },
  detailCalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  detailCalValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 42,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  macroVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  weightSelectorContainer: {
    marginTop: 10,
  },
  weightLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  dialWrapper: {
    backgroundColor: '#F5FAF0',
    borderRadius: 24,
    height: 90,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  dialScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dialItem: {
    alignItems: 'center',
    width: 60,
  },
  dialText: {
    fontSize: 16,
    color: '#A9A9A9',
    fontWeight: '500',
  },
  dialTextActive: {
    fontSize: 22,
    color: '#1C2E0A',
    fontWeight: '700',
  },
  dialTick: {
    width: 2,
    height: 10,
    backgroundColor: '#CCD8C0',
    marginTop: 8,
  },
  dialTickActive: {
    backgroundColor: '#7EB93C',
    height: 18,
    width: 3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 25,
    paddingTop: 15,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#EBF2E5',
  },
  doneButton: {
    backgroundColor: '#1C2E0A',
    borderRadius: 30,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
