import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, fontSize, fontFamily, radius } from '@yacita/ui';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email || !password) {
      Alert.alert('Faltan datos', 'Rellena todos los campos.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Contraseña corta', 'Debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      router.replace('/(tabs)/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo crear la cuenta.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>Yacita</Text>
            <Text style={styles.tagline}>Crea tu cuenta gratis</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={colors.gray400} autoComplete="name" />

            <Text style={[styles.label, { marginTop: spacing.md }]}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor={colors.gray400} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

            <Text style={[styles.label, { marginTop: spacing.md }]}>Contraseña</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mín. 8 caracteres" placeholderTextColor={colors.gray400} secureTextEntry autoComplete="new-password" />

            <Text style={styles.hint}>Al registrarte aceptas los Términos de uso y la Política de privacidad de Yacita.</Text>

            <Button label="Crear cuenta" variant="primary" fullWidth loading={loading} onPress={handleRegister} style={{ marginTop: spacing.lg }} />

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginCta}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDark },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontFamily: fontFamily.heading, fontSize: fontSize.display, color: colors.white, fontWeight: '800' },
  tagline: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: '#A0D9C4', marginTop: spacing.xs },
  form: { backgroundColor: colors.white, borderRadius: radius.modal, padding: spacing.xl },
  label: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600, fontWeight: '600', marginBottom: 6 },
  input: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.text, backgroundColor: colors.bgSoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 12, borderWidth: 1, borderColor: colors.gray200 },
  hint: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.gray400, marginTop: spacing.md, lineHeight: 18 },
  loginLink: { marginTop: spacing.lg, alignItems: 'center' },
  loginText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600 },
  loginCta: { color: colors.primary, fontWeight: '600' },
});
