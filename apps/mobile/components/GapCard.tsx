import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors, radius, spacing, fontSize, fontFamily, shadow } from '@yacita/ui';
import { formatPriceShort, formatShortDate, formatDistance, isUrgent } from '@yacita/utils';
import type { GapWithClinic } from '@yacita/types';

interface GapCardProps {
  gap: GapWithClinic;
}

function useCountdown(targetDate: string | Date) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Caducado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setTimeLeft(`${h}h ${String(m).padStart(2,'0')}m`);
      else setTimeLeft(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function GapCard({ gap }: GapCardProps) {
  const router = useRouter();
  const urgent = isUrgent(gap.datetime);
  const photo = gap.clinic.photos[0];
  const countdown = useCountdown(gap.datetime);
  const savings = gap.stdPrice - gap.discountPrice;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, urgent && styles.cardUrgent]}
      onPress={() => router.push(`/gap/${gap.id}`)}
    >
      {/* Foto */}
      <View style={styles.imageWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderInitial}>
              {gap.clinic.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {urgent && (
          <View style={styles.urgentOverlay}>
            <View style={styles.urgentTag}>
              <Text style={styles.urgentTagText}>⚡ Última plaza</Text>
            </View>
          </View>
        )}
      </View>

      {/* Contenido */}
      <View style={styles.body}>

        {/* Contador urgencia */}
        {urgent && (
          <View style={styles.countdownRow}>
            <Text style={styles.countdownLabel}>🕐 Caduca en </Text>
            <Text style={styles.countdownTime}>{countdown}</Text>
          </View>
        )}

        {/* Header: clínica + distancia */}
        <View style={styles.row}>
          <Text style={styles.clinicName} numberOfLines={1}>{gap.clinic.name}</Text>
          {gap.distanceKm !== undefined && (
            <Text style={styles.distance}>{formatDistance(gap.distanceKm)}</Text>
          )}
        </View>

        {/* Hora + servicio */}
        <Text style={styles.datetime}>{formatShortDate(gap.datetime)}</Text>
        <Text style={styles.service}>{gap.service} · {gap.durationMins} min</Text>

        {/* PRECIO PROTAGONISTA */}
        <View style={styles.priceRow}>
          <Text style={styles.priceNow}>{formatPriceShort(gap.discountPrice)}</Text>
          <View style={styles.priceDetail}>
            <Text style={styles.priceWasLabel}>ANTES</Text>
            <Text style={styles.priceWas}>{formatPriceShort(gap.stdPrice)}</Text>
          </View>
          {savings > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Ahorras {formatPriceShort(savings)}</Text>
            </View>
          )}
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
  cardUrgent: {
    borderWidth: 1.5,
    borderColor: colors.flash,
    backgroundColor: '#FFFDF5',
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 150 },
  imagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInitial: {
    fontSize: 48,
    fontFamily: fontFamily.heading,
    fontWeight: '800',
    color: colors.white,
  },
  urgentOverlay: { position: 'absolute', bottom: 8, left: 8 },
  urgentTag: {
    backgroundColor: colors.flash,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentTagText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },

  body: { padding: spacing.md },

  countdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  countdownLabel: { fontFamily: fontFamily.body, fontSize: 11, color: colors.gray400 },
  countdownTime: { fontFamily: fontFamily.body, fontSize: 11, fontWeight: '700', color: colors.cta },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },

  clinicName: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  distance: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
  },
  datetime: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  service: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  priceNow: {
    fontFamily: fontFamily.heading,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 24,
  },
  priceDetail: { flexDirection: 'column' },
  priceWasLabel: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    color: colors.gray400,
    lineHeight: 11,
  },
  priceWas: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray400,
    textDecorationLine: 'line-through',
    lineHeight: 14,
  },
  savingsBadge: {
    backgroundColor: 'rgba(244,126,54,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  savingsText: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    fontWeight: '700',
    color: colors.cta,
  },
});
