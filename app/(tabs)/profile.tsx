import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import useAuthStore from '@/store/authStore';
import useCourseStore from '@/store/courseStore';
import { authService } from '@/services/auth';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Edit Profile', desc: 'Update your information' },
  { icon: 'notifications-outline' as const, label: 'Notifications', desc: 'Manage alerts' },
  { icon: 'shield-outline' as const, label: 'Privacy & Security', desc: 'Account protection' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', desc: 'Get assistance' },
];

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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Navy Profile Header */}
        <SafeAreaView style={styles.header} edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleUpdateAvatar} style={styles.avatarTouchable}>
              <Image
                source={{ uri: user?.avatar || 'https://i.pravatar.cc/120' }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {uploadingAvatar ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <View style={styles.cameraBtn}>
                  <Ionicons name="camera" size={13} color="#1E3A5F" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.fullName ?? user?.username ?? 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role ?? 'Student'}</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Stats Cards — overlapping the header */}
        <View style={styles.statsRow}>
          {[
            { icon: 'book-outline' as const, label: 'Enrolled', value: String(enrolledCourses.length), color: '#3B82F6', bg: '#EFF6FF' },
            { icon: 'bookmark-outline' as const, label: 'Saved', value: String(bookmarks.length), color: '#F59E0B', bg: '#FFFBEB' },
            { icon: 'trending-up-outline' as const, label: 'Progress', value: '0%', color: '#10B981', bg: '#D1FAE5' },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons name={item.icon} size={20} color="#1E3A5F" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDesc}>{item.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#1E3A5F',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E3A5F',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -18,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#1E3A5F',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuSectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: '#1E3A5F',
    fontWeight: '600',
    fontSize: 14,
  },
  menuDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  signOutSection: {
    paddingHorizontal: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
  },
});
