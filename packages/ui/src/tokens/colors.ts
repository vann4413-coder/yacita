export const colors = {
  primary:   '#1B4332',
  turquoise: '#79C8C5',
  cta:       '#F47E36',
  flash:     '#FFD166',
  text:      '#1B4332',
  bgSoft:    '#F7F7F7',
  bgDark:    '#1B4332',
  white:     '#FFFFFF',
  gray100:   '#F7F7F7',
  gray200:   '#E5E7EB',
  gray400:   '#9CA3AF',
  gray600:   '#4B5563',
  error:     '#EF4444',
  success:   '#22C55E',
  warning:   '#FFD166',
} as const;

export type ColorKey = keyof typeof colors;
