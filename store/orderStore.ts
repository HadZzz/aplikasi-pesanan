import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  orderDetails: string;
  quantity: number;
  pricePerItem: number;
  totalAmount?: number;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  assemblyProgress: number;
  createdAt: Date;
  orderDate: Date;
  deadline: Date;
  completedAt?: Date;
  materials: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'progress' | 'assemblyProgress' | 'createdAt'>) => void;
  updateOrderProgress: (id: string, progress: number, assemblyProgress: number) => void;
  completeOrder: (id: string) => void;
  getOrdersByStatus: (status: Order['status']) => Order[];
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
}

// Helper function to parse dates in an order
const parseDatesInOrder = (order: any): Order => {
  return {
    ...order,
    createdAt: new Date(order.createdAt),
    orderDate: new Date(order.orderDate),
    deadline: new Date(order.deadline),
    completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
  };
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (orderData) => set((state) => ({
        orders: [
          ...state.orders,
          {
            ...orderData,
            id: Date.now().toString(),
            status: 'pending',
            progress: 0,
            assemblyProgress: 0,
            createdAt: new Date(),
          },
        ],
      })),

      updateOrderProgress: (id, progress, assemblyProgress) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!order) return state;

        return {
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  progress,
                  assemblyProgress,
                  status: (progress < order.quantity || assemblyProgress < order.quantity) ? 'in_progress' : order.status,
                }
              : order
          ),
        };
      }),

      completeOrder: (id) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!order) return state;

        const totalAmount = order.quantity * order.pricePerItem;

        return {
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status: 'completed',
                  progress: order.quantity,
                  completedAt: new Date(),
                  totalAmount,
                }
              : order
          ),
        };
      }),

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id
            ? { ...order, ...updates }
            : order
        ),
      })),

      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((order) => order.id !== id)
      })),
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Parse dates when rehydrating from storage
        if (state && state.orders) {
          state.orders = state.orders.map(parseDatesInOrder);
        }
      },
    }
  )
); 