import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { colors, radius, spacing, fontSize, fontFamily, shadow } from '@yacita/ui';
import { formatDatetime, formatPriceShort, calcDiscountPct, calcSavings, formatDistance } from '@yacita/utils';
import { useGap } from '../../hooks/useGaps';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/auth';

const { width: SCREEN_W } = Dimensions.get('window');

export default function GapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: gap, isLoading, isError } = useGap(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !gap) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar el hueco.</Text>
      </View>
    );
  }

  const photos = gap.clinic.photos.length ? gap.clinic.photos : [null];
  const discountPct = calcDiscountPct(gap.stdPrice, gap.discountPrice);
  const savings = calcSavings(gap.stdPrice, gap.discountPrice);

  function handleReservar() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/gap/${id}/confirm`);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Galería */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
          }
        >
          {photos.map((photo, i) =>
            photo ? (
              <Image key={i} source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View key={i} style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={{ fontSize: 64 }}>🏥</Text>
              </View>
            ),
          )}
        </ScrollView>

        {/* Indicadores de foto */}
        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === photoIdx && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.body}>
          {/* Servicio chip */}
          <Badge label={gap.service} variant="service" />

          {/* Nombre clínica */}
          <Text style={styles.clinicName}>{gap.clinic.name}</Text>
          <Text style={styles.address}>{gap.clinic.address}</Text>
          {'distanceKm' in gap && typeof gap.distanceKm === 'number' && (
            <Text style={styles.distance}>A {formatDistance(gap.distanceKm)}</Text>
          )}

          {/* Separador */}
          <View style={styles.divider} />

          {/* Fecha y duración */}
          <Text style={styles.sectionLabel}>Horario</Text>
          <Text style={styles.datetime}>{formatDatetime(gap.datetime)}</Text>
          <Text style={styles.duration}>{gap.durationMins} minutos</Text>

          <View style={styles.divider} />

          {/* Precio */}
          <Text style={styles.sectionLabel}>Precio</Text>
          <View style={styles.priceRow}>
            <Text style={styles.stdPrice}>{formatPriceShort(gap.stdPrice)}</Text>
            <Text style={styles.discountPrice}>{formatPriceShort(gap.discountPrice)}</Text>
            <Badge label={`-${discountPct}%`} variant="discount" />
          </View>
          <Text style={styles.savings}>
            Ahorras {formatPriceShort(savings)} — {discountPct}% de descuento
          </Text>

          <View style={styles.divider} />

          {/* Plazas */}
          <Text style={styles.sectionLabel}>Disponibilidad</Text>
          <Text style={styles.spots}>
            {'spotsLeft' in gap ? gap.spotsLeft : gap.maxBookings} plaza
            {('spotsLeft' in gap ? gap.spotsLeft : gap.maxBookings) !== 1 ? 's' : ''} disponible
            {('spotsLeft' in gap ? gap.spotsLeft : gap.maxBookings) !== 1 ? 's' : ''}
          </Text>

          <View style={styles.divider} />

          {/* Aviso pago */}
          <View style={styles.payNotice}>
            <Text style={styles.payNoticeText}>
              💳 El pago se realiza en el centro el día de la cita. Reservar es gratuito.
            </Text>
          </View>
        </View>

        {/* Espaciado para el footer sticky */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer sticky: botón reservar */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.footerPrice}>{formatPriceShort(gap.discountPrice)}</Text>
            <Text style={styles.footerOriginal}>{formatPriceShort(gap.stdPrice)}</Text>
          </View>
          <Button
            label="Reservar ahora"
            variant="cta"
            onPress={handleReservar}
            disabled={gap.status !== 'AVAILABLE'}
            style={{ flex: 1, marginLeft: spacing.md }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bgSoft },
  content: { paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray400, fontFamily: fontFamily.body, fontSize: fontSize.base },

  photo: { width: SCREEN_W, height: 280 },
  photoPlaceholder: { backgroundColor: colors.bgSoft, alignItems: 'center', justifyContent: 'center' },

  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gray200 },
  dotActive: { backgroundColor: colors.primary },

  body: { padding: spacing.lg },

  clinicName: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  address: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray600,
    marginTop: 2,
  },
  distance: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: 2,
  },

  divider: { height: 1, backgroundColor: colors.gray200, marginVertical: spacing.md },

  sectionLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  datetime: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  duration: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray600,
    marginTop: 2,
  },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  stdPrice: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray400,
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    color: colors.cta,
    fontWeight: '700',
  },
  savings: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },

  spots: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray600,
  },

  payNotice: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.card,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  payNoticeText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },

  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    ...shadow.md,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footerPrice: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    color: colors.cta,
    fontWeight: '700',
  },
  footerOriginal: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
    textDecorationLine: 'line-through',
  },
});
