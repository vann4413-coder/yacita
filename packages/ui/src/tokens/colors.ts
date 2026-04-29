export const colors = {
  primary: '#1D9E75',
  cta: '#D85A30',
  text: '#064033',
  bgSoft: '#E8F8F2',
  bgDark: '#064033',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
} as const;

export type ColorKey = keyof typeof colors;
