// screens/AddDriverForm.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DB,{storage} from '../../database/firebaseConfig'
import {  ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from "firebase/firestore";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useUser } from '@clerk/clerk-expo';
const AddDriverForm = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [licenseImage, setLicenseImage] = useState(null);
  const {user} =useUser()
  // Function to request permission and select an image from the gallery
  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLicenseImage(result.assets[0].uri);
    }
  };
  const validateIdNumber = (id) => {
    const regex = /^\d{5}-\d{8}$/; // Regex to match the format 13504-98352793
    return regex.test(id);
  };

  // Function to request permission and take a photo
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLicenseImage(result.assets[0].uri);
    }
  };

 
  const handleAddDriver = async () => {
    if (!name || !age || !phone || !address || !licenseImage) {
      alert("Validation Error \nPlease fill all fields and upload a driving license image.");
      return;
    }
    try {
      let licenseUrl = '';
      if (licenseImage) {
        const licenseRef = ref(storage, `drivers/${name}_license`);
        const img = await fetch(licenseImage);
        const bytes = await img.blob();
        await uploadBytes(licenseRef, bytes);
        licenseUrl = await getDownloadURL(licenseRef);
      }
  
      // Add document to 'drivers' collection
      await addDoc(collection(DB,'drivers'), {
        name: name,
        age: parseInt(age),
        phone: phone,
        company: user.username,
        cnic:cnic,
        address: address,
        licenseUrl: licenseUrl ,
      });
  
      alert('Success', 'Driver added successfully!');
      setName('');
      setAge('');
      setLicenseImage(null);  // Corrected to setLicenseImage
      setPhone('');
      setAddress('');
    } catch (error) {
      console.error("Error adding driver: ", error);
      alert('Error', 'Something went wrong. Please try again.');
    }
  };
  
  return (
    <GestureHandlerRootView>

    <ScrollView>

    <View style={styles.container}>
      <Text style={styles.title}>Add Driver</Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
       <TextInput
        
        placeholder="Enter Identity Card Number (e.g., 12345-67890321)"
        value={cnic}
        style={styles.input}
        keyboardType="decimal-pad"
        onChangeText={setCnic}
        maxLength={14} // Limit the input length to the expected format
      />
      <TextInput
        label="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <Text style={styles.label}>Driving License Image</Text>
      <View style={styles.imageContainer}>
        {licenseImage ? (
          <Image source={{ uri: licenseImage }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={handleSelectImage} style={styles.button}>
          Upload from Gallery
        </Button>
        <Button mode="outlined" onPress={handleTakePhoto} style={styles.button}>
          Take Photo
        </Button>
      </View>

      <Button mode="contained" onPress={handleAddDriver} style={styles.submitButton}>
        Submit
      </Button>

    </View>
    </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    // borderWidth: 1,
    shadowColor:'gray',
    shadowOpacity:'10',
    borderRadius: 20,
    color:'green',
    backgroundColor: '#e0e0e0',
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
//   placeholder: {
//     fontSize: 14,
//     color: '#888',
    
//   },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  button: {
    width: '45%',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
});

export default AddDriverForm;
