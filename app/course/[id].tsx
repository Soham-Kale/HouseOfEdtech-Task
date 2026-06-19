import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mapCategory } from '@/utils/categoryMap';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import { Course } from '@/types';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 280;

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
    Alert.alert('Enrolled! 🎉', `You've successfully enrolled in "${course.title}". Happy learning!`);
  }, [course, enrolled, enrollCourse]);

  const handleViewContent = useCallback(() => {
    if (!course) return;
    router.push({ pathname: '/course/content', params: { courseId: String(course.id) } });
  }, [course]);

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  const instructorName = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim()
    : 'Unknown Instructor';

  const discountedPrice =
    course.discountPercentage > 0
      ? course.price * (1 - course.discountPercentage / 100)
      : course.price;

  const ratingFull = Math.round(course.rating ?? 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Image with overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Dark overlay strip at bottom */}
          <View style={styles.heroOverlay}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{mapCategory(course.category)}</Text>
            </View>
            <TouchableOpacity
              onPress={handleBookmark}
              style={styles.bookmarkBtn}
              hitSlop={8}
            >
              <Ionicons
                name={course.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={course.isBookmarked ? '#F59E0B' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={i <= ratingFull ? 'star' : 'star-outline'}
                  size={16}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text style={styles.ratingNum}>{course.rating?.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({course.stock?.toLocaleString()} students enrolled)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${discountedPrice.toFixed(2)}</Text>
            {course.discountPercentage > 0 && (
              <>
                <Text style={styles.originalPrice}>${course.price.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{course.discountPercentage.toFixed(0)}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Instructor card */}
          <View style={styles.instructorCard}>
            <Image
              source={{ uri: course.instructor?.image || 'https://i.pravatar.cc/80' }}
              style={styles.instructorAvatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.instructorName}>{instructorName}</Text>
              <Text style={styles.instructorRole}>Course Instructor</Text>
            </View>
            <View style={styles.instructorBadge}>
              <Ionicons name="ribbon-outline" size={14} color="#1E3A5F" />
              <Text style={styles.instructorBadgeText}>Expert</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'layers-outline' as const, label: 'Lessons', value: String(course.stock) },
              { icon: 'ribbon-outline' as const, label: 'Publisher', value: course.brand || 'N/A' },
              { icon: 'time-outline' as const, label: 'Duration', value: '~4h' },
            ].map(({ icon, label, value }) => (
              <View key={label} style={styles.statCard}>
                <View style={styles.statIconWrapper}>
                  <Ionicons name={icon} size={18} color="#1E3A5F" />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* View Content button */}
          <TouchableOpacity onPress={handleViewContent} style={styles.contentBtn}>
            <Ionicons name="play-circle-outline" size={20} color="#1E3A5F" />
            <Text style={styles.contentBtnText}>View Course Content</Text>
          </TouchableOpacity>

          {/* Spacer for sticky bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          onPress={handleEnroll}
          disabled={enrolled || enrolling}
          style={[styles.enrollBtn, enrolled && styles.enrollBtnEnrolled]}
          activeOpacity={0.85}
        >
          {enrolling ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.enrollBtnInner}>
              <Ionicons
                name={enrolled ? 'checkmark-circle' : 'school-outline'}
                size={20}
                color={enrolled ? '#10B981' : '#FFFFFF'}
              />
              <Text style={[styles.enrollBtnText, enrolled && styles.enrollBtnTextEnrolled]}>
                {enrolled ? 'Enrolled ✓' : 'Enroll Now — Free'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    paddingBottom: 0,
  },
  heroContainer: {
    width,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width,
    height: HERO_HEIGHT,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    color: '#1E3A5F',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingNum: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingCount: {
    color: '#94A3B8',
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  price: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '800',
  },
  originalPrice: {
    color: '#94A3B8',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    elevation: 2,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  instructorName: {
    color: '#1E3A5F',
    fontWeight: '700',
    fontSize: 14,
  },
  instructorRole: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  instructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instructorBadgeText: {
    color: '#1E3A5F',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#1E3A5F',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    color: '#1E3A5F',
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  contentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  contentBtnText: {
    color: '#1E3A5F',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  enrollBtn: {
    backgroundColor: '#1E3A5F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  enrollBtnEnrolled: {
    backgroundColor: '#D1FAE5',
    elevation: 0,
    shadowOpacity: 0,
  },
  enrollBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enrollBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  enrollBtnTextEnrolled: {
    color: '#10B981',
  },
});
