import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list/react-native';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import useAuthStore from '@/store/authStore';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';

export default function CoursesScreen() {
  const user = useAuthStore((s) => s.user);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const setSearchQuery = useCourseStore((s) => s.setSearchQuery);
  const searchQuery = useCourseStore((s) => s.searchQuery);
  const isLoading = useCourseStore((s) => s.isLoading);
  const error = useCourseStore((s) => s.error);
  const clearError = useCourseStore((s) => s.clearError);
  const getFilteredCourses = useCourseStore((s) => s.getFilteredCourses);

  const [refreshing, setRefreshing] = useState(false);
  const filteredCourses = getFilteredCourses();

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    useCourseStore.setState({ lastFetched: null });
    await fetchCourses();
    setRefreshing(false);
  }, [fetchCourses]);

  const renderItem = useCallback(({ item }: { item: Course }) => <CourseCard course={item} />, []);

  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  const firstName = user?.fullName?.split(' ')[0] ?? user?.username ?? 'Learner';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-muted text-sm">Hello, {firstName} 👋</Text>
        <Text className="text-primary text-2xl font-bold mt-0.5">Explore Courses</Text>

        <View className="bg-card border border-border rounded-xl flex-row items-center px-3 mt-4 mb-1">
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            className="flex-1 py-3 px-2 text-primary"
            placeholder="Search courses, instructors..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && !refreshing && filteredCourses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text className="text-muted mt-3 text-sm">Loading courses...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="wifi-outline" size={48} color="#94A3B8" />
          <Text className="text-primary font-semibold text-lg mt-4 text-center">Failed to load courses</Text>
          <Text className="text-muted text-sm mt-1 text-center">{error}</Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3 mt-6"
            onPress={() => { clearError(); fetchCourses(); }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LegendList
          data={filteredCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
          estimatedItemSize={280}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1E3A5F"
              colors={['#1E3A5F']}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text className="text-muted text-base mt-3">No courses found</Text>
            </View>
          }
          recycleItems
        />
      )}
    </SafeAreaView>
  );
}
