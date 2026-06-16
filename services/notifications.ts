import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_IDS, REMINDER_THRESHOLD_MS, STORAGE_KEYS } from '@/constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BOOKMARK_MILESTONE).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.BOOKMARK_MILESTONE,
    content: {
      title: 'Great progress!',
      body: "You've bookmarked 5 courses. Keep exploring and start learning!",
      data: { type: 'bookmark_milestone' },
    },
    trigger: null,
  });
}

export async function checkAndScheduleDailyReminder(): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const lastOpenRaw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_OPEN_TIME);
  const now = Date.now();

  if (lastOpenRaw) {
    const lastOpen = parseInt(lastOpenRaw, 10);
    const elapsed = now - lastOpen;

    if (elapsed >= REMINDER_THRESHOLD_MS) {
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAILY_REMINDER).catch(() => {});
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.DAILY_REMINDER,
        content: {
          title: "Miss learning?",
          body: "You haven't opened EduLearn in 24 hours. Your courses are waiting!",
          data: { type: 'daily_reminder' },
        },
        trigger: null,
      });
    }
  }

  await AsyncStorage.setItem(STORAGE_KEYS.LAST_OPEN_TIME, now.toString());
}
