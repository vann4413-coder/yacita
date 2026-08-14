import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7', padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1B4332' }}>Yacita</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 12, textAlign: 'center' }}>
        Si ves esta pantalla, la app arranca correctamente.
      </Text>
    </View>
  );
}
