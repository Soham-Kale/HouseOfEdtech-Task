import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list/react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import useCourseStore from '@/store/courseStore';
import { mapCategory } from '@/utils/categoryMap';
import useAuthStore from '@/store/authStore';
import CourseCard from '@/components/CourseCard';
import { Course } from '@/types';

const CATEGORIES = ['All', 'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'furniture'];

export default function CoursesScreen() {
  const user = useAuthStore((s) => s.user);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const setSearchQuery = useCourseStore((s) => s.setSearchQuery);
  const searchQuery = useCourseStore((s) => s.searchQuery);
  const isLoading = useCourseStore((s) => s.isLoading);
  const error = useCourseStore((s) => s.error);
  const clearError = useCourseStore((s) => s.clearError);
  const getFilteredCourses = useCourseStore((s) => s.getFilteredCourses);
  const courses = useCourseStore((s) => s.courses);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allFiltered = getFilteredCourses();

  const filteredCourses =
    selectedCategory === 'All'
      ? allFiltered
      : allFiltered.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase());

  useEffect(() => {
    fetchCourses();
  }, []);

  // Build dynamic category list from loaded courses
  const dynamicCategories = ['All', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))).slice(0, 6)];
  const categoryList = courses.length > 0 ? dynamicCategories : CATEGORIES;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    useCourseStore.setState({ lastFetched: null });
    await fetchCourses();
    setRefreshing(false);
  }, [fetchCourses]);

  const renderItem = useCallback(({ item }: { item: Course }) => <CourseCard course={item} />, []);
  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  const firstName = user?.fullName?.split(' ')[0] ?? user?.username ?? 'Learner';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ListHeaderComponent = (
    <View>
      <Text style={styles.courseCount}>
        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navy Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            <Text style={styles.headerTitle}>Explore Courses</Text>
          </View>
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={18} color="#1E3A5F" />
            </View>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
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
      </SafeAreaView>

      {/* Category Chips */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categoryList.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                  {cat === 'All' ? 'All' : mapCategory(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading && !refreshing && filteredCourses.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="wifi-outline" size={40} color="#1E3A5F" />
          </View>
          <Text style={styles.errorTitle}>Failed to load courses</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => { clearError(); fetchCourses(); }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <LegendList
          data={filteredCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          estimatedItemSize={290}
          ListHeaderComponent={ListHeaderComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1E3A5F"
              colors={['#1E3A5F']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={56} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or category</Text>
            </View>
          }
          recycleItems
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  greeting: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1E3A5F',
  },
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  courseCount: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    color: '#1E3A5F',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#1E3A5F',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
  },
});
