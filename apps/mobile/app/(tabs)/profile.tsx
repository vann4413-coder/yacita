import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, fontFamily, radius } from '@yacita/ui';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={styles.guestTitle}>¿Ya tienes cuenta?</Text>
        <Button label="Iniciar sesión" variant="primary" onPress={() => router.push('/auth/login')} style={{ marginTop: spacing.lg, width: '80%' }} />
        <Button label="Crear cuenta gratis" variant="outline" onPress={() => router.push('/auth/register')} style={{ marginTop: spacing.sm, width: '80%' }} />
      </SafeAreaView>
    );
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Menú */}
      <View style={styles.menu}>
        <MenuItem icon="calendar-outline" label="Mis reservas" onPress={() => router.push('/(tabs)/bookings')} />
        <MenuItem icon="notifications-outline" label="Notificaciones" onPress={() => {}} />
        <MenuItem icon="help-circle-outline" label="Ayuda y soporte" onPress={() => {}} />
        <MenuItem icon="document-text-outline" label="Términos y privacidad" onPress={() => {}} />
      </View>

      <Button label="Cerrar sesión" variant="outline" onPress={handleLogout} style={{ marginHorizontal: spacing.lg }} />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSoft },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  guestTitle: { fontFamily: fontFamily.heading, fontSize: fontSize.xl, color: colors.text, fontWeight: '700', marginTop: spacing.md },

  header: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.bgDark },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fontFamily.heading, fontSize: fontSize.xxl, color: colors.white, fontWeight: '700' },
  name: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: colors.white, fontWeight: '700', marginTop: spacing.md },
  email: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: '#A0D9C4', marginTop: 2 },

  menu: { backgroundColor: colors.white, marginTop: spacing.md, borderRadius: radius.card, marginHorizontal: spacing.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray200, gap: spacing.md },
  menuLabel: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.text, flex: 1 },
});
