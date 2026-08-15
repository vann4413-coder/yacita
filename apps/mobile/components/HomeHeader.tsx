import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  searchValue: string;
  onChangeSearch: (v: string) => void;
}

export function HomeHeader({
  selected,
  onChangeFilter,
  urgentOnly,
  onToggleUrgent,
  locationLabel,
  searchValue,
  onChangeSearch,
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
        <View style={styles.locationPill}>
          <Text style={styles.locationText}>📍 {locationLabel ?? 'Ubicación'}</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.gray400} />
        <TextInput
          style={styles.searchInput}
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Buscar profesional o servicio…"
          placeholderTextColor={colors.gray400}
        />
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
          <Text style={[styles.chipUrgentText, urgentOnly && styles.chipUrgentTextActive]}>
            ⚡ Ahora mismo
          </Text>
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
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  logo: { fontFamily: fontFamily.heading, fontSize: 24, fontWeight: '800' },
  logoYa: { color: colors.primary },
  logoCita: { color: colors.cta },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  locationText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    marginHorizontal: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text,
    padding: 0,
  },

  chipsRow: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  chipUrgentTextActive: { color: colors.white },
});
