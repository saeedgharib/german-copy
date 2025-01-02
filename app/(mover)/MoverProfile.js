import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Button, Image, Alert, ActivityIndicator } from 'react-native';
import DB, { storage } from '../../database/firebaseConfig';
import { doc, getDocs, updateDoc,query,collection,where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';

const Profile = () => {
  const [profile, setProfile] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    businessLicense: '',
    // logo: '',
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const {user}=useUser()
  const moverData = [];
  let DocId

 

  const fetchProfile = async () => {
   setLoading(true);
      try {
        const q = query(collection(DB, "companies"), where("username", "==", user?.username));
        const querySnapshot = await getDocs(q);
        
        
        querySnapshot.forEach((doc) => {
          // Append the document data to the moverData array
          moverData.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, " => ", doc.data());
        });
        setLoading(false);
        if (moverData.length > 0) {
            // Assuming you only expect one matching document
            DocId=moverData[0].id;
          setProfile(moverData[0]);
          console.log("Document ID",moverData[0].id);
          
        } else {
          console.log('No matching Mover found');
        }
        
      } catch (error) {
        console.error('Error fetching mover data:', error);
      
    }
    setLoading(false);
  };
  useEffect(() => {

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    
      try {
        console.log('DocId:',DocId.id);
        console.log('Profile data:', profile);
    
        // Ensure that profile fields are not undefined
        if (!profile.companyName || !profile.email || !profile.phoneNumber || !profile.businessLicense) {
          throw new Error('One or more profile fields are undefined');
        }
        
        const docRef=doc(DB,"companies",DocId)
        await updateDoc(docRef,{
            companyName:profile.companyName,
            email:profile.email,
            phoneNumber:profile.phoneNumber,
            businessLicense:profile.businessLicense
        }
        )
        Alert.alert('Success', 'Profile updated successfully.');
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile.');
      }

  };

  const pickLogo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      uploadLogo(uri);
    }
  };


  const uploadLogo = async (uri) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const logoName = profile.companyName
      const storageRefLogo = ref(storage, `logos/${logoName}`);
      await uploadBytes(storageRefLogo, blob);
      const downloadUrl = await getDownloadURL(storageRefLogo);
      setProfile(prev => ({ ...prev, logo: downloadUrl }));
      Alert.alert('Success', 'Logo uploaded successfully.');
      console.log(Profile.logo);
      console.log(downloadUrl);
      
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
console.log(profile)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Management</Text>
      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={profile.companyName}
        onChangeText={(text) => setProfile({ ...profile, companyName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={profile.phoneNumber}
        onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
        keyboardType="phone-pad"
      />
      {/* <TextInput
        style={styles.input}
        placeholder="Address"
        value={profile.address}
        onChangeText={(text) => setProfile({ ...profile, address: text })}
      /> */}
      <TextInput
        style={styles.input}
        placeholder="Business License Number"
        value={profile.businessLicense}
        onChangeText={(text) => setProfile({ ...profile, businessLicense: text })}
      />
      <View style={styles.logoContainer}>
        {profile.logo ? (
          <Image source={{ uri: profile.logo }} style={styles.logo} />
        ) : (
          <Text>No Logo Uploaded</Text>
        )}
        <Button title="Upload Logo" onPress={pickLogo} disabled={uploading} />
        {uploading && <ActivityIndicator size="small" />}
      </View>
      <Button title="Update Profile" onPress={handleUpdateProfile} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
  },
});
