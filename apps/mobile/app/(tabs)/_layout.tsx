import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@yacita/ui';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as IoniconsName)}
        size={22}
        color={focused ? colors.primary : colors.gray400}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#F0F9F7',
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: '#F0F0F0',
          height: 70,
          paddingBottom: 12,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        headerStyle: { backgroundColor: colors.bgDark },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: 'PlusJakartaSans-SemiBold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          headerTitle: 'Yacita',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Mis citas',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
          headerTitle: 'Mis citas',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
          headerTitle: 'Mi perfil',
        }}
      />
    </Tabs>
  );
}
