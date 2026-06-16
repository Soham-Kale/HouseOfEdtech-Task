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
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const register = useAuthStore((s) => s.register);
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
      await register(data.email, data.username, data.password);
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
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
        <View className="flex-1 px-6 pt-14 pb-8">
          <View className="items-center mb-8">
            <View className="bg-primary w-16 h-16 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="school" size={32} color="white" />
            </View>
            <Text className="text-primary text-3xl font-bold">Create Account</Text>
            <Text className="text-muted text-base mt-1">Start your learning journey today</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-primary font-semibold mb-1.5 text-sm">Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-card border border-border rounded-xl px-4 py-3.5 text-primary"
                    placeholder="johndoe"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-error text-xs mt-1">{errors.username.message}</Text>
              )}
            </View>

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
                      placeholder="Min. 8 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-error text-xs mt-1">{errors.password.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-primary font-semibold mb-1.5 text-sm">Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-card border border-border rounded-xl px-4 py-3.5 text-primary"
                    placeholder="Repeat your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-error text-xs mt-1">{errors.confirmPassword.message}</Text>
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
                <Text className="text-white font-bold text-base">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-2">
              <Text className="text-muted">Already have an account? </Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-primary font-semibold">Sign In</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
