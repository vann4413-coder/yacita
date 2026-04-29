import { View, Text, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, spacing, fontSize, fontFamily, radius } from '@yacita/ui';
import { Button } from '../../components/Button';

export default function ConfirmedScreen() {
  const router = useRouter();

  async function handleShare() {
    await Share.share({
      message: 'Acabo de reservar una cita con descuento en Yacita. ¡Descárgalo en yacita.es!',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        {/* Check animado */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkEmoji}>✓</Text>
        </View>

        <Text style={styles.title}>¡Reserva confirmada!</Text>
        <Text style={styles.subtitle}>
          Recibirás un recordatorio 1 hora antes de tu cita. El pago se realiza directamente en el
          centro.
        </Text>

        <View style={styles.actions}>
          <Button
            label="Ver mis reservas"
            variant="primary"
            fullWidth
            onPress={() => router.replace('/(tabs)/bookings')}
          />
          <Button
            label="Compartir"
            variant="outline"
            fullWidth
            onPress={handleShare}
            style={{ marginTop: spacing.sm }}
          />
          <Button
            label="Buscar más huecos"
            variant="ghost"
            fullWidth
            onPress={() => router.replace('/(tabs)/')}
            style={{ marginTop: spacing.xs }}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSoft,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  checkEmoji: {
    fontSize: 48,
    color: colors.white,
    fontWeight: '700',
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  actions: { width: '100%' },
});
