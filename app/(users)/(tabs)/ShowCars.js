import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, Divider } from 'react-native-paper';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import DB from '../../../database/firebaseConfig';

const ShowCars = () => {
  const { companyId, jobId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('All');

  const carsData = [
    { id: '1', name: 'ford Cargo', type: 'Cargo Van', fare: 200, imageUrl: require("../../../assets/cars/cargovans/fordcargo.png") },
    { id: '2', name: 'MercedesSprinwter', type: 'Cargo Van', fare: 150, imageUrl:require("../../../assets/cars/cargovans/Mercedes-Benz Sprinter.png") },
    { id: '3', name: 'U-Haul CargoVan', type: 'Cargo Van', fare: 100, imageUrl: require("../../../assets/cars/cargovans/U-Haul Cargo Van.png") },

    { id: '4', name: 'Ford F-650 Flabbed', type: 'flabbed', fare: 700, imageUrl: require("../../../assets/cars/flabbed/Ford F-650 Flatbed.png") },
    { id: '5', name: 'Freightliner Flabbed', type: 'flabbed', fare:900, imageUrl: require("../../../assets/cars/flabbed/Freightliner Flatbed.png") },

    { id: '6', name: 'Budget 26ft', type: 'largebox', fare: 500, imageUrl:require("../../../assets/cars/largebox/budget-26ft.png") },
    { id: '7', name: 'Penseke 26ft', type: 'largebox', fare: 600, imageUrl: require("../../../assets/cars/largebox/penseke-26ft.jpeg") },
    { id: '8', name: 'U-Haul 26ft', type: 'largebox', fare: 700, imageUrl: require("../../../assets/cars/largebox/uhaul-26ft.png") },

    { id: '9', name: 'Budget 20ft', type: 'mediumbox', fare: 350, imageUrl: require("../../../assets/cars/mediumbox/budget-20ft.png") },
    { id: '10', name: 'Penseke 20ft', type: 'mediumbox', fare: 400, imageUrl: require("../../../assets/cars/mediumbox/penseke20ft.jpeg") },
    { id: '11', name: 'U-Haul 20ft', type: 'mediumbox', fare: 400, imageUrl:require("../../../assets/cars/mediumbox/U-Haul 20ft.png") },

    { id: '12', name: 'Budget 12ft', type: 'smallbox', fare: 200, imageUrl: require("../../../assets/cars/smallbox/Budget 12ft Truck,.png") },
    { id: '13', name: 'Penseke 26ft', type: 'smallbox', fare: 350, imageUrl: require("../../../assets/cars/smallbox/penseke-16ft.png") },
    { id: '14', name: 'U-Haul 10ft', type: 'smallbox', fare: 200, imageUrl: require("../../../assets/cars/smallbox/U-Haul 10ft Truck.png")},

    { id: '15', name: 'Ford truck', type: 'small trucks', fare: 250, imageUrl: require("../../../assets/cars/smalltrucks/ford.png") },
    { id: '16', name: 'Toyota Tacoma', type: 'small trucks', fare: 100, imageUrl: require("../../../assets/cars/smalltrucks/tyota-tacoma.png") },
    { id: '17', name: 'U-Haul mini', type: 'small trucks', fare: 100, imageUrl:require("../../../assets/cars/smalltrucks/u-haul-mini.png") },
    

    { id: '18', name: 'Isuzu Truck', type: 'refrigirated', fare: 900, imageUrl: require("../../../assets/cars/refrigirated/Isuzu Truck.jpg") },
    { id: '19', name: 'Thermoking Truck', type: 'refrigirated', fare: 900, imageUrl: require("../../../assets/cars/refrigirated/thermoking.jpg")},
    // Add more cars as needed
  ];
  const carTypes = ['All', 'Cargo Van', 'smallbox', 'small trucks', 'refrigirated', 'flabbed', 'largebox', 'mediumbox'];
  const filteredCars = selectedType === 'All' ? carsData : carsData.filter(car => car.type === selectedType);

  const AddandProceed = async (item) => {
    try {
      setLoading(true);
      await updateDoc(doc(DB, "furnitureOrders", jobId), {
        carId: item.id,
      });
      router.push({
        pathname: 'FareCalculation',
        params: { companyId, jobId, carId: item.id, carFare: item.fare }
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const CarCard = ({ item }) => (
    <TouchableOpacity onPress={() => AddandProceed(item)}>
      <Card style={styles.card}>
        <LinearGradient
          colors={['#1a237e', '#3949ab']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >

        <View style={{display:'flex',justifyContent:'space-between',width:'100%',flexDirection:'row'}}>

          <Text style={styles.cardTitle}>{item.name}</Text>
            <Chip
              mode="outlined"
              style={styles.typeChip}
              textStyle={styles.chipText}
            >
              {item.type}
            </Chip>
        </View>
        </LinearGradient>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <Image source={item.imageUrl} style={styles.carImage} />
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>Fare</Text>
              <Text style={styles.fareAmount}>RS {item.fare}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ea" />
        </View>
      )}
      
     

      <View style={styles.filterContainer}>
        <FlatList
          data={carTypes}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <Chip
              selected={selectedType === item}
              onPress={() => setSelectedType(item)}
              style={[
                styles.filterChip,
                selectedType === item && styles.selectedChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedType === item && styles.selectedChipText
              ]}
            >
              {item}
            </Chip>
          )}
        />
      </View>
      
      <FlatList
        data={filteredCars}
        renderItem={CarCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.carList}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 35, 126, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  filterContainer: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chipContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginHorizontal: 4,
    backgroundColor: '#e8eaf6',
    borderColor: '#3949ab',
  },
  selectedChip: {
    backgroundColor: '#3949ab',
  },
  filterChipText: {
    color: '#3949ab',
  },
  selectedChipText: {
    color: '#fff',
  },
  carList: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  gradientHeader: {
    padding: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  carImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    objectFit: 'contain',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8eaf6',
    borderColor: '#3949ab',
  },
  chipText: {
    color: '#3949ab',
    fontSize: 12,
  },
  fareContainer: {
    backgroundColor: '#e8eaf6',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex:1,
    justifyContent: 'center',
    
  },
  fareLabel: {
    color: '#3949ab',
    fontSize: 12,
    fontWeight: '500',
  },
  fareAmount: {
    color: '#1a237e',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ShowCars;