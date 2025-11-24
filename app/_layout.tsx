import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// 1. IMPORTANTE: Importe os contextos
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { OrdersProvider } from '../src/context/OrdersContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    // 2. A ORDEM É CRUCIAL: Auth > Cart > Orders > Query
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
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
                <Stack.Screen name="restaurants/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="admin" options={{ headerShown: false }} />
              </Stack>

            </SafeAreaProvider>
          </QueryClientProvider>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}