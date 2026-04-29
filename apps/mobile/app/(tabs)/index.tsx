import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

import { colors, spacing, fontSize, fontFamily } from '@yacita/ui';
import { useGaps } from '../../hooks/useGaps';
import { GapCard } from '../../components/GapCard';
import { ServiceFilterBar } from '../../components/ServiceChip';
import type { ServiceType } from '@yacita/types';

type Filter = ServiceType | 'TODO';

export default function HomeScreen() {
  const [filter, setFilter] = useState<Filter>('TODO');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Pedir permisos de ubicación al entrar en la pantalla
  useFocusEffect(
    useCallback(() => {
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          );
        }
      });
    }, []),
  );

  const { data, isLoading, isRefetching, refetch, isFetchingNextPage } = useGaps({
    ...coords,
    type: filter === 'TODO' ? undefined : filter,
    limit: 20,
  });

  const gaps = data?.data ?? [];

  return (
    <View style={styles.container}>
      <ServiceFilterBar selected={filter} onChange={setFilter} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : gaps.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Sin huecos disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Prueba a cambiar el filtro o ampliar el radio de búsqueda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={gaps}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => <GapCard gap={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSoft },
  list: { paddingTop: spacing.sm, paddingBottom: 100 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
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
