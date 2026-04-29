import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, fontFamily } from '@yacita/ui';

type Variant = 'urgent' | 'discount' | 'service' | 'status';

interface BadgeProps {
  label: string;
  variant?: Variant;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  urgent:   { bg: colors.cta,     text: colors.white },
  discount: { bg: colors.primary, text: colors.white },
  service:  { bg: colors.bgSoft,  text: colors.primary },
  status:   { bg: colors.gray200, text: colors.gray600 },
};

export function Badge({ label, variant = 'status' }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.pill, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
