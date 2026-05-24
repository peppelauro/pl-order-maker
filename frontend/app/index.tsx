import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/src/store/useStore';

export default function Index() {
  const router = useRouter();
  const { isLoggedIn } = useStore();

  useEffect(() => {
    // Wait a bit for storage to load
    const timeout = setTimeout(() => {
      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [isLoggedIn]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
