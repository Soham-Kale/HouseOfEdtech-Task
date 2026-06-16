import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, CourseStore, Instructor } from '@/types';
import {
  BOOKMARK_NOTIFICATION_THRESHOLD,
  CACHE_TTL_MS,
  STORAGE_KEYS,
} from '@/constants';
import { courseService } from '@/services/courses';
import { scheduleBookmarkMilestoneNotification } from '@/services/notifications';

interface CourseActions {
  fetchCourses: () => Promise<void>;
  toggleBookmark: (courseId: number) => Promise<void>;
  enrollCourse: (courseId: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  hydrateBookmarks: () => Promise<void>;
  clearError: () => void;
  getFilteredCourses: () => Course[];
}

const useCourseStore = create<CourseStore & CourseActions>((set, get) => ({
  courses: [],
  instructors: [],
  bookmarks: [],
  enrolledCourses: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  lastFetched: null,

  hydrateBookmarks: async () => {
    const bookmarksRaw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    const enrolledRaw = await AsyncStorage.getItem(STORAGE_KEYS.ENROLLED_COURSES);
    const bookmarks: number[] = bookmarksRaw ? JSON.parse(bookmarksRaw) : [];
    const enrolledCourses: number[] = enrolledRaw ? JSON.parse(enrolledRaw) : [];
    set({ bookmarks, enrolledCourses });
  },

  fetchCourses: async () => {
    const { lastFetched, courses } = get();
    const now = Date.now();

    if (courses.length > 0 && lastFetched && now - lastFetched < CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [productsRes, usersRes] = await Promise.all([
        courseService.getProducts(1, 20),
        courseService.getInstructors(1, 20),
      ]);

      const rawUsers = usersRes.data.data as any[];

      const instructors: Instructor[] = rawUsers.map((user: any) => ({
        id: user.id,
        uid: user.uid ?? String(user.id),
        firstName: user.firstName ?? user.name?.first ?? user.login?.username ?? 'Instructor',
        lastName: user.lastName ?? user.name?.last ?? '',
        email: user.email ?? '',
        image: user.image ?? user.picture?.large ?? user.avatar ?? '',
        username: user.username ?? user.login?.username ?? `user_${user.id}`,
      }));

      const { bookmarks, enrolledCourses } = get();

      const courses: Course[] = productsRes.data.data.map((p: any, idx: number) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        discountPercentage: p.discountPercentage ?? 0,
        rating: p.rating ?? 0,
        stock: p.stock ?? 0,
        brand: p.brand ?? '',
        category: p.category ?? '',
        thumbnail: p.thumbnail,
        images: p.images ?? [p.thumbnail],
        instructor: instructors[idx % instructors.length],
        isBookmarked: bookmarks.includes(p.id),
        isEnrolled: enrolledCourses.includes(p.id),
      }));

      set({ courses, instructors, lastFetched: now, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load courses', isLoading: false });
    }
  },

  toggleBookmark: async (courseId) => {
    const { bookmarks, courses } = get();
    const isBookmarked = bookmarks.includes(courseId);
    const updatedBookmarks = isBookmarked
      ? bookmarks.filter((id) => id !== courseId)
      : [...bookmarks, courseId];

    const updatedCourses = courses.map((c) =>
      c.id === courseId ? { ...c, isBookmarked: !isBookmarked } : c
    );

    set({ bookmarks: updatedBookmarks, courses: updatedCourses });
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updatedBookmarks));

    if (!isBookmarked && updatedBookmarks.length === BOOKMARK_NOTIFICATION_THRESHOLD) {
      await scheduleBookmarkMilestoneNotification();
    }
  },

  enrollCourse: async (courseId) => {
    const { enrolledCourses, courses } = get();
    if (enrolledCourses.includes(courseId)) return;

    const updated = [...enrolledCourses, courseId];
    const updatedCourses = courses.map((c) =>
      c.id === courseId ? { ...c, isEnrolled: true } : c
    );

    set({ enrolledCourses: updated, courses: updatedCourses });
    await AsyncStorage.setItem(STORAGE_KEYS.ENROLLED_COURSES, JSON.stringify(updated));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearError: () => set({ error: null }),

  getFilteredCourses: () => {
    const { courses, searchQuery } = get();
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        `${c.instructor?.firstName} ${c.instructor?.lastName}`.toLowerCase().includes(q)
    );
  },
}));

export default useCourseStore;
