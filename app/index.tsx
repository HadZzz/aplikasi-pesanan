import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
        style={styles.header}
      >
        <View style={styles.headerOverlay} />
        <Image
          source={require('../assets/images/favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SMK Kristen Pedan</Text>
        <Text style={styles.subtitle}>Sistem Informasi Manajemen Pesanan</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text 
          entering={FadeInUp.duration(800).delay(300)}
          style={styles.sectionTitle}
        >
          Tentang Sekolah
        </Animated.Text>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(400)}
          style={styles.infoCard}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="school" size={24} color="white" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>SMK Kristen Pedan</Text>
            <Text style={styles.infoText}>
              Sekolah kejuruan dengan fokus pada pengembangan keterampilan dan karakter siswa
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(500)}
          style={styles.infoCard}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
            <MaterialIcons name="location-on" size={24} color="white" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Lokasi</Text>
            <Text style={styles.infoText}>
              Jl. Raya Pedan-Cawas No.777, Pedan, Klaten, Jawa Tengah
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(600)}
          style={styles.infoCard}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FF9800' }]}>
            <MaterialIcons name="phone" size={24} color="white" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Kontak</Text>
            <Text style={styles.infoText}>
              Telp: (0272) 897654{'\n'}
              Email: info@smkkristenpedan.sch.id
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(700)}
          style={styles.infoCard}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' }]}>
            <MaterialIcons name="stars" size={24} color="white" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Program Unggulan</Text>
            <View style={styles.programList}>
              <View style={styles.programItem}>
                <MaterialIcons name="build" size={16} color="#666" />
                <Text style={styles.programText}>Teknik Pemesinan</Text>
              </View>
              <View style={styles.programItem}>
                <MaterialIcons name="directions-car" size={16} color="#666" />
                <Text style={styles.programText}>Teknik Kendaraan Ringan</Text>
              </View>
              <View style={styles.programItem}>
                <MaterialIcons name="computer" size={16} color="#666" />
                <Text style={styles.programText}>Teknik Komputer dan Jaringan</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.duration(800).delay(800)}
        style={styles.buttonContainer}
      >
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(tabs)')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="white" />
          <Text style={styles.buttonText}>Lihat Pesanan</Text>
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
  header: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    transform: [{ skewY: '-5deg' }],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  programList: {
    marginTop: 8,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
}); 