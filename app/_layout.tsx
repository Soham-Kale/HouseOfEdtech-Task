import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuthStore from '@/store/authStore';
import useCourseStore from '@/store/courseStore';
import { checkAndScheduleDailyReminder } from '@/services/notifications';

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrateBookmarks = useCourseStore((s) => s.hydrateBookmarks);

  useEffect(() => {
    hydrate();
    hydrateBookmarks();
    checkAndScheduleDailyReminder();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]" options={{ headerShown: true, title: 'Course Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="course/content" options={{ headerShown: true, title: 'Course Content', headerBackTitle: 'Back' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
