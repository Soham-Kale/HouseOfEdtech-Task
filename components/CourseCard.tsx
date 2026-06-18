import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
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

  const discountedPrice =
    course.discountPercentage > 0
      ? course.price * (1 - course.discountPercentage / 100)
      : course.price;

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      {/* Thumbnail with overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Category badge — bottom-left */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{course.category}</Text>
        </View>

        {/* Bookmark — top-right */}
        <TouchableOpacity
          onPress={handleBookmark}
          hitSlop={8}
          accessibilityLabel="Bookmark course"
          style={styles.bookmarkButton}
        >
          <Ionicons
            name={course.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={course.isBookmarked ? '#F59E0B' : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Rating + Price */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingLeft}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{course.rating?.toFixed(1) ?? '4.5'}</Text>
            <Text style={styles.reviewCount}>({course.stock ?? 0})</Text>
          </View>
          <Text style={styles.price}>${discountedPrice.toFixed(2)}</Text>
        </View>

        {/* Instructor + Enrolled badge */}
        <View style={styles.instructorRow}>
          <Image
            source={{ uri: course.instructor?.image || 'https://i.pravatar.cc/40' }}
            style={styles.instructorAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <Text style={styles.instructorName} numberOfLines={1}>
            {instructorName}
          </Text>
          {course.isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.enrolledText}>Enrolled</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.58)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  body: {
    padding: 14,
  },
  title: {
    color: '#1E3A5F',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 21,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#1E3A5F',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  price: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  instructorName: {
    color: '#64748B',
    fontSize: 12,
    flex: 1,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  enrolledText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
});

CourseCard.displayName = 'CourseCard';
export default CourseCard;
