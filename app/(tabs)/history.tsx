import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOrderStore, Order } from '../../store/orderStore';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const { orders = [] } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const completedOrders = orders?.filter(order => order.status === 'completed') || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalAmount = (order: Order) => {
    return order.quantity * order.pricePerItem;
  };

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleExportPDF = async (order: Order) => {
    try {
      // Generate materials table HTML
      const materialsHtml = order.materials
        .map(m => `
          <tr>
            <td>${m.name}</td>
            <td style="text-align: right">${m.quantity}</td>
            <td style="text-align: center">${m.unit}</td>
          </tr>
        `)
        .join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body {
                font-family: 'Helvetica';
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2196F3;
                padding-bottom: 10px;
              }
              .header h1 {
                color: #2196F3;
                margin: 0;
                font-size: 24px;
              }
              .section {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f8f8;
                border-radius: 8px;
              }
              .section-title {
                color: #2196F3;
                font-size: 18px;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .info-row {
                display: flex;
                margin-bottom: 8px;
              }
              .label {
                font-weight: bold;
                color: #666;
                width: 150px;
              }
              .value {
                color: #333;
                flex: 1;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
              }
              .total {
                text-align: right;
                font-size: 18px;
                color: #2196F3;
                font-weight: bold;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 2px solid #ddd;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DETAIL PESANAN</h1>
            </div>

            <div class="section">
              <div class="section-title">Informasi Pelanggan</div>
              <div class="info-row">
                <div class="label">Nama Pelanggan:</div>
                <div class="value">${order.customerName}</div>
              </div>
              ${order.phoneNumber ? `
                <div class="info-row">
                  <div class="label">Nomor Telepon:</div>
                  <div class="value">${order.phoneNumber}</div>
                </div>
              ` : ''}
              <div class="info-row">
                <div class="label">Detail Pesanan:</div>
                <div class="value">${order.orderDetails}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Detail Produksi</div>
              <div class="info-row">
                <div class="label">Jumlah:</div>
                <div class="value">${order.quantity} unit</div>
              </div>
              <div class="info-row">
                <div class="label">Harga per Unit:</div>
                <div class="value">${formatCurrency(order.pricePerItem)}</div>
              </div>
              <div class="info-row">
                <div class="label">Tanggal Pesan:</div>
                <div class="value">${format(new Date(order.orderDate), 'dd MMMM yyyy', { locale: id })}</div>
              </div>
              <div class="info-row">
                <div class="label">Tanggal Selesai:</div>
                <div class="value">${format(new Date(order.completedAt || new Date()), 'dd MMMM yyyy', { locale: id })}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Bahan-bahan</div>
              <table>
                <thead>
                  <tr>
                    <th>Nama Bahan</th>
                    <th style="text-align: right">Jumlah</th>
                    <th style="text-align: center">Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  ${materialsHtml}
                </tbody>
              </table>
              <div class="total">
                Total: ${formatCurrency(calculateTotalAmount(order))}
              </div>
            </div>

            <div class="footer">
              Dokumen ini digenerate pada ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Gagal membuat PDF');
    }
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 200)}
      style={styles.orderCard}
    >
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => handleShowDetails(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.orderDate}>
              Selesai: {format(new Date(item.completedAt || new Date()), 'dd MMM yyyy', { locale: id })}
            </Text>
          </View>
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.completedText}>Selesai</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderDetails} numberOfLines={2}>
            {item.orderDetails}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="shopping-cart" size={16} color="#666" />
              <Text style={styles.statText}>{item.quantity} unit</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="attach-money" size={16} color="#666" />
              <Text style={styles.statText}>{formatCurrency(calculateTotalAmount(item))}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <MaterialIcons name="arrow-forward" size={20} color="#2196F3" />
          <Text style={styles.viewDetailsText}>Lihat Detail</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => handleExportPDF(item)}
        >
          <MaterialIcons name="picture-as-pdf" size={20} color="#F44336" />
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.duration(800)}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Riwayat Pesanan</Text>
          <Text style={styles.subtitle}>{completedOrders.length} pesanan selesai</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {completedOrders.map((item, index) => (
          <View key={item.id}>
            {renderOrderCard({ item, index })}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Pesanan</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedOrder && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="person" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Nama Pelanggan</Text>
                        <Text style={styles.detailText}>{selectedOrder.customerName}</Text>
                      </View>
                    </View>
                    {selectedOrder.phoneNumber && (
                      <View style={styles.detailItem}>
                        <MaterialIcons name="phone" size={20} color="#2196F3" />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Nomor Telepon</Text>
                          <Text style={styles.detailText}>{selectedOrder.phoneNumber}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Detail Pesanan</Text>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="description" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Deskripsi</Text>
                        <Text style={styles.detailText}>{selectedOrder.orderDetails}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="shopping-cart" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Jumlah</Text>
                        <Text style={styles.detailText}>{selectedOrder.quantity} unit</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="attach-money" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Harga per Unit</Text>
                        <Text style={styles.detailText}>{formatCurrency(selectedOrder.pricePerItem)}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="calculate" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Total Harga</Text>
                        <Text style={[styles.detailText, styles.totalAmount]}>
                          {formatCurrency(calculateTotalAmount(selectedOrder))}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Tanggal</Text>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="event" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Tanggal Pesan</Text>
                        <Text style={styles.detailText}>
                          {format(new Date(selectedOrder.orderDate), 'dd MMMM yyyy', { locale: id })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="event-available" size={20} color="#2196F3" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Tanggal Selesai</Text>
                        <Text style={styles.detailText}>
                          {format(new Date(selectedOrder.completedAt || new Date()), 'dd MMMM yyyy', { locale: id })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedOrder.materials && selectedOrder.materials.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Bahan-bahan</Text>
                      {selectedOrder.materials.map((material, index) => (
                        <View key={index} style={styles.detailItem}>
                          <MaterialIcons name="inventory" size={20} color="#2196F3" />
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>{material.name}</Text>
                            <Text style={styles.detailText}>
                              {material.quantity} {material.unit}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedOrder.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Catatan</Text>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="note" size={20} color="#2196F3" />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailText}>{selectedOrder.notes}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
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
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  totalAmount: {
    fontWeight: '600',
    color: '#2196F3',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButtonText: {
    marginLeft: 8,
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
}); 