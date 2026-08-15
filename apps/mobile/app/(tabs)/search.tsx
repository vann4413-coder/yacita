import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, fontSize, fontFamily } from '@yacita/ui';
import { useGaps } from '../../hooks/useGaps';
import { GapCard } from '../../components/GapCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useGaps({ limit: 30 });

  const gaps = (data?.data ?? []).filter(
    (g: { clinic: { name: string }; service: string }) =>
      !query.trim() ||
      g.clinic.name.toLowerCase().includes(query.toLowerCase()) ||
      g.service.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray400} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar profesional, clínica o servicio…"
          placeholderTextColor={colors.gray400}
          autoFocus
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !query.trim() ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Busca tu próxima cita</Text>
          <Text style={styles.emptySubtitle}>
            Escribe el nombre de un profesional, una clínica o un servicio.
          </Text>
        </View>
      ) : gaps.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>Prueba con otro término de búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          data={gaps}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => <GapCard gap={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSoft },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text,
    padding: 0,
  },
  list: { paddingTop: spacing.sm, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.gray400,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
