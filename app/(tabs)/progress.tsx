import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOrderStore, Order } from '../../store/orderStore';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProgressScreen() {
  const { orders = [], updateOrderProgress, completeOrder } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedMaterials, setEditedMaterials] = useState<Order['materials']>([]);
  const [editedProgress, setEditedProgress] = useState({
    production: 0,
    assembly: 0
  });

  const inProgressOrders = orders?.filter(
    (order) => order.status === 'pending' || order.status === 'in_progress'
  ) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditedMaterials([...order.materials]);
    setEditedProgress({
      production: order.progress,
      assembly: order.assemblyProgress
    });
    setEditModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Hapus Pesanan',
      'Apakah Anda yakin ingin menghapus pesanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const { deleteOrder } = useOrderStore.getState();
            deleteOrder(id);
          }
        }
      ]
    );
  };

  const handleComplete = (id: string) => {
    Alert.alert(
      'Selesaikan Pesanan',
      'Apakah Anda yakin ingin menyelesaikan pesanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Selesai',
          style: 'default',
          onPress: () => completeOrder(id)
        }
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!selectedOrder) return;

    const { updateOrder } = useOrderStore.getState();
    updateOrder(selectedOrder.id, {
      progress: editedProgress.production,
      assemblyProgress: editedProgress.assembly,
      status: editedProgress.production === selectedOrder.quantity && 
             editedProgress.assembly === selectedOrder.quantity ? 'completed' : 'in_progress'
    });

    setEditModalVisible(false);
    setSelectedOrder(null);
  };

  const renderProgressBar = (progress: number, total: number, color: string) => {
    const percentage = (progress / total) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { 
              width: `${percentage}%`,
              backgroundColor: color,
            }
          ]}
        />
        <Text style={styles.progressText}>
          {Math.round(percentage)}%
        </Text>
      </View>
    );
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => {
    const isProductionComplete = item.progress === item.quantity;
    const isAssemblyComplete = item.assemblyProgress === item.quantity;
    const isOrderComplete = isProductionComplete && isAssemblyComplete;

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 200)}
        style={styles.orderCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.orderDetails}>{item.orderDetails}</Text>
          </View>
          <View style={[styles.statusBadge, 
            { backgroundColor: isOrderComplete ? '#E8F5E9' : item.status === 'in_progress' ? '#E3F2FD' : '#FFF3E0' }
          ]}>
            <MaterialIcons 
              name={isOrderComplete ? 'check-circle' : item.status === 'in_progress' ? 'pending-actions' : 'schedule'} 
              size={16} 
              color={isOrderComplete ? '#4CAF50' : item.status === 'in_progress' ? '#2196F3' : '#FF9800'} 
            />
            <Text style={[styles.statusText, 
              { color: isOrderComplete ? '#4CAF50' : item.status === 'in_progress' ? '#2196F3' : '#FF9800' }
            ]}>
              {isOrderComplete ? 'Siap Selesai' : item.status === 'in_progress' ? 'Dalam Proses' : 'Menunggu'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="shopping-cart" size={16} color="#666" />
              <Text style={styles.infoText}>Jumlah: {item.quantity}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={16} color="#666" />
              <Text style={styles.infoText}>{formatCurrency(item.pricePerItem)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.infoText}>
                {format(new Date(item.deadline), 'dd MMM yyyy', { locale: id })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Produksi</Text>
            <Text style={styles.progressValue}>{item.progress} / {item.quantity}</Text>
          </View>
          {renderProgressBar(item.progress, item.quantity, '#2196F3')}

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Perakitan</Text>
            <Text style={styles.progressValue}>{item.assemblyProgress} / {item.quantity}</Text>
          </View>
          {renderProgressBar(item.assemblyProgress, item.quantity, '#4CAF50')}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={20} color="#FF9800" />
            <Text style={[styles.actionButtonText, { color: '#FF9800' }]}>Edit</Text>
          </TouchableOpacity>

          {isOrderComplete ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleComplete(item.id)}
            >
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Selesai</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <MaterialIcons name="delete" size={20} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Hapus</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {inProgressOrders.map((item, index) => (
          <View key={item.id}>
            {renderOrderCard({ item, index })}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Progress</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.progressEditSection}>
                <Text style={styles.editSectionTitle}>Progress Produksi</Text>
                <View style={styles.progressEditContainer}>
                  <MaterialIcons name="build" size={24} color="#2196F3" />
                  <TextInput
                    style={styles.progressInput}
                    value={String(editedProgress.production)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setEditedProgress(prev => ({
                        ...prev,
                        production: value
                      }));
                    }}
                    keyboardType="numeric"
                    placeholder="Jumlah produksi"
                  />
                </View>

                <Text style={styles.editSectionTitle}>Progress Perakitan</Text>
                <View style={styles.progressEditContainer}>
                  <MaterialIcons name="settings" size={24} color="#4CAF50" />
                  <TextInput
                    style={styles.progressInput}
                    value={String(editedProgress.assembly)}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setEditedProgress(prev => ({
                        ...prev,
                        assembly: value
                      }));
                    }}
                    keyboardType="numeric"
                    placeholder="Jumlah perakitan"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  orderCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: '#666',
    maxWidth: width * 0.6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  completeButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    maxHeight: '100%',
  },
  progressEditSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  progressEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  progressInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 