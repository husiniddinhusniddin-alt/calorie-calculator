interface StoreState {
  profileImage: string | null;
  targetWeight: number;
  currentWeight: number;
  startingWeight: number;
  dailyCalorieGoal: number;
  weeklyWeightGoal: number;
  targetDate: Date;
  appTheme: 'light' | 'dark' | 'system';
  language: 'en' | 'ru' | 'uz';
  name: string;
  email: string;
  age: number | null;
  height: number | null;
  calorieStreak: number;
  waterStreak: number;
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    weightLogAlert: boolean;
    promoEmail: boolean;
    soundEffects: boolean;
  };
}

export const MockStore = {
  profileImage: null as string | null,
  targetWeight: 82,
  currentWeight: 85,
  startingWeight: 88,
  dailyCalorieGoal: 2000,
  weeklyWeightGoal: 0.5,
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  appTheme: 'system' as 'light' | 'dark' | 'system',
  language: 'en' as 'en' | 'ru' | 'uz',
  name: 'Alex Green',
  email: 'alex.green@health.com',
  age: null as number | null,
  height: null as number | null,
  calorieStreak: 0,
  waterStreak: 0,
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    weightLogAlert: false,
    promoEmail: false,
    soundEffects: true,
  },
  listeners: [] as Array<() => void>,
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  update(newData: Partial<StoreState>) {
    Object.assign(this, newData);
    this.listeners.forEach(l => l());
  }
};
