import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';
import { OfflineModal } from '@/components/OfflineModal';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0F140A' : '#F7FAF3';
  const router = useRouter();
  const segments = useSegments();
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep a ref of the latest segments to avoid stale closures in listeners
  const segmentsRef = useRef(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    let mounted = true;

    // Check session on mount and listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('RootLayoutNav Auth Event:', event, session ? 'Session found' : 'No session');

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session && session.user) {
          try {
            // Fetch user profile from Supabase profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile && mounted) {
              MockStore.update({
                name: profile.name || session.user.email?.split('@')[0] || 'User',
                email: profile.email || session.user.email || '',
                profileImage: profile.profile_image || null,
                targetWeight: parseFloat(profile.target_weight) || 82,
                currentWeight: parseFloat(profile.current_weight) || 85,
                startingWeight: parseFloat(profile.starting_weight) || 88,
                dailyCalorieGoal: parseFloat(profile.daily_calorie_goal) || 1900,
                weeklyWeightGoal: parseFloat(profile.weekly_weight_goal) || 0.5,
                targetDate: profile.target_date ? new Date(profile.target_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                age: profile.age || null,
                height: profile.height || null,
                calorieStreak: profile.calorie_streak ?? 0,
                waterStreak: profile.water_streak ?? 0,
                appTheme: profile.app_theme ?? 'system',
                language: profile.language ?? 'en',
                notifications: profile.notifications ?? MockStore.notifications,
              });
            }
            
            if (mounted) {
              setIsInitialized(true);
              const inAuthGroup = segmentsRef.current[0] === '(auth)';
              if (inAuthGroup) {
                router.replace('/(tabs)');
              }
            }
          } catch (err) {
            console.warn('Profile fetch in layout error:', err);
            if (mounted) {
              setIsInitialized(true);
              const inAuthGroup = segmentsRef.current[0] === '(auth)';
              if (inAuthGroup) {
                router.replace('/(tabs)');
              }
            }
          }
        } else {
          if (mounted) {
            setIsInitialized(true);
            const inAuthGroup = segmentsRef.current[0] === '(auth)';
            if (!inAuthGroup) {
              router.replace('/(auth)/login');
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsInitialized(true);
          router.replace('/(auth)/login');
        }
      }
    });

    // Fallback safety timeout in case INITIAL_SESSION doesn't fire promptly
    const fallbackTimer = setTimeout(async () => {
      if (!mounted || isInitialized) return;
      console.warn('RootLayoutNav Auth initialization fallback triggered');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Quick fetch
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile && mounted) {
            MockStore.update({
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              profileImage: profile.profile_image || null,
              targetWeight: parseFloat(profile.target_weight) || 82,
              currentWeight: parseFloat(profile.current_weight) || 85,
              startingWeight: parseFloat(profile.starting_weight) || 88,
              dailyCalorieGoal: parseFloat(profile.daily_calorie_goal) || 1900,
              weeklyWeightGoal: parseFloat(profile.weekly_weight_goal) || 0.5,
              targetDate: profile.target_date ? new Date(profile.target_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              age: profile.age || null,
              height: profile.height || null,
              calorieStreak: profile.calorie_streak ?? 0,
              waterStreak: profile.water_streak ?? 0,
              appTheme: profile.app_theme ?? 'system',
              language: profile.language ?? 'en',
              notifications: profile.notifications ?? MockStore.notifications,
            });
          }
          if (mounted) {
            setIsInitialized(true);
            const inAuthGroup = segmentsRef.current[0] === '(auth)';
            if (inAuthGroup) {
              router.replace('/(tabs)');
            }
          }
        } else {
          if (mounted) {
            setIsInitialized(true);
            const inAuthGroup = segmentsRef.current[0] === '(auth)';
            if (!inAuthGroup) {
              router.replace('/(auth)/login');
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setIsInitialized(true);
          router.replace('/(auth)/login');
        }
      }
    }, 2000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Route guarding check during navigation when initialized
  useEffect(() => {
    if (!isInitialized) return;

    const checkRouteGuard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const inAuthGroup = segments[0] === '(auth)';

      if (session && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    };
    checkRouteGuard();
  }, [segments, isInitialized]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor }}>
        <ActivityIndicator size="large" color="#7EB93C" />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <OfflineModal />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
