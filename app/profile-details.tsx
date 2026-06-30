import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Provider as PaperProvider, TextInput, Snackbar, Portal } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { MockStore } from '@/constants/store';
import { supabase } from '@/constants/supabase';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme Colors
  const theme = {
    background: isDark ? '#0F140A' : '#F7FAF3',
    cardBackground: isDark ? '#171E10' : '#FFFFFF',
    cardBorder: isDark ? '#2A3A1E' : '#EBF2E5',
    textPrimary: isDark ? '#FAFCF8' : '#1A2310',
    textBrand: isDark ? '#8CC33F' : '#3A5C18',
    textMuted: isDark ? '#9AA88E' : '#6B785E',
    badgeBackground: isDark ? '#23321A' : '#F0FAE4',
    badgeBorder: isDark ? '#374B2A' : '#C8E8A0',
    inputText: isDark ? '#FAFCF8' : '#1A2310',
    inputBackground: isDark ? '#171E10' : '#FFFFFF',
    inputOutline: isDark ? '#2A3A1E' : '#EBF2E5',
  };

  // Sync state with MockStore (already populated from Supabase on login)
  const [name, setName] = useState(MockStore.name || 'User');
  const [email, setEmail] = useState(MockStore.email || '');
  const [phone, setPhone] = useState('');
  const [height, setHeight] = useState(MockStore.height ? MockStore.height.toString() : '180');
  const [weight, setWeight] = useState(MockStore.currentWeight.toString());
  const [age, setAge] = useState(MockStore.age ? MockStore.age.toString() : '');
  const [dob, setDob] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(MockStore.profileImage);

  const [originalValues, setOriginalValues] = useState({
    name: MockStore.name || 'User',
    email: MockStore.email || '',
    phone: '',
    height: MockStore.height ? MockStore.height.toString() : '180',
    weight: MockStore.currentWeight.toString(),
    age: MockStore.age ? MockStore.age.toString() : '',
    dob: '',
    profileImage: MockStore.profileImage,
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // On mount, fetch full profile from Supabase to get phone, height, dob
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        const fetchedName = profile.name || MockStore.name || 'User';
        const fetchedEmail = profile.email || MockStore.email || '';
        const fetchedPhone = profile.phone || '';
        const fetchedHeight = (profile.height || MockStore.height || 180).toString();
        const fetchedWeight = (profile.current_weight || MockStore.currentWeight).toString();
        const fetchedAge = (profile.age || MockStore.age || '').toString();
        const fetchedDob = profile.dob || '';
        const fetchedProfileImage = profile.profile_image || MockStore.profileImage;

        setName(fetchedName);
        setEmail(fetchedEmail);
        setPhone(fetchedPhone);
        setHeight(fetchedHeight);
        setWeight(fetchedWeight);
        setAge(fetchedAge);
        setDob(fetchedDob);
        setProfileImage(fetchedProfileImage);

        setOriginalValues({
          name: fetchedName,
          email: fetchedEmail,
          phone: fetchedPhone,
          height: fetchedHeight,
          weight: fetchedWeight,
          age: fetchedAge,
          dob: fetchedDob,
          profileImage: fetchedProfileImage,
        });
      }
    }
    loadProfile();

    return MockStore.subscribe(() => {
      setProfileImage(MockStore.profileImage);
      setWeight(MockStore.currentWeight.toString());
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setSnackbarMsg('Name and Email cannot be empty.');
      setSnackbarVisible(true);
      return;
    }

    setIsSaving(true);

    const parsedWeight = parseFloat(weight) || MockStore.currentWeight;
    const parsedHeight = parseFloat(height) || 180;
    const parsedAge = parseInt(age, 10) || null;

    // Save to MockStore
    MockStore.update({
      name: name.trim(),
      email: email.trim(),
      profileImage: profileImage,
      currentWeight: parsedWeight,
      height: parsedHeight,
      age: parsedAge,
    });

    // Save to Supabase profiles table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').update({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          height: parsedHeight,
          age: parsedAge,
          current_weight: parsedWeight,
          dob: dob.trim() || null,
          profile_image: profileImage,
        }).eq('id', user.id);
        
        if (error) {
          console.warn('Update error:', error);
          setSnackbarMsg('Failed to update: ' + error.message);
          setSnackbarVisible(true);
          setIsSaving(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to save profile to DB:', err);
    }

    setSnackbarMsg('Personal details saved successfully! 🎉');
    setSnackbarVisible(true);
    setTimeout(() => {
      setIsSaving(false);
      (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'));
    }, 1500);
  };

  // Profile Image Picker
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to change your avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const hasChanges = 
    name !== originalValues.name ||
    email !== originalValues.email ||
    phone !== originalValues.phone ||
    height !== originalValues.height ||
    weight !== originalValues.weight ||
    age !== originalValues.age ||
    dob !== originalValues.dob ||
    profileImage !== originalValues.profileImage;

  return (
    <PaperProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.badgeBackground, borderColor: theme.cardBorder }]}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#7EB93C" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.textBrand }]}>Personal Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Edit Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity 
                style={[styles.avatarContainer, { backgroundColor: theme.badgeBackground }]} 
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>AG</Text>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={[styles.avatarTipText, { color: theme.textMuted }]}>Tap to change avatar</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textBrand }]}>Basic Info</Text>

              <TextInput
                mode="outlined"
                label="Full Name"
                value={name}
                onChangeText={setName}
                activeOutlineColor="#7EB93C"
                outlineColor={theme.inputOutline}
                textColor={theme.inputText}
                theme={{ colors: { background: theme.inputBackground } }}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                activeOutlineColor="#7EB93C"
                outlineColor={theme.inputOutline}
                textColor={theme.inputText}
                theme={{ colors: { background: theme.inputBackground } }}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                activeOutlineColor="#7EB93C"
                outlineColor={theme.inputOutline}
                textColor={theme.inputText}
                theme={{ colors: { background: theme.inputBackground } }}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Date of Birth"
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                activeOutlineColor="#7EB93C"
                outlineColor={theme.inputOutline}
                textColor={theme.inputText}
                theme={{ colors: { background: theme.inputBackground } }}
                style={styles.input}
              />
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textBrand }]}>Body Metrics</Text>
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    mode="outlined"
                    label="Height (cm)"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    activeOutlineColor="#7EB93C"
                    outlineColor={theme.inputOutline}
                    textColor={theme.inputText}
                    theme={{ colors: { background: theme.inputBackground } }}
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TextInput
                    mode="outlined"
                    label="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    activeOutlineColor="#7EB93C"
                    outlineColor={theme.inputOutline}
                    textColor={theme.inputText}
                    theme={{ colors: { background: theme.inputBackground } }}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={[styles.row, { marginTop: 12 }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TextInput
                    mode="outlined"
                    label="Weight (kg)"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    activeOutlineColor="#7EB93C"
                    outlineColor={theme.inputOutline}
                    textColor={theme.inputText}
                    theme={{ colors: { background: theme.inputBackground } }}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {hasChanges && (
              <TouchableOpacity 
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}

          </ScrollView>
        </KeyboardAvoidingView>

        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={1500}
            style={styles.snackbar}
          >
            {snackbarMsg}
          </Snackbar>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 15,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7EB93C',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7EB93C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarTipText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#7EB93C',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7EB93C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  snackbar: {
    backgroundColor: '#1A2310',
    borderRadius: 14,
  },
});
