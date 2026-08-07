import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, fontSize, fontFamily } from '@yacita/ui';
import { formatDatetime, formatPriceShort } from '@yacita/utils';
import { useGap, useCreateBooking } from '../../../hooks/useGaps';
import { useAuthStore } from '../../../store/auth';
import { Button } from '../../../components/Button';

export default function ConfirmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [note, setNote] = useState('');
  const [acceptedRGPD, setAcceptedRGPD] = useState(false);

  const { data: gap } = useGap(id);
  const { mutateAsync: createBooking, isPending } = useCreateBooking();

  if (!gap) return null;

  async function handleConfirm() {
    if (!acceptedRGPD) {
      Alert.alert('Aviso', 'Debes aceptar la política de privacidad para continuar.');
      return;
    }
    try {
      await createBooking({ gapId: id, note: note.trim() || undefined });
      router.replace('/gap/confirmed');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo completar la reserva. Intenta de nuevo.';
      Alert.alert('Error', msg);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Resumen del hueco */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de tu reserva</Text>
          <Row label="Centro" value={gap.clinic.name} />
          <Row label="Dirección" value={gap.clinic.address} />
          <Row label="Servicio" value={`${gap.service} · ${gap.durationMins} min`} />
          <Row label="Fecha y hora" value={formatDatetime(gap.datetime)} />
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio Yacita</Text>
            <Text style={styles.price}>{formatPriceShort(gap.discountPrice)}</Text>
          </View>
          <Text style={styles.priceSub}>Precio original: {formatPriceShort(gap.stdPrice)}</Text>
        </View>

        {/* Datos del paciente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tus datos</Text>
          <Row label="Nombre" value={user?.name ?? ''} />
          <Row label="Email" value={user?.email ?? ''} />
        </View>

        {/* Nota opcional */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nota para el profesional (opcional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Ej: Tengo dolor lumbar desde hace una semana..."
            placeholderTextColor={colors.gray400}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.charCount}>{note.length}/500</Text>
        </View>

        {/* Aviso de pago */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            💳 El pago se realiza en el centro el día de la cita. Reservar es completamente gratuito.
          </Text>
        </View>

        {/* RGPD */}
        <TouchableOpacity
          style={styles.rgpdRow}
          onPress={() => setAcceptedRGPD(!acceptedRGPD)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, acceptedRGPD && styles.checkboxActive]}>
            {acceptedRGPD && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rgpdText}>
            He leído y acepto la{' '}
            <Text
              style={styles.rgpdLink}
              onPress={() => Linking.openURL('https://yacita.health/privacidad')}
            >
              Política de Privacidad
            </Text>
            {' '}de Yacita. Mis datos se usarán para gestionar esta reserva.
          </Text>
        </TouchableOpacity>

        {/* Política de cancelación */}
        <View style={styles.policy}>
          <Text style={styles.policyTitle}>Política de cancelación</Text>
          <Text style={styles.policyText}>
            Puedes cancelar tu reserva hasta 2 horas antes de la cita sin ningún coste.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer sticky */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          label="Confirmar reserva"
          variant="cta"
          fullWidth
          loading={isPending}
          onPress={handleConfirm}
          style={{ marginHorizontal: spacing.lg, marginVertical: spacing.sm, opacity: acceptedRGPD ? 1 : 0.6 }}
        />
      </SafeAreaView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bgSoft },
  content: { padding: spacing.md, gap: spacing.md },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  rowLabel: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray400, flex: 1 },
  rowValue: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },

  divider: { height: 1, backgroundColor: colors.gray200, marginVertical: spacing.md },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontFamily: fontFamily.heading, fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  price: { fontFamily: fontFamily.heading, fontSize: fontSize.xl, color: colors.cta, fontWeight: '700' },
  priceSub: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray400, marginTop: 2, textAlign: 'right' },

  input: {
    fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.text,
    backgroundColor: colors.bgSoft, borderRadius: radius.pill, padding: spacing.md,
    minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.gray400, textAlign: 'right', marginTop: 4 },

  notice: {
    backgroundColor: '#EAF9F3', borderRadius: radius.card, padding: spacing.md,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  noticeText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },

  rgpdRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.gray200, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '800' },
  rgpdText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600, flex: 1, lineHeight: 20 },
  rgpdLink: { color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' },

  policy: { padding: spacing.sm },
  policyTitle: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray600, fontWeight: '600', marginBottom: 4 },
  policyText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.gray400, lineHeight: 20 },

  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
});
