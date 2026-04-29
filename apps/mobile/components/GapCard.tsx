import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, fontSize, fontFamily, shadow } from '@yacita/ui';
import { formatPriceShort, formatShortDate, formatDistance, isUrgent } from '@yacita/utils';
import { Badge } from './Badge';
import type { GapWithClinic } from '@yacita/types';

interface GapCardProps {
  gap: GapWithClinic;
}

export function GapCard({ gap }: GapCardProps) {
  const router = useRouter();
  const urgent = isUrgent(gap.datetime);
  const photo = gap.clinic.photos[0];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => router.push(`/gap/${gap.id}`)}
    >
      {/* Foto */}
      <View style={styles.imageWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderEmoji}>🏥</Text>
          </View>
        )}
        {/* Badge urgente sobre la foto */}
        {urgent && (
          <View style={styles.urgentOverlay}>
            <Badge label={formatShortDate(gap.datetime)} variant="urgent" />
          </View>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.body}>
        {/* Header */}
        <View style={styles.row}>
          <Text style={styles.clinicName} numberOfLines={1}>{gap.clinic.name}</Text>
          {gap.distanceKm !== undefined && (
            <Text style={styles.distance}>A {formatDistance(gap.distanceKm)}</Text>
          )}
        </View>

        {/* Servicio + duración */}
        <Text style={styles.service}>
          {gap.service} · {gap.durationMins} min
        </Text>

        {/* Fecha (si no es urgente ya se muestra abajo) */}
        {!urgent && (
          <Text style={styles.datetime}>{formatShortDate(gap.datetime)}</Text>
        )}

        {/* Footer: precio + descuento */}
        <View style={[styles.row, styles.priceRow]}>
          <View style={styles.priceBlock}>
            <Text style={styles.stdPrice}>{formatPriceShort(gap.stdPrice)}</Text>
            <Text style={styles.discountPrice}>{formatPriceShort(gap.discountPrice)}</Text>
          </View>
          <Badge label={`-${gap.discountPct}%`} variant="discount" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.md,
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 160 },
  imagePlaceholder: {
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 48 },
  urgentOverlay: { position: 'absolute', bottom: 8, left: 8 },

  body: { padding: spacing.md },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceRow: { marginTop: spacing.sm },

  clinicName: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  distance: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
  },
  service: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: 4,
  },
  datetime: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stdPrice: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    color: colors.cta,
    fontWeight: '700',
  },
});
