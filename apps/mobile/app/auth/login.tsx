import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, fontSize, fontFamily, radius } from '@yacita/ui';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('/(tabs)/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Credenciales incorrectas';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Yacita</Text>
          <Text style={styles.tagline}>Citas de última hora con descuento</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={colors.gray400}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="········"
            placeholderTextColor={colors.gray400}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            label="Entrar"
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: spacing.xl }}
          />

          <TouchableOpacity style={styles.registerLink} onPress={() => router.replace('/auth/register')}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.registerCta}>Regístrate gratis</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDark },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontFamily: fontFamily.heading, fontSize: fontSize.display, color: colors.white, fontWeight: '800' },
  tagline: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: '#A0D9C4', marginTop: spacing.xs },
  form: { backgroundColor: colors.white, borderRadius: radius.modal, padding: spacing.xl },
  label: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600, fontWeight: '600', marginBottom: 6 },
  input: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  registerLink: { marginTop: spacing.lg, alignItems: 'center' },
  registerText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600 },
  registerCta: { color: colors.primary, fontWeight: '600' },
});
