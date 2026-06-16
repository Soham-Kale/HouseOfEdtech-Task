import React from 'react';
import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View className="bg-error px-4 py-2 items-center flex-row justify-center gap-2">
      <Text className="text-white text-sm font-semibold">No internet connection</Text>
    </View>
  );
}
