import React, { useState } from "react";
import { View, StyleSheet, Text, Image, Alert } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import  DB, {storage } from "../../database/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useUser } from '@clerk/clerk-expo';


const AddCarForm = () => {
  const [carImage, setCarImage] = useState(null);
  const [carName, setCarName] = useState("");
  const [carType, setCarType] = useState("");
  const [carDescription, setCarDescription] = useState("");
  const [fare, setFare] = useState("");
  const {user} = useUser();

  const handleSelectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access gallery is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setCarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image: ", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Function to open the camera
  const handleTakePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setCarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo: ", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleAddCar = async () => {
    try {
      let carImageUrl = "";
      if (carImage) {
        const carImageRef = ref(storage,`cars/${carName}_image`);
        const img = await fetch(carImage);
        const bytes = await img.blob();
        await uploadBytes(carImageRef, bytes);
        carImageUrl = await getDownloadURL(carImageRef);
      }
      console.log(carImageUrl);
      
      await addDoc(collection(DB,"cars"), {
        carName:carName,
        carType:carType,
        company:user.username,
        fare: parseFloat(fare),
        carImageUrl:carImageUrl||"",
        carDescription:carDescription
      });

      alert("Success", "Car added successfully!");
      setCarImage(null);
      setCarName("");
      setCarType("");
      setFare("");
      setCarDescription("");
    } catch (error) {
      console.error(error);
      alert("Error"+"Something went wrong. Please try again."+error);
    }
  };

  return (
    <View style={styles.container}>
      
      <Card style={styles.card}>
        <Text style={styles.label}>Car Image</Text>
        <View style={styles.imageContainer}>
          {carImage ? (
            <Image source={{ uri: carImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholder}>No image selected</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleSelectImage}
            style={styles.button}
          >
            Upload from Gallery
          </Button>
          <Button
            mode="outlined"
            onPress={handleTakePhoto}
            style={styles.button}
          >
            Take Photo
          </Button>
        </View>
        {/* {carImage && <Image source={{ uri: carImage }} style={styles.carImage} />} */}
        <TextInput
          label="Car Name"
          value={carName}
          onChangeText={setCarName}
          style={styles.input}
        />
        <TextInput
          label="Car Type"
          value={carType}
          onChangeText={setCarType}
          style={styles.input}
        />
        <TextInput
          label="Car Description"
          value={carDescription}
          onChangeText={setCarDescription}
          style={styles.input}
        />
        <TextInput
          label="carfare"
          value={fare}
          onChangeText={setFare}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleAddCar}
          style={styles.submitButton}
        >
          Add Car
        </Button>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f0f0" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  card: { padding: 20, borderRadius: 10, backgroundColor: "white" },
  uploadButton: { marginVertical: 15 },
  carImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginVertical: 10,
    borderRadius: 8,
  },
  input: { marginBottom: 15 },
  submitButton: { marginTop: 20, backgroundColor: "#6200ee" },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  //   placeholder: {
  //     fontSize: 14,
  //     color: '#888',

  //   },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
});

export default AddCarForm;
