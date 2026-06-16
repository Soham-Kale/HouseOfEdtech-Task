import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import useAuthStore from '@/store/authStore';
import useCourseStore from '@/store/courseStore';
import { authService } from '@/services/auth';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const bookmarks = useCourseStore((s) => s.bookmarks);
  const enrolledCourses = useCourseStore((s) => s.enrolledCourses);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          router.replace('/(auth)/sign-in');
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const handleUpdateAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await authService.updateAvatar(formData);
      if (response.data) updateUser(response.data);
    } catch {
      Alert.alert('Upload Failed', 'Could not update profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-primary text-2xl font-bold">Profile</Text>
        </View>

        <View className="items-center py-6 px-5">
          <TouchableOpacity onPress={handleUpdateAvatar} className="relative">
            <Image
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/120' }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            {uploadingAvatar ? (
              <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <View className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 border-2 border-white">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <Text className="text-primary text-xl font-bold mt-3">{user?.fullName ?? user?.username ?? 'User'}</Text>
          <Text className="text-muted text-sm mt-0.5">{user?.email}</Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full mt-2">
            <Text className="text-primary text-xs font-semibold capitalize">{user?.role ?? 'student'}</Text>
          </View>
        </View>

        <View className="mx-5 bg-card rounded-2xl border border-border p-4 mb-4">
          <Text className="text-primary font-bold mb-3">Learning Stats</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-primary text-2xl font-bold">{enrolledCourses.length}</Text>
              <Text className="text-muted text-xs mt-0.5">Enrolled</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center">
              <Text className="text-primary text-2xl font-bold">{bookmarks.length}</Text>
              <Text className="text-muted text-xs mt-0.5">Bookmarked</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center">
              <Text className="text-primary text-2xl font-bold">0%</Text>
              <Text className="text-muted text-xs mt-0.5">Progress</Text>
            </View>
          </View>
        </View>

        <View className="mx-5 bg-card rounded-2xl border border-border overflow-hidden mb-4">
          <TouchableOpacity className="flex-row items-center px-4 py-4 gap-3">
            <View className="bg-primary/10 w-9 h-9 rounded-lg items-center justify-center">
              <Ionicons name="person-outline" size={18} color="#1E3A5F" />
            </View>
            <Text className="text-primary font-medium flex-1">Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <View className="h-px bg-border mx-4" />
          <TouchableOpacity className="flex-row items-center px-4 py-4 gap-3">
            <View className="bg-primary/10 w-9 h-9 rounded-lg items-center justify-center">
              <Ionicons name="notifications-outline" size={18} color="#1E3A5F" />
            </View>
            <Text className="text-primary font-medium flex-1">Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <View className="h-px bg-border mx-4" />
          <TouchableOpacity className="flex-row items-center px-4 py-4 gap-3">
            <View className="bg-primary/10 w-9 h-9 rounded-lg items-center justify-center">
              <Ionicons name="shield-outline" size={18} color="#1E3A5F" />
            </View>
            <Text className="text-primary font-medium flex-1">Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View className="mx-5">
          <TouchableOpacity
            className="bg-error/10 rounded-2xl py-4 px-5 flex-row items-center gap-3"
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            )}
            <Text className="text-error font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
