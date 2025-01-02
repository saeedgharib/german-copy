// // screens/HomeScreen.js
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { Button, Text } from 'react-native-paper';
// import { router } from 'expo-router';
// const Management = () => {

// const GotoAddDrivers = () => { 
//     console.log("GotoAddDrivers");
    
//     router.push({pathname:'AddDrivers',params:""})
// }
// const GotoAddCars = () => { 
//     router.push('AddCars')
// }
//   return (
//     <View style={styles.container}>
      
//       <Button 
//         mode="contained" 
//         onPress={GotoAddDrivers} 
//         style={styles.button}
//       >
//         Add Driver
//       </Button>
//       <Button 
//         mode="contained" 
//         onPress={GotoAddCars} 
//         style={styles.button}
//       >
//         Add Car
//       </Button>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   button: {
//     width: '80%',
//     marginVertical: 10,
//     backgroundColor: '#6200ee',
//   },
// });

// export default Management;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  where,
} from 'firebase/firestore';
import DB ,{storage} from '../../database/firebaseConfig'
import { useSignUp, useUser } from '@clerk/clerk-expo';
import DropDownPicker from 'react-native-dropdown-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const CAR_TYPES = [
  { label: 'Select a vehicle type', value: '' },
  { label: 'Cargo Van', value: 'Cargo Van' },
  { label: 'Flabbed', value: 'Flabbed' },
  { label: 'Small Trucks-16ft', value: 'Small Trucks-16ft' },
  { label: 'Refrigerated', value: 'Refrigerated' },
  { label: 'Medium Box-20ft', value: 'Medium Box-20ft' },
  { label: 'Large Box-26ft', value: 'Large Box-26ft' }
];
// Car Form Component
const CarForm = ({ visible, onClose, onSubmit, loading }) => {
  const {user}=useUser()
  const [carData, setCarData] = useState({
    carName: '',
    carType: '',
    company: user.username,
    fare: '',
    model: '',
    licensePlate: '',
    year: '',
    carImage: ''
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(CAR_TYPES);


  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result.assets[0].uri);
      
      // if (!result.canceled) {
        setCarData((prev) => ({
          ...prev,
          carImage: result.assets[0].uri,
        }));
      // }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  const updateField = (field, value) => {
    setCarData(prev => ({ ...prev, [field]: value }));
  };

  const resetCarData = () => {
    setCarData({
      carName: '',
      carType: '',
      company: '',
      fare: '',
      model: '',
      licensePlate: '',
      year: '',
      carImage: '',
    });
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        {/* <ScrollView> */}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>
            
            {/* Image Picker */}
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
            >
              {carData.carImage ? (
                <Image 
                  source={{ uri: carData.carImage }} 
                  style={styles.pickedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={40} color="#9CA3AF" />
                  <Text style={styles.imagePlaceholderText}>Add Vehicle Image</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Car Name"
              value={carData.carName}
              onChangeText={(text) => setCarData(prev => ({ ...prev, carName: text }))}
              placeholderTextColor="#9CA3AF"
            />

             {/* Car Type Dropdown */}
             <View style={styles.dropdownContainer}>
              <DropDownPicker
                open={open}
                value={carData.carType}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  if (typeof callback === 'function') {
                    const value = callback(carData.carType);
                    updateField('carType', value);
                  } else {
                    updateField('carType', callback);
                  }
                }}
                setItems={setItems}
                placeholder="Select vehicle type"
                style={styles.dropdown}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownList}
                placeholderStyle={styles.dropdownPlaceholder}
                listItemContainerStyle={styles.dropdownListItem}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Fare"
              value={carData.fare}
              onChangeText={(text) => setCarData(prev => ({ ...prev, fare: text }))}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Vehicle Model"
              value={carData.model}
              onChangeText={(text) => setCarData(prev => ({ ...prev, model: text }))}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={carData.licensePlate}
              onChangeText={(text) => setCarData(prev => ({ ...prev, licensePlate: text }))}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={carData.year}
              onChangeText={(text) => setCarData(prev => ({ ...prev, year: text }))}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]}
                onPress={() => onSubmit({carData,resetCarData})}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        {/* </ScrollView> */}
      </View>
    </Modal>
  );
};
// Driver Form Component
const DriverForm = ({ visible, onClose, onSubmit, loading }) => {
  const {user}=useUser()
  const [driverData, setDriverData] = useState({
    name: '',
    phone: '',
    email: '',
    company: user.username,
    cnic: '',
    model: '',
    licenseUrl: '',
    address: '',
    age: ''
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(CAR_TYPES);


  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result.assets[0].uri);
      
      // if (!result.canceled) {
        setDriverData((prev) => ({
          ...prev,
          licenseUrl: result.assets[0].uri,
        }));
      // }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  const updateField = (field, value) => {
    setDriverData(prev => ({ ...prev, [field]: value }));
  };

  const resetDriverData = () => {
    setDriverData({
      name: '',
      email: '',
    phone: '',
    company: '',
    cnic: '',
    model: '',
    licenseUrl: '',
    address: '',
    age: ''
    });
  };

  return(
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add New Driver</Text>
         {/* Image Picker */}
         <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
            >
              {driverData.licenseUrl ? (
                <Image 
                  source={{ uri: driverData.licenseUrl }} 
                  style={styles.pickedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={40} color="#9CA3AF" />
                  <Text style={styles.imagePlaceholderText}>Add Driving License</Text>
                </View>
              )}
            </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setDriverData(prev => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => setDriverData(prev => ({ ...prev, email: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          onChangeText={(text) => setDriverData(prev => ({ ...prev, phone: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="CNIC"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          onChangeText={(text) => setDriverData(prev => ({ ...prev, cnic: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
           onPress={() => onSubmit({driverData,resetDriverData})}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.submitButtonText]}>
              {loading ? 'Adding...' : 'Add Driver'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
}
// Main Component
const FleetManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const {user}=useUser()
  let moverId
  useEffect(() => {
    fetchMoverData();
  }, []);

  const fetchMoverData = async () => {
    if (user) {
      try {
        const q = query(collection(DB, "companies"), where("username", "==", user?.username));
        const querySnapshot = await getDocs(q);

        const moverData = [];
        querySnapshot.forEach((doc) => {
          // Append the document data to the moverData array
          moverData.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, " => ", doc.data());
          
        });
        moverId=querySnapshot.docs[0].id
        if (moverData.length > 0) {
          // Assuming you only expect one matching document
          console.log(querySnapshot.docs[0].id);
          
        } else {
          console.log('No matching company found');
        }

        await fetchData()
      } catch (error) {
        console.error('Error fetching mover data:', error);
      }
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const carsQuery = query(collection(DB, 'cars'),where("company","==",user.username));
      const driversQuery = query(collection(DB, 'drivers'),where("company","==",user.username));

      const [carsSnapshot, driversSnapshot] = await Promise.all([
        getDocs(carsQuery),
        getDocs(driversQuery)
      ]);

      setCars(carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDrivers(driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddCar = async ({carData,resetCarData}) => {
    if ( !carData.carImage) {
      console.error("Invalid car data:");
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = null;
      if (carData.carImage) {
       
        const imageRef = ref(storage, `car-images/${moverId||user.username}/${Date.now()}.jpg`);
        const response = await fetch(carData?.carImage);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
      console.log(imageUrl);
      console.log(carData);
      
      const carRef = collection(DB,"cars");
      const newCar = {
        carName: carData.carName || '',
        carType: carData.carType || '',
        company: user.username || '',
        fare: parseFloat(carData.fare) || 0,
        model: carData.model || '',
        licensePlate: carData.licensePlate || '',
        year: carData.year || '',
        carImage: imageUrl || '',
        createdAt: new Date(),
      };
        try {
          const docRef=await addDoc(carRef, newCar);
          console.log('Car added with ID:', docRef.id);
        } catch (error) {
          console.log("error while addDoc method"+error);
          
        }
        // setCars(prev => [...prev, { id: docRef.id, ...newCar }]);
        setCarModalVisible(false);
        resetCarData();
        fetchData()
      Alert.alert('Success', 'Vehicle added successfully');
    } catch (error) {
      console.error('Error adding car:'+ error);
      Alert.alert('Error', 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };



  const handleSignUp=async({driverData}) => {
    try {
      await signUp
      .create({
        firstName:driverData.name,
        lastName:"",
        emailAddress: driverData.email,
        password: "12345678",
        unsafeMetadata:{
          "role": "driver",
          "addedBy":user?.username
        },
        
      })
      
    } catch (error) {
      console.log(error);
      
    }


  }
  const handleAddDriver = async ({driverData,resetDriverData}) => {
    

    try {
      setLoading(true);
      
      let imageUrl = null;
      if (driverData.licenseUrl) {
       
        const imageRef = ref(storage, `driver-images/${moverId||user.username}/${Date.now()}.jpg`);
        const response = await fetch(driverData?.licenseUrl);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
      console.log(imageUrl);
      
      
      const driverRef = collection(DB,"drivers");
      const newDriver = {
        name: driverData.name || '',
        phone: driverData.phone || '',
        email: driverData.email || '',
        company: user.username || '',
        address: driverData.address|| '',
        cnic: driverData.cnic || '',
        licenseUrl: imageUrl || '',
        createdAt: new Date(),
      };
        try {
          const docRef=await addDoc(driverRef, newDriver);
          console.log('Driver added with ID:', docRef.id);
        } catch (error) {
          console.log("error while addDoc method"+error);
          
        }
        handleSignUp({driverData})
       
        // setCars(prev => [...prev, { id: docRef.id, ...newCar }]);
        setDriverModalVisible(false);
        resetDriverData();
        fetchData()
      Alert.alert('Success', 'Driver added successfully');
    } catch (error) {
      console.error('Error adding car:'+ error);
      Alert.alert('Error', 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id, type) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(DB,`${type}s`, id));
              if (type === 'car') {
                setCars(cars.filter(car => car.id !== id));
              } else {
                setDrivers(drivers.filter(driver => driver.id !== id));
              }
            } catch (error) {
              Alert.alert('Error', `Failed to delete ${type}`);
            }
          }
        }
      ]
    );
  };

  const renderCar = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="car" size={24} color="#4B5563" />
        <Text style={[styles.cardTitle,{fontSize:18,color:'blue',textTransform:'capitalize',fontWeight:'thin'}]}>{item.carName}</Text>
        <TouchableOpacity 
          onPress={() => handleDelete(item.id, 'car')}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',justifyContent:'flex-start'}}>
      <Image source={{uri:item.carImage}} width={120} height={100} style={{borderRadius:10}}/>
      <View style={[styles.cardContent,{left:20}]}>
        
        <Text  style={[styles.cardSubtitle,{color:'black',fontWeight:'semibold',fontSize:18}]}>Type:<Text style={styles.cardSubtitle}>{item.carType}</Text></Text>
        <Text  style={[styles.cardSubtitle,{color:'black',fontWeight:'semibold'}]}>License Plate : <Text style={styles.cardSubtitle}>{item.licensePlate}</Text></Text>
        <Text  style={[styles.cardSubtitle,{color:'black',fontWeight:'semibold'}]}>Owned By:<Text style={styles.cardSubtitle}>{item.company}</Text></Text>
      </View>

      
      </View>
    </View>
  );

  const renderDriver = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="account" size={24} color="#4B5563" />
        <TouchableOpacity 
          onPress={() => handleDelete(item.id, 'driver')}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.phone}</Text>
        <Text style={styles.cardDetail}>License: {item.licenseNumber}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'cars' && styles.activeTab]}
          onPress={() => setActiveTab('cars')}
        >
          <Text style={[styles.tabText, activeTab === 'cars' && styles.activeTabText]}>
            Vehicles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'drivers' && styles.activeTab]}
          onPress={() => setActiveTab('drivers')}
        >
          <Text style={[styles.tabText, activeTab === 'drivers' && styles.activeTabText]}>
            Drivers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => activeTab === 'cars' ? setCarModalVisible(true) : setDriverModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>
          Add {activeTab === 'cars' ? 'Vehicle' : 'Driver'}
        </Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={activeTab === 'cars' ? cars : drivers}
        renderItem={activeTab === 'cars' ? renderCar : renderDriver}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {activeTab} added yet
          </Text>
        }
      />

      {/* Forms */}
      <CarForm 
        visible={carModalVisible}
        onClose={() => setCarModalVisible(false)}
      onSubmit={({carData,resetCarData}) => 
          // Handle car submission
          handleAddCar({carData,resetCarData})
        
        }
        loading={loading}
      />

      <DriverForm
        visible={driverModalVisible}
        onClose={() => setDriverModalVisible(false)}
        onSubmit={({driverData,resetDriverData}) => 
          // Handle car submission
          handleAddDriver({driverData,resetDriverData})
        
        }
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#4B5563',
  },
  cardDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 24,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#9CA3AF',
    marginTop: 8,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 12,
  },


});

export default FleetManagementScreen;