import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { colors, spacing, fontSize, fontFamily, radius, shadow } from '@yacita/ui';
import { formatDatetime, formatPriceShort } from '@yacita/utils';
import { useMyBookings } from '../../hooks/useGaps';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
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
  const { data, isLoading, refetch } = useMyBookings();

  const [reviewModal, setReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitReview() {
    if (!selectedBooking) return;
    setSubmitting(true);
    try {
      await api.patch(`/bookings/${selectedBooking.id}/review`, { rating, review });
      Alert.alert('¡Gracias!', 'Tu valoración ha sido enviada.');
      setReviewModal(false);
      setReview('');
      setRating(5);
      refetch();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la valoración. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function canReview(b: BookingWithDetails & { rating?: number }) {
    if (b.status !== 'COMPLETED') return false;
    if (b.rating) return false;
    return true;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>Inicia sesión para ver tus reservas</Text>
        <Button label="Iniciar sesión" variant="primary" onPress={() => router.push('/auth/login')} style={{ marginTop: spacing.lg }} />
      </SafeAreaView>
    );
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const bookings: (BookingWithDetails & { rating?: number; review?: string })[] = data?.data ?? [];

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
    <>
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

            {b.rating ? (
              <Text style={styles.ratingDone}>{'★'.repeat(b.rating)} Valorado</Text>
            ) : canReview(b) ? (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => { setSelectedBooking(b); setReviewModal(true); }}
              >
                <Text style={styles.reviewBtnText}>⭐ Valorar experiencia</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        )}
      />

      <Modal visible={reviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Valorar experiencia</Text>
            <Text style={styles.modalSubtitle}>{selectedBooking?.gap.clinic.name}</Text>

            <Text style={styles.ratingLabel}>Puntuación</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={[styles.star, { color: s <= rating ? '#f5a623' : colors.gray400 }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>Comentario (opcional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Cuéntanos tu experiencia..."
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
            />

            <Button
              label={submitting ? 'Enviando...' : 'Enviar valoración'}
              variant="primary"
              onPress={handleSubmitReview}
              style={{ marginTop: spacing.md }}
            />
            <Button
              label="Cancelar"
              variant="outline"
              onPress={() => setReviewModal(false)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>
    </>
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
  reviewBtn: { marginTop: spacing.sm, backgroundColor: '#FFF8E7', borderRadius: radius.pill, padding: spacing.sm, alignItems: 'center' },
  reviewBtnText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: '#f5a623', fontWeight: '700' },
  ratingDone: { marginTop: spacing.sm, fontFamily: fontFamily.body, fontSize: fontSize.sm, color: '#f5a623', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl },
  modalTitle: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginBottom: 4 },
  modalSubtitle: { fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.gray400, marginBottom: spacing.lg },
  ratingLabel: { fontFamily: fontFamily.body, fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  starsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  star: { fontSize: 36 },
  textInput: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.card, padding: spacing.md, fontFamily: fontFamily.body, fontSize: fontSize.base, minHeight: 80, textAlignVertical: 'top' },
});
