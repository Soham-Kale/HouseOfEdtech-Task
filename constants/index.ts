export const API_BASE_URL = 'https://api.freeapi.app';

export const STORAGE_KEYS = {
  BOOKMARKS: 'edu_bookmarks',
  ENROLLED_COURSES: 'edu_enrolled',
  LAST_OPEN_TIME: 'edu_last_open',
  USER_PREFERENCES: 'edu_preferences',
  COURSES_CACHE: 'edu_courses_cache',
  INSTRUCTORS_CACHE: 'edu_instructors_cache',
} as const;

export const SECURE_KEYS = {
  ACCESS_TOKEN: 'edu_access_token',
  REFRESH_TOKEN: 'edu_refresh_token',
  USER_DATA: 'edu_user_data',
} as const;

export const NOTIFICATION_IDS = {
  BOOKMARK_MILESTONE: 'bookmark-milestone',
  DAILY_REMINDER: 'daily-reminder',
} as const;

export const CACHE_TTL_MS = 5 * 60 * 1000;
export const REQUEST_TIMEOUT_MS = 10000;
export const RETRY_ATTEMPTS = 3;
export const REMINDER_THRESHOLD_MS = 24 * 60 * 60 * 1000;
export const BOOKMARK_NOTIFICATION_THRESHOLD = 5;
