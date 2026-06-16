import { useCallback } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list/react-native';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';

export default function BookmarksScreen() {
  const courses = useCourseStore((s) => s.courses);
  const bookmarked = courses.filter((c) => c.isBookmarked);

  const renderItem = useCallback(({ item }: { item: Course }) => <CourseCard course={item} />, []);
  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-primary text-2xl font-bold">Bookmarks</Text>
        <Text className="text-muted text-sm mt-0.5">{bookmarked.length} saved courses</Text>
      </View>

      {bookmarked.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="bookmark-outline" size={56} color="#CBD5E1" />
          <Text className="text-primary font-semibold text-lg mt-4">No bookmarks yet</Text>
          <Text className="text-muted text-sm mt-1 text-center">
            Tap the bookmark icon on any course to save it here.
          </Text>
        </View>
      ) : (
        <LegendList
          data={bookmarked}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
          estimatedItemSize={280}
          recycleItems
        />
      )}
    </SafeAreaView>
  );
}
