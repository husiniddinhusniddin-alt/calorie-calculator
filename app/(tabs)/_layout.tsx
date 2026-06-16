import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { MockStore } from '@/constants/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabTranslations = {
  en: { home: 'Home', calories: 'Calories', goal: 'Goal', history: 'History', profile: 'Profile' },
  ru: { home: 'Главная', calories: 'Калории', goal: 'Цель', history: 'История', profile: 'Профиль' },
  uz: { home: 'Bosh sahifa', calories: 'Kaloriyalar', goal: 'Maqsad', history: 'Tarix', profile: 'Profil' }
};

export default function TabLayout() {
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
  const t = tabTranslations[language] || tabTranslations.en;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7EB93C',
        tabBarInactiveTintColor: isDark ? '#9AA88E' : '#9BA1A6',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#171E10' : '#FFFFFF',
          borderTopWidth: 1.5,
          borderTopColor: isDark ? '#2A3A1E' : '#EBF2E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t.calories,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'flame' : 'flame-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goal"
        options={{
          title: t.goal,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'flag' : 'flag-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.history,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'time' : 'time-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      {/* Hidden legacy screen – not shown in tab bar */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
