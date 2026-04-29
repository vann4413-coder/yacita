import { TouchableOpacity, Text, StyleSheet, ScrollView, View } from 'react-native';
import { colors, radius, fontSize, fontFamily, spacing } from '@yacita/ui';
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

interface ServiceFilterBarProps {
  selected: Filter;
  onChange: (v: Filter) => void;
}

export function ServiceFilterBar({ selected, onChange }: ServiceFilterBarProps) {
  const filters: Filter[] = ['TODO', 'FISIO', 'MASAJE', 'QUIRO', 'OSTEO'];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {filters.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onChange(f)}
          activeOpacity={0.7}
          style={[styles.chip, selected === f && styles.chipActive]}
        >
          <Text style={[styles.label, selected === f && styles.labelActive]}>{LABELS[f]}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: 8, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.gray600,
    fontWeight: '500',
  },
  labelActive: { color: colors.white },
});
