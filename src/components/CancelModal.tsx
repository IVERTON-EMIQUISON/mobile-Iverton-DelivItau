import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CancelModal({ visible, onCancel, onConfirm }: Props) {
  // Usamos useRef para que o valor da animação não resete a cada render
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Ao abrir: Animação de entrada
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6, // Efeito de "mola" suave
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.box, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Cancelar Pedido</Text>

          <Text style={styles.message}>
            Tem certeza que deseja cancelar?{"\n"}
            Essa ação não pode ser desfeita.
          </Text>

          {/* Botões */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDelete} onPress={onConfirm}>
              <Text style={styles.btnDeleteText}>Sim, Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)', // Fundo escuro transparente
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: '800', // Fonte bem grossa
    color: '#1a1a1a',
    marginBottom: 8
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 22
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  btnCancelText: {
    fontSize: 16,
    color: "#555",
    fontWeight: '700'
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#FFEBEE",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  btnDeleteText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: '700'
  }
});