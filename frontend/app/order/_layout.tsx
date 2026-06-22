import { Stack } from 'expo-router';

export default function OrderLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="select-customer"
        options={{
          title: 'Seleziona Cliente',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="select-pos"
        options={{
          title: 'Seleziona Ubicazione',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="add-products"
        options={{
          title: 'Aggiungi Prodotti',
          headerBackTitle: 'Indietro',
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'Rivedi Ordine',
          headerBackTitle: 'Indietro',
        }}
      />
    </Stack>
  );
}
