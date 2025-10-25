// app/admin/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useAuth } from '../../src/context/AuthContext';
import { router, useNavigation } from 'expo-router';

export default function AdminLoginScreen() {
  const [key, setKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();
   // 🔹 Oculta o header duplicado
  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const handleLogin = async () => {
    const success = await login(key);
    if (success) {
      router.replace('/admin/products');
    } else {
      Alert.alert('Erro', 'Chave secreta incorreta.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png' }}
        style={styles.logo}
      />

      <Text style={styles.title}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Acesso restrito aos administradores</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Digite a chave secreta"
          placeholderTextColor="#aaa"
          value={key}
          onChangeText={setKey}
          secureTextEntry={!showPassword}
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((s) => !s)}
          accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !key && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={!key}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>© 2025 DelivItau • Administração</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // wrapper que envolve o TextInput para posicionar o ícone dentro
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },

  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 48, // espaço para o ícone
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12, // centraliza verticalmente em height 48
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    width: '100%',
    backgroundColor: '#FF7F50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: '#aaa',
  },
});
