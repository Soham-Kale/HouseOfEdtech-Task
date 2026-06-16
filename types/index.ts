export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  role: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Instructor {
  id: number;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  username: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  instructor?: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    nextPage: number | null;
    previousPage: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message: string;
  statusCode: number;
  success: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface CourseStore {
  courses: Course[];
  instructors: Instructor[];
  bookmarks: number[];
  enrolledCourses: number[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}
