import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pasta');
  const [selectedDish, setSelectedDish] = useState<typeof DISH_RESULTS[0] | null>(null);
  
  // Detail slider state (portion weight in grams)
  const [portionWeight, setPortionWeight] = useState(214);
  const weights = Array.from({ length: 11 }, (_, i) => 210 + i);

  const filteredDishes = DISH_RESULTS.filter(dish => {
    const matchesQuery = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? dish.category === selectedCategory : true;
    return matchesQuery && matchesCategory;
  });

  const handleAddPortion = () => {
    if (selectedDish) {
      Alert.alert(
        'Added to Diary',
        `${selectedDish.name} (${portionWeight}g) has been added.`,
        [{ text: 'OK', onPress: () => setSelectedDish(null) }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {!selectedDish ? (
        // SEARCH LIST VIEW
        <View style={styles.mainView}>
          <Text style={styles.headerTitle}>Search Food</Text>
          
          {/* Custom Search Box with voice mic */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#7EB93C" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={20} color="#666" />
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
                  selectedCategory === cat && styles.tagActive
                ]}
              >
                <Text style={[
                  styles.tagText,
                  selectedCategory === cat && styles.tagTextActive
                ]}>
                  {cat}
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
                  style={styles.dishCard}
                >
                  <Image source={dish.image} style={styles.dishCardImage} />
                  <View style={styles.dishCardInfo}>
                    <Text style={styles.dishCardCalories}>{dish.calories} kcal</Text>
                    <Text style={styles.dishCardName}>{dish.name}</Text>
                    <Text style={styles.dishCardMacros}>
                      Fats {dish.fats} • Carbs {dish.carbs} • Prot {dish.protein}
                    </Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color="#7EB93C" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      ) : (
        // DISH DETAIL VIEW (CARBONARA SCREEN)
        <Animated.View entering={SlideInRight.duration(400)} style={styles.detailView}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedDish(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
            {/* Category / Name Header */}
            <Text style={styles.detailCategory}>{selectedDish.category.toUpperCase()}</Text>
            <Text style={styles.detailTitle}>{selectedDish.name}</Text>
            <Text style={styles.detailDesc}>{selectedDish.description}</Text>

            {/* Food Image and Macro Details Container */}
            <View style={styles.detailBody}>
              <View style={styles.detailImageContainer}>
                <Image source={selectedDish.image} style={styles.detailImage} resizeMode="contain" />
              </View>

              <View style={styles.detailMacros}>
                <View style={styles.detailCalContainer}>
                  <Text style={styles.detailCalLabel}>kcal</Text>
                  <Text style={styles.detailCalValue}>{selectedDish.calories}</Text>
                </View>

                {/* Macro Items */}
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#7EB93C' }]} />
                  <Text style={styles.macroLabel}>Carbohydrates</Text>
                  <Text style={styles.macroVal}>{selectedDish.carbs}</Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FAD02C' }]} />
                  <Text style={styles.macroLabel}>Proteins</Text>
                  <Text style={styles.macroVal}>{selectedDish.protein}</Text>
                </View>
                <View style={styles.macroRow}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF8C42' }]} />
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroVal}>{selectedDish.fats}</Text>
                </View>
              </View>
            </View>

            {/* Weight Dial Selector */}
            <View style={styles.weightSelectorContainer}>
              <Text style={styles.weightLabel}>Your portion in grams</Text>
              <View style={styles.dialWrapper}>
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
                          isSelected && styles.dialTextActive
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
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.doneButton}
              onPress={handleAddPortion}
            >
              <Text style={styles.doneButtonText}>Done</Text>
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
