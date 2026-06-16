import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import useAuthStore from '@/store/authStore';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/sign-in');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator size="large" color="#1E3A5F" />
    </View>
  );
}
