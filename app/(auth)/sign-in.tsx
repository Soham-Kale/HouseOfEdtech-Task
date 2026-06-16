import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { router, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-8 justify-center">
          <View className="items-center mb-10">
            <View className="bg-primary w-16 h-16 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="school" size={32} color="white" />
            </View>
            <Text className="text-primary text-3xl font-bold">EduLearn</Text>
            <Text className="text-muted text-base mt-1">Sign in to continue learning</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-primary font-semibold mb-1.5 text-sm">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-card border border-border rounded-xl px-4 py-3.5 text-primary"
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-error text-xs mt-1">{errors.email.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-primary font-semibold mb-1.5 text-sm">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="bg-card border border-border rounded-xl flex-row items-center px-4">
                    <TextInput
                      className="flex-1 py-3.5 text-primary"
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-error text-xs mt-1">{errors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mt-2"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
              <Text className="text-muted">Don't have an account? </Text>
              <Link href="/(auth)/sign-up">
                <Text className="text-primary font-semibold">Sign Up</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
