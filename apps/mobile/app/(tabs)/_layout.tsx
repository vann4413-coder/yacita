import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@yacita/ui';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconsName)}
      size={24}
      color={focused ? colors.primary : colors.gray400}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray200,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
        },
        headerStyle: { backgroundColor: colors.bgDark },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: 'PlusJakartaSans-SemiBold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Huecos',
          tabBarIcon: ({ focused }) => <TabIcon name="flash" focused={focused} />,
          headerTitle: 'Yacita',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
          headerTitle: 'Mis reservas',
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
