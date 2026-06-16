import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Course } from '@/types';
import useCourseStore from '@/store/courseStore';

interface Props {
  course: Course;
}

const CourseCard = memo(({ course }: Props) => {
  const toggleBookmark = useCourseStore((s) => s.toggleBookmark);

  const handleBookmark = useCallback(
    (e: any) => {
      e.stopPropagation();
      toggleBookmark(course.id);
    },
    [course.id, toggleBookmark]
  );

  const handlePress = useCallback(() => {
    router.push(`/course/${course.id}`);
  }, [course.id]);

  const instructorName = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim()
    : 'Unknown Instructor';

  return (
    <Pressable
      onPress={handlePress}
      className="bg-card rounded-2xl mb-4 shadow-sm overflow-hidden border border-border"
    >
      <Image
        source={{ uri: course.thumbnail }}
        style={{ width: '100%', height: 160 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      <View className="p-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="bg-primary/10 px-2 py-0.5 rounded-full">
            <Text className="text-primary text-xs font-medium capitalize">{course.category}</Text>
          </View>
          <TouchableOpacity onPress={handleBookmark} hitSlop={8} accessibilityLabel="Bookmark course">
            <Ionicons
              name={course.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={course.isBookmarked ? '#F59E0B' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-primary font-bold text-base mb-1" numberOfLines={2}>
          {course.title}
        </Text>

        <Text className="text-muted text-xs mb-2" numberOfLines={2}>
          {course.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Image
              source={{ uri: course.instructor?.image || 'https://i.pravatar.cc/40' }}
              style={{ width: 24, height: 24, borderRadius: 12 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text className="text-muted text-xs">{instructorName}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-muted text-xs">{course.rating?.toFixed(1) ?? '4.5'}</Text>
          </View>
        </View>

        {course.isEnrolled && (
          <View className="mt-2 bg-success/10 rounded-lg px-2 py-1 flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-success text-xs font-medium">Enrolled</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

CourseCard.displayName = 'CourseCard';
export default CourseCard;
