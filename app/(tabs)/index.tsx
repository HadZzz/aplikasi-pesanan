import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOrderStore } from '../../store/orderStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function NewOrderScreen() {
  const router = useRouter();
  const addOrder = useOrderStore((state) => state.addOrder);
  const [showDatePicker, setShowDatePicker] = useState<'orderDate' | 'deadline' | null>(null);
  const [order, setOrder] = useState({
    customerName: '',
    phoneNumber: '',
    orderDetails: '',
    quantity: '',
    pricePerItem: '',
    notes: '',
    orderDate: new Date(),
    deadline: new Date(),
    materials: [{ name: '', quantity: '', unit: '' }],
  });

  const handleAddMaterial = () => {
    setOrder({
      ...order,
      materials: [...order.materials, { name: '', quantity: '', unit: '' }],
    });
  };

  const handleUpdateMaterial = (index: number, field: string, value: string) => {
    const updatedMaterials = order.materials.map((material, i) => {
      if (i === index) {
        return { ...material, [field]: value };
      }
      return material;
    });
    setOrder({ ...order, materials: updatedMaterials });
  };

  const handleRemoveMaterial = (index: number) => {
    setOrder({
      ...order,
      materials: order.materials.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!order.customerName || !order.orderDetails || !order.quantity || !order.pricePerItem) {
      Alert.alert('Error', 'Mohon lengkapi data pesanan');
      return;
    }

    console.log('Materials before validation:', order.materials);

    const validMaterials = order.materials.filter(material => {
      const isNameValid = material.name && material.name.trim().length > 0;
      const isQuantityValid = material.quantity && String(material.quantity).trim().length > 0;
      const isUnitValid = material.unit && material.unit.trim().length > 0;
      
      console.log('Material validation:', {
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        isNameValid,
        isQuantityValid,
        isUnitValid
      });

      return isNameValid && isQuantityValid && isUnitValid;
    });

    console.log('Valid materials:', validMaterials);

    if (validMaterials.length === 0) {
      Alert.alert('Error', 'Mohon tambahkan minimal satu material dengan nama, jumlah, dan satuan yang lengkap');
      return;
    }

    const processedOrder = {
      ...order,
      quantity: parseInt(order.quantity, 10),
      pricePerItem: parseFloat(order.pricePerItem),
      materials: validMaterials.map(m => ({
        name: m.name.trim(),
        quantity: parseFloat(String(m.quantity)),
        unit: m.unit.trim()
      }))
    };

    console.log('Processed order:', processedOrder);

    addOrder(processedOrder);

    Alert.alert('Sukses', 'Pesanan berhasil ditambahkan', [
      {
        text: 'OK',
        onPress: () => {
          router.push('/progress');
          setOrder({
            customerName: '',
            phoneNumber: '',
            orderDetails: '',
            quantity: '',
            pricePerItem: '',
            notes: '',
            orderDate: new Date(),
            deadline: new Date(),
            materials: [{ name: '', quantity: '', unit: '' }],
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInDown.duration(800)}
        style={styles.form}
      >
        <View style={styles.formHeader}>
          <MaterialIcons name="shopping-basket" size={32} color="#2196F3" />
          <Text style={styles.formTitle}>Pesanan Baru</Text>
        </View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Pelanggan</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={order.customerName}
                onChangeText={(text) => setOrder({ ...order, customerName: text })}
                placeholder="Masukkan nama pelanggan"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={order.phoneNumber}
                onChangeText={(text) => setOrder({ ...order, phoneNumber: text })}
                placeholder="Masukkan nomor telepon"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Detail Pesanan</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detail Pesanan</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <MaterialIcons name="description" size={20} color="#666" style={[styles.inputIcon, { marginTop: 10 }]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={order.orderDetails}
                onChangeText={(text) => setOrder({ ...order, orderDetails: text })}
                placeholder="Masukkan detail pesanan"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jumlah</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="format-list-numbered" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={order.quantity}
                onChangeText={(text) => setOrder({ ...order, quantity: text })}
                placeholder="Masukkan jumlah"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Harga per Item</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="attach-money" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={order.pricePerItem}
                onChangeText={(text) => setOrder({ ...order, pricePerItem: text })}
                placeholder="Masukkan harga per item"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Tanggal</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Pesan</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('orderDate')}
            >
              <MaterialIcons name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateButtonText}>
                {order.orderDate.toLocaleDateString('id-ID')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('deadline')}
            >
              <MaterialIcons name="event" size={20} color="#666" />
              <Text style={styles.dateButtonText}>
                {order.deadline.toLocaleDateString('id-ID')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={showDatePicker === 'orderDate' ? order.orderDate : order.deadline}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(null);
                if (date) {
                  setOrder({ 
                    ...order, 
                    [showDatePicker === 'orderDate' ? 'orderDate' : 'deadline']: date 
                  });
                }
              }}
            />
          )}
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(800)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bahan-bahan</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddMaterial}
            >
              <MaterialIcons name="add" size={20} color="#2196F3" />
              <Text style={styles.addButtonText}>Tambah Bahan</Text>
            </TouchableOpacity>
          </View>

          {order.materials.map((material, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialInputGroup}>
                <View style={[styles.inputContainer, styles.materialInputContainer]}>
                  <MaterialIcons name="inventory" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.materialInput]}
                    value={material.name}
                    onChangeText={(text) => handleUpdateMaterial(index, 'name', text)}
                    placeholder="Nama bahan"
                  />
                </View>
                <View style={[styles.inputContainer, styles.materialInputContainer]}>
                  <MaterialIcons name="straighten" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.materialInput]}
                    value={material.quantity}
                    onChangeText={(text) => handleUpdateMaterial(index, 'quantity', text)}
                    placeholder="Jumlah"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, styles.materialInputContainer]}>
                  <MaterialIcons name="category" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.materialInput]}
                    value={material.unit}
                    onChangeText={(text) => handleUpdateMaterial(index, 'unit', text)}
                    placeholder="Satuan"
                  />
                </View>
                {index > 0 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMaterial(index)}
                  >
                    <MaterialIcons name="remove-circle" size={24} color="#FF5252" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(1000)}
          style={[styles.section, styles.lastSection]}
        >
          <Text style={styles.sectionTitle}>Catatan Tambahan</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <MaterialIcons name="note" size={20} color="#666" style={[styles.inputIcon, { marginTop: 10 }]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={order.notes}
              onChangeText={(text) => setOrder({ ...order, notes: text })}
              placeholder="Masukkan catatan tambahan"
              multiline
              numberOfLines={4}
            />
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="check" size={24} color="white" />
          <Text style={styles.submitButtonText}>Simpan Pesanan</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  materialItem: {
    marginBottom: 16,
  },
  materialInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  materialInputContainer: {
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
  },
  materialInput: {
    flex: 1,
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#2196F3',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
