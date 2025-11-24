import React, { useState } from 'react';
// Lembre-se de adicionar o 'Stack' nas importações
import { Stack } from 'expo-router'; 
// ...
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; 
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../src/hooks/useProducts';
import { useRestaurants } from '../../src/hooks/useRestaurants';
import { Picker } from '@react-native-picker/picker';
// 1. Importe o ImagePicker
import * as ImagePicker from 'expo-image-picker';

export default function AdminProductsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    restaurantId: '',
    estoque: '',
  });

  const { data: products, isLoading, refetch } = useAllProducts();
  const { data: restaurants } = useRestaurants();
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const categories = ['Hambúrguer', 'Pizza', 'Açaí', 'Doces', 'Bebidas'];

  // 2. Função para escolher imagem da galeria
  const pickImage = async () => {
    // Pede permissão e abre a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3, // Mantenha baixo (0.3 a 0.5) para não estourar o limite do DynamoDB
      base64: true, // Importante: converte a imagem para texto
    });

    if (!result.canceled) {
      // Cria o texto base64 pronto para usar
      const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFormData({ ...formData, image: imageUri });
    }
  };

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        restaurantId: product.restaurantId,
        estoque: product.estoque !== undefined ? product.estoque.toString() : '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0],
        image: '',
        restaurantId: restaurants?.[0]?.id || '', 
        estoque: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      restaurantId: '',
      estoque: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.restaurantId) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Usa uma imagem padrão se o usuário não escolher nenhuma
    const defaultImage = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300';

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || defaultImage,
      restaurantId: formData.restaurantId,
      estoque: parseInt(formData.estoque) || 0,
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, ...productData });
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await createProductMutation.mutateAsync(productData);
        Alert.alert('Sucesso', 'Produto criado!');
      }
      closeModal();
      refetch();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar. A imagem pode ser muito grande.');
    }
  };

  const handleDelete = (product: any) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductMutation.mutateAsync(product); 
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
              refetch();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir produto');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>R$ {(item.price || 0).toFixed(2)}</Text>
        <Text style={styles.productStock}>
            Estoque: {item.estoque !== undefined ? item.estoque : 0}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openModal(item)}
        >
          <Ionicons name="pencil" size={20} color="#4ECDC4" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
     <Stack.Screen options={{ headerShown: false }} />    
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
             <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produtos ({products?.length || 0})</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptySubtitle}>
              Adicione produtos para começar a vender
            </Text>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Restaurante *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.restaurantId}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, restaurantId: itemValue })
                  }
                  style={{ marginVertical: -8 }}
                >
                  <Picker.Item label="Selecione um restaurante..." value="" enabled={false} />
                  {restaurants?.map((restaurant) => (
                    <Picker.Item
                      key={restaurant.id}
                      label={restaurant.name}
                      value={restaurant.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nome do produto"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Descrição do produto"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preço *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0,00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantidade em Estoque</Text>
              <TextInput
                style={styles.textInput}
                value={formData.estoque}
                onChangeText={(text) => setFormData({ ...formData, estoque: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        formData.category === category && styles.categoryButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.category === category && styles.categoryButtonTextActive
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 3. NOVO CAMPO DE IMAGEM (BOTÃO) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Imagem do Produto</Text>
              
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#666" />
                <Text style={styles.imagePickerText}>Escolher da Galeria</Text>
              </TouchableOpacity>

              {/* Se já tiver imagem escolhida ou colada, mostra aqui */}
              {formData.image ? (
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
              ) : null}
              
              {/* Campo de texto opcional se ainda quiser colar link */}
              <TextInput
                style={[styles.textInput, { marginTop: 10, fontSize: 12, color: '#999' }]}
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
                placeholder="Ou cole uma URL aqui..."
              />
            </View>

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 40, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 16,
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#FF6B35',
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productStock: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  editButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
  },
  categoryButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  // 4. Estilo do novo botão
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
  },
});