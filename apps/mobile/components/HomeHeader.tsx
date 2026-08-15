import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, fontSize, fontFamily } from '@yacita/ui';
import type { ServiceType } from '@yacita/types';

const ALL = 'TODO';
type Filter = ServiceType | typeof ALL;

const LABELS: Record<Filter, string> = {
  TODO: 'Todo',
  FISIO: 'Fisio',
  MASAJE: 'Masaje',
  QUIRO: 'Quiro',
  OSTEO: 'Osteo',
};

interface HomeHeaderProps {
  selected: Filter;
  onChangeFilter: (v: Filter) => void;
  urgentOnly: boolean;
  onToggleUrgent: () => void;
  locationLabel?: string;
}

export function HomeHeader({
  selected,
  onChangeFilter,
  urgentOnly,
  onToggleUrgent,
  locationLabel,
}: HomeHeaderProps) {
  const filters: Filter[] = ['TODO', 'FISIO', 'MASAJE', 'QUIRO', 'OSTEO'];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {/* Fila logo + ubicación */}
      <View style={styles.topRow}>
        <Text style={styles.logo}>
          <Text style={styles.logoYa}>ya</Text>
          <Text style={styles.logoCita}>cita</Text>
        </Text>
        {locationLabel ? (
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>📍 {locationLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Chips: urgencia + filtros de servicio */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          onPress={onToggleUrgent}
          activeOpacity={0.8}
          style={[styles.chip, styles.chipUrgent, urgentOnly && styles.chipUrgentActive]}
        >
          <Text style={styles.chipUrgentText}>⚡ Ahora mismo</Text>
        </TouchableOpacity>

        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => onChangeFilter(f)}
            activeOpacity={0.7}
            style={[styles.chip, selected === f && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, selected === f && styles.chipLabelActive]}>
              {LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  logo: { fontFamily: fontFamily.heading, fontSize: 22, fontWeight: '800' },
  logoYa: { color: colors.primary },
  logoCita: { color: colors.cta },
  locationPill: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  chipsRow: {
    paddingHorizontal: spacing.md,
    gap: 8,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray600,
    fontWeight: '600',
  },
  chipLabelActive: { color: colors.white },
  chipUrgent: {
    backgroundColor: colors.flash,
    borderColor: colors.flash,
  },
  chipUrgentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUrgentText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
});
