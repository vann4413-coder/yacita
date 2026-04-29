import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, fontSize, fontFamily, radius, shadow } from '@yacita/ui';
import { formatDatetime, formatPriceShort } from '@yacita/utils';
import { useMyBookings } from '../../hooks/useGaps';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/Button';
import type { BookingWithDetails } from '@yacita/types';

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};
const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: colors.primary,
  CANCELLED: colors.gray400,
  COMPLETED: colors.cta,
};

export default function BookingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyBookings();

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>Inicia sesión para ver tus reservas</Text>
        <Button label="Iniciar sesión" variant="primary" onPress={() => router.push('/auth/login')} style={{ marginTop: spacing.lg }} />
      </SafeAreaView>
    );
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const bookings: BookingWithDetails[] = data?.data ?? [];

  if (bookings.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 48 }}>📅</Text>
        <Text style={styles.emptyTitle}>Sin reservas aún</Text>
        <Text style={styles.emptySubtitle}>Encuentra huecos disponibles cerca de ti.</Text>
        <Button label="Buscar huecos" variant="primary" onPress={() => router.push('/(tabs)/')} style={{ marginTop: spacing.lg }} />
      </SafeAreaView>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(b) => b.id}
      contentContainerStyle={styles.list}
      renderItem={({ item: b }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/gap/${b.gapId}`)}>
          <View style={styles.cardHeader}>
            <Text style={styles.clinicName}>{b.gap.clinic.name}</Text>
            <Text style={[styles.status, { color: STATUS_COLOR[b.status] ?? colors.gray400 }]}>
              {STATUS_LABEL[b.status] ?? b.status}
            </Text>
          </View>
          <Text style={styles.service}>{b.gap.service} · {b.gap.durationMins} min</Text>
          {b.gap.datetime && <Text style={styles.datetime}>{formatDatetime(b.gap.datetime)}</Text>}
          <Text style={styles.price}>{formatPriceShort(b.gap.discountPrice)}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: colors.text, fontWeight: '700', marginTop: spacing.md, textAlign: 'center' },
  emptySubtitle: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.gray400, textAlign: 'center', marginTop: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.md, ...shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  clinicName: { fontFamily: fontFamily.heading, fontSize: fontSize.md, color: colors.text, fontWeight: '600', flex: 1 },
  status: { fontFamily: fontFamily.body, fontSize: fontSize.sm, fontWeight: '600' },
  service: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600 },
  datetime: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.primary, marginTop: 2, fontWeight: '500' },
  price: { fontFamily: fontFamily.heading, fontSize: fontSize.md, color: colors.cta, fontWeight: '700', marginTop: spacing.sm },
});
