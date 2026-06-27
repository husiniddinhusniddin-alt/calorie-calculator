import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { MockStore } from '@/constants/store';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Fetch user profile from Supabase profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
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
            });
          }
          
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        console.warn('Session check error:', err);
        router.replace('/(auth)/login');
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAF3' }}>
        <ActivityIndicator size="large" color="#7EB93C" />
      </View>
    );
  }

  return null;
}
