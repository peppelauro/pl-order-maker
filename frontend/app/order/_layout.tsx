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
          title: 'Select Customer',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="select-pos"
        options={{
          title: 'Select Location',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="add-products"
        options={{
          title: 'Add Products',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'Review Order',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
