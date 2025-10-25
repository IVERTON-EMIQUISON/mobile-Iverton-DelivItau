
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#FF6B35" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Detalhes do Produto' }} />
          <Stack.Screen name="restaurants/[id]" options={{ title: 'Restaurante' }} />
          <Stack.Screen name="admin/products" options={{ title: 'Gerenciar Produtos' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
    </AuthProvider>
  );
}
