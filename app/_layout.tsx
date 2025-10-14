
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
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
          <Stack.Screen name="restaurant/[id]" options={{ title: 'Restaurante' }} />
          <Stack.Screen name="admin/products" options={{ title: 'Gerenciar Produtos' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
