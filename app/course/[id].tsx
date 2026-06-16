import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import { Course } from '@/types';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courses = useCourseStore((s) => s.courses);
  const toggleBookmark = useCourseStore((s) => s.toggleBookmark);
  const enrollCourse = useCourseStore((s) => s.enrollCourse);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const found = courses.find((c) => c.id === Number(id));
    if (found) {
      setCourse(found);
      setEnrolled(found.isEnrolled ?? false);
    }
  }, [id, courses]);

  const handleBookmark = useCallback(() => {
    if (course) toggleBookmark(course.id);
  }, [course, toggleBookmark]);

  const handleEnroll = useCallback(async () => {
    if (!course || enrolled) return;
    setEnrolling(true);
    await enrollCourse(course.id);
    setEnrolled(true);
    setEnrolling(false);
    Alert.alert('Enrolled!', `You've successfully enrolled in "${course.title}". Happy learning!`);
  }, [course, enrolled, enrollCourse]);

  const handleViewContent = useCallback(() => {
    if (!course) return;
    router.push({
      pathname: '/course/content',
      params: { courseId: String(course.id) },
    });
  }, [course]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1E3A5F" />
      </SafeAreaView>
    );
  }

  const instructorName = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim()
    : 'Unknown Instructor';

  const discountedPrice =
    course.discountPercentage > 0
      ? course.price * (1 - course.discountPercentage / 100)
      : course.price;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width, height: 220 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        <View className="px-5 py-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-primary/10 px-2.5 py-0.5 rounded-full">
                  <Text className="text-primary text-xs font-semibold capitalize">{course.category}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text className="text-muted text-xs">{course.rating?.toFixed(1)}</Text>
                </View>
              </View>
              <Text className="text-primary text-xl font-bold leading-tight">{course.title}</Text>
            </View>
            <TouchableOpacity
              onPress={handleBookmark}
              className="bg-card border border-border rounded-xl p-2.5"
              hitSlop={8}
            >
              <Ionicons
                name={course.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={course.isBookmarked ? '#F59E0B' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <Image
              source={{ uri: course.instructor?.image || 'https://i.pravatar.cc/48' }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View>
              <Text className="text-primary font-semibold text-sm">{instructorName}</Text>
              <Text className="text-muted text-xs">{course.instructor?.email ?? 'Instructor'}</Text>
            </View>
          </View>

          <View className="bg-card border border-border rounded-2xl p-4 mb-4">
            <View className="flex-row justify-around">
              {[
                { icon: 'pricetag-outline', label: 'Price', value: `$${discountedPrice.toFixed(2)}` },
                { icon: 'layers-outline', label: 'Stock', value: String(course.stock) },
                { icon: 'ribbon-outline', label: 'Brand', value: course.brand || 'N/A' },
              ].map(({ icon, label, value }) => (
                <View key={label} className="items-center">
                  <Ionicons name={icon as any} size={20} color="#1E3A5F" />
                  <Text className="text-primary font-bold text-base mt-1">{value}</Text>
                  <Text className="text-muted text-xs">{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-primary font-bold text-base mb-2">About This Course</Text>
            <Text className="text-muted leading-relaxed">{course.description}</Text>
          </View>

          {course.discountPercentage > 0 && (
            <View className="bg-accent/10 border border-accent/30 rounded-xl p-3 mb-4 flex-row items-center gap-2">
              <Ionicons name="ticket-outline" size={18} color="#F59E0B" />
              <Text className="text-accent font-semibold text-sm">
                {course.discountPercentage.toFixed(0)}% discount applied — original ${course.price.toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleViewContent}
            className="bg-primary/10 border border-primary/20 rounded-2xl py-3.5 px-5 flex-row items-center justify-center gap-2 mb-3"
          >
            <Ionicons name="play-circle-outline" size={20} color="#1E3A5F" />
            <Text className="text-primary font-semibold">View Course Content</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEnroll}
            disabled={enrolled || enrolling}
            className={`rounded-2xl py-4 items-center justify-center flex-row gap-2 ${
              enrolled ? 'bg-success/20' : 'bg-primary'
            }`}
          >
            {enrolling ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name={enrolled ? 'checkmark-circle' : 'school-outline'}
                  size={20}
                  color={enrolled ? '#10B981' : 'white'}
                />
                <Text className={`font-bold text-base ${enrolled ? 'text-success' : 'text-white'}`}>
                  {enrolled ? 'Enrolled' : 'Enroll Now — Free'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}