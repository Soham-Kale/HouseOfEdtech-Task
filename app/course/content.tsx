import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import { Course } from '@/types';

function buildCourseHtml(course: Course): string {
  const instructorName = course.instructor
    ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim()
    : 'Unknown Instructor';

  const lessonCount = Math.max(5, Math.floor(course.stock / 3));
  const lessons = Array.from({ length: lessonCount }, (_, i) => `Lesson ${i + 1}: ${course.category} Module ${i + 1}`);
  const lessonsHtml = lessons.map((l) => `<li>${l}</li>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${course.title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      padding: 0 0 40px;
    }
    .hero {
      background: linear-gradient(135deg, #1E3A5F 0%, #2D5F9E 100%);
      padding: 28px 20px 24px;
      color: white;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
      margin-bottom: 10px;
    }
    .hero h1 { font-size: 22px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; }
    .hero .instructor { font-size: 13px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }
    .hero .instructor img { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); }
    .section { padding: 20px; background: white; margin: 12px 16px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .section h2 { font-size: 16px; font-weight: 700; color: #1E3A5F; margin-bottom: 10px; }
    .section p { font-size: 14px; line-height: 1.6; color: #475569; }
    .stats { display: flex; gap: 12px; padding: 12px 16px; }
    .stat { flex: 1; background: white; border-radius: 12px; padding: 14px 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .stat .value { font-size: 20px; font-weight: 700; color: #1E3A5F; }
    .stat .label { font-size: 11px; color: #64748B; margin-top: 2px; }
    .lessons { list-style: none; }
    .lessons li {
      padding: 12px 0;
      border-bottom: 1px solid #F1F5F9;
      font-size: 14px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lessons li::before { content: '▶'; color: #1E3A5F; font-size: 11px; flex-shrink: 0; }
    .lessons li:last-child { border-bottom: none; }
    .enroll-btn {
      display: block;
      background: linear-gradient(135deg, #1E3A5F, #2D5F9E);
      color: white;
      text-align: center;
      padding: 16px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      margin: 0 16px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      width: calc(100% - 32px);
    }
    .rating { color: #F59E0B; font-weight: 700; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="badge">${course.category}</div>
    <h1>${course.title}</h1>
    <div class="instructor">
      <img src="${course.instructor?.image || 'https://i.pravatar.cc/40'}" alt="${instructorName}" />
      <span>By ${instructorName}</span>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="value rating">⭐ ${course.rating?.toFixed(1)}</div>
      <div class="label">Rating</div>
    </div>
    <div class="stat">
      <div class="value">${lessonCount}</div>
      <div class="label">Lessons</div>
    </div>
    <div class="stat">
      <div class="value">$${(course.price * (1 - course.discountPercentage / 100)).toFixed(0)}</div>
      <div class="label">Price</div>
    </div>
  </div>

  <div class="section">
    <h2>About This Course</h2>
    <p>${course.description}</p>
  </div>

  <div class="section">
    <h2>Course Curriculum</h2>
    <ul class="lessons">${lessonsHtml}</ul>
  </div>

  <button class="enroll-btn" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'enroll',courseId:${course.id}}))">
    Enroll Now — Start Learning
  </button>

  <script>
    window.addEventListener('message', function(e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'courseData') {
          document.title = msg.title || document.title;
        }
      } catch(err) {}
    });
  </script>
</body>
</html>
  `;
}

export default function CourseContentScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const courses = useCourseStore((s) => s.courses);
  const enrollCourse = useCourseStore((s) => s.enrollCourse);
  const course = courses.find((c) => c.id === Number(courseId));

  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const injectedJS = course
    ? `window.ReactNativeWebView && window.ReactNativeWebView.postMessage && true; true;`
    : 'true;';

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'enroll' && msg.courseId) {
          enrollCourse(Number(msg.courseId));
        }
      } catch {}
    },
    [enrollCourse]
  );

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-muted">Course not found</Text>
      </SafeAreaView>
    );
  }

  const html = buildCourseHtml(course);

  return (
    <View className="flex-1 bg-surface">
      {isLoading && !hasError && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-surface">
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text className="text-muted mt-3 text-sm">Loading course content...</Text>
        </View>
      )}

      {hasError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="warning-outline" size={56} color="#EF4444" />
          <Text className="text-primary font-bold text-lg mt-4 text-center">Content failed to load</Text>
          <Text className="text-muted text-sm mt-1 text-center">
            There was a problem loading this course content.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3 mt-6"
            onPress={() => { setHasError(false); setIsLoading(true); }}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          injectedJavaScript={injectedJS}
          onMessage={onMessage}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { setHasError(true); setIsLoading(false); }}
          onHttpError={() => { setHasError(true); setIsLoading(false); }}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}
