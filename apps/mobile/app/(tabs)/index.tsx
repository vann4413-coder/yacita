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
import { HomeHeader } from '../../components/HomeHeader';
import type { ServiceType } from '@yacita/types';

type Filter = ServiceType | 'TODO';

export default function HomeScreen() {
  const [filter, setFilter] = useState<Filter>('TODO');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
            async (pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              try {
                const places = await Location.reverseGeocodeAsync({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                });
                const place = places[0];
                if (place) setLocationLabel(place.district || place.city || place.region);
              } catch {
                // sin etiqueta si falla el reverse geocode
              }
            },
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

  let gaps = data?.data ?? [];
  if (urgentOnly) {
    gaps = gaps.filter((g: { datetime: string }) => {
      const diffMs = new Date(g.datetime).getTime() - Date.now();
      return diffMs > 0 && diffMs < 4 * 60 * 60 * 1000; // próximas 4h
    });
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        selected={filter}
        onChangeFilter={setFilter}
        urgentOnly={urgentOnly}
        onToggleUrgent={() => setUrgentOnly((v) => !v)}
        locationLabel={locationLabel}
      />

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
          renderItem={({ item, index }) => (
            <>
              {index === 0 && (
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionTitle}>Acaban de liberarse</Text>
                  </View>
                  <Text style={styles.sectionCount}>{gaps.length} cerca de ti</Text>
                </View>
              )}
              <GapCard gap={item} />
            </>
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.turquoise,
  },
  sectionTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '800',
  },
  sectionCount: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.gray400,
  },
});
