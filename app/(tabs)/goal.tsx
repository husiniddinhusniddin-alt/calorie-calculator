import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CURRENT_WEIGHT = 85;
const STARTING_WEIGHT = 87;
const DESIRED_WEIGHT = 82;
const PROGRESS_PCT = ((STARTING_WEIGHT - CURRENT_WEIGHT) / (STARTING_WEIGHT - DESIRED_WEIGHT)) * 100;

// Generate body silhouette points (simplified sparkle-like weight chart)
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DATA = [87, 86.5, 86.2, 86, 85.7, 85.3, 85];

export default function GoalScreen() {
  const [view, setView] = useState<'week' | 'month'>('week');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.pageTitle}>Weight Goal</Text>
        </Animated.View>

        {/* Current Weight Hero Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)} style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroMetaLabel}>CURRENT WEIGHT</Text>
            <View style={styles.heroWeightRow}>
              <Text style={styles.heroWeight}>{CURRENT_WEIGHT}</Text>
              <Text style={styles.heroUnit}> kg</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="trending-down" size={14} color="#7EB93C" />
              <Text style={styles.heroBadgeText}>dropped 2 kg</Text>
            </View>
            <Text style={styles.heroSubLabel}>last weigh 5 days ago</Text>
          </View>

          <View style={styles.heroRight}>
            {/* Simplified Human silhouette chart area */}
            <View style={styles.silhouetteContainer}>
              {/* Decorative particle dots representing body silhouette */}
              {Array.from({ length: 30 }).map((_, i) => {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const isCore = col >= 1 && col <= 3 && row >= 2 && row <= 5;
                const opacity = isCore ? 0.8 : 0.25 + Math.random() * 0.3;
                return (
                  <View
                    key={i}
                    style={[
                      styles.silhouetteDot,
                      {
                        opacity,
                        backgroundColor: row < 3 ? '#C8E8A0' : '#7EB93C',
                        left: col * 18 + (row % 2 === 0 ? 6 : 0),
                        top: row * 20,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Week / Month Toggle */}
        <Animated.View entering={FadeInDown.duration(500).delay(160)} style={styles.toggleContainer}>
          {(['week', 'month'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setView(t)}
              style={[styles.toggleBtn, view === t && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, view === t && styles.toggleTextActive]}>
                this {t}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Weight Chart */}
        <Animated.View entering={FadeInDown.duration(500).delay(220)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight progress (kg)</Text>
          {/* Bar Chart */}
          <View style={styles.barsContainer}>
            {WEEK_DATA.map((val, i) => {
              const maxVal = Math.max(...WEEK_DATA);
              const minVal = Math.min(...WEEK_DATA);
              const heightPct = ((val - minVal) / ((maxVal - minVal) || 1)) * 0.6 + 0.3;
              const isLast = i === WEEK_DATA.length - 1;
              return (
                <View key={i} style={styles.barItem}>
                  <Text style={styles.barValue}>{val}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct * 100}%`,
                          backgroundColor: isLast ? '#7EB93C' : '#C8E8A0',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isLast && { color: '#7EB93C', fontWeight: '700' }]}>
                    {WEEK_LABELS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Goal Progress Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressMetaLabel}>STARTING</Text>
              <Text style={styles.progressWeight}>{STARTING_WEIGHT} kg</Text>
            </View>
            <View style={styles.progressBadge}>
              <Ionicons name="flag" size={14} color="#FFFFFF" />
              <Text style={styles.progressBadgeText}>Goal</Text>
            </View>
            <View>
              <Text style={styles.progressMetaLabel}>DESIRED</Text>
              <Text style={[styles.progressWeight, { color: '#7EB93C' }]}>{DESIRED_WEIGHT} kg</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.goalBarBg}>
            <View style={[styles.goalBarFill, { width: `${PROGRESS_PCT}%` }]}>
              <View style={styles.goalBarDot} />
            </View>
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {CURRENT_WEIGHT - DESIRED_WEIGHT} kg remaining to reach your goal!
            </Text>
          </View>
        </Animated.View>

        {/* Update Weight Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(380)}>
          <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.updateBtnText}>Log Today's Weight</Text>
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
    paddingBottom: 80,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A5C18',
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
  },
  heroMetaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroWeightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  heroWeight: {
    fontSize: 52,
    fontWeight: '800',
    color: '#7EB93C',
    lineHeight: 56,
  },
  heroUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AAA',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FAE4',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7EB93C',
  },
  heroSubLabel: {
    fontSize: 12,
    color: '#999',
  },
  heroRight: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteContainer: {
    width: 90,
    height: 130,
    position: 'relative',
  },
  silhouetteDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
    marginBottom: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: '#7EB93C',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'capitalize',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    color: '#AAA',
    marginBottom: 4,
  },
  barBg: {
    width: 20,
    height: 80,
    backgroundColor: '#F0F4EC',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 6,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EBF2E5',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressMetaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAA',
    letterSpacing: 1,
    marginBottom: 4,
  },
  progressWeight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A2A2A',
  },
  progressBadge: {
    backgroundColor: '#7EB93C',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  goalBarBg: {
    width: '100%',
    height: 14,
    backgroundColor: '#EBF2E5',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: '#7EB93C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  goalBarDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#7EB93C',
    position: 'absolute',
    right: -10,
  },
  progressFooter: {
    marginTop: 18,
    alignItems: 'center',
  },
  progressFooterText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  updateBtn: {
    backgroundColor: '#7EB93C',
    borderRadius: 30,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
