// import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DB,{ storage } from '../../database/firebaseConfig'; // Make sure this path is correct
import Icon from 'react-native-vector-icons/MaterialIcons';
import LocationPickerModal from './LocationPickerModal';
import { useUser } from '@clerk/clerk-expo';
import { registerForPushNotificationsAsync } from '../../utility/notificationHelper';
const FurnitureForm = () => {
    const {user} =useUser()
    const [images, setImages] = useState([]);
    const [orderName, setOrderName] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [movers, setMovers] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [pickupLocation, setPickupLocation] = useState(null);
    const [dropoffLocation, setDropoffLocation] = useState(null);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showDropoffModal, setShowDropoffModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pushToken, setPushToken] = useState(null);

    // Get push token when component mounts
    useEffect(() => {
        const getPushToken = async () => {
            const token = await registerForPushNotificationsAsync();
            setPushToken(token);
        };
        
        getPushToken();
    }, []);
    const selectImages = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                setImages((prev) => [...prev, ...result.assets]);
            }
        } catch (error) {
            console.log('ImagePicker Error: ', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };
    console.log(user?.id);
    
    const uploadImages = async (images) => {
        try {
            const uploadedUrls = await Promise.all(
                images.map(async (image) => {
                    // Create a unique filename
                    const filename = `furniture_images/${user.id}${Date.now()}_${Math.random().toString(36).substring(7)}`;
                    const storageRef = ref(storage, filename);

                    // Fetch the image and convert to blob
                    const response = await fetch(image.uri);
                    const blob = await response.blob();

                    // Upload to Firebase Storage
                    await uploadBytes(storageRef, blob);

                    // Get download URL
                    const downloadURL = await getDownloadURL(storageRef);
                    return downloadURL;
                })
            );

            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw new Error('Failed to upload images');
        }
    };

    const handleSubmit = async () => {
        // Validate all required fields
        if (
            !orderName.trim() ||
            !email.trim() ||
            !description.trim() ||
            !movers ||
            !date ||
            !time ||
            !pickupLocation ||
            !dropoffLocation
        ) {
            Alert.alert('Validation Error', 'Please fill all required fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        // Show loading indicator
        setIsLoading(true);

        try {
            // Upload images first and get their URLs
            let imageUrls = [];
            if (images.length > 0) {
                imageUrls = await uploadImages(images);
            }

            // Prepare the order data
            const orderData = {
                userId:user.id,
                orderName: orderName.trim(),
                email: email.trim(),
                description: description.trim(),
                movers: parseInt(movers, 10),
                date: date.toISOString(),
                time,
                pickupLocation: {
                    placeId: pickupLocation.placeId,
                    latitude: pickupLocation.latitude,
                    longitude: pickupLocation.longitude,
                    address: pickupLocation.address,
                },
                dropoffLocation: {
                    placeId: dropoffLocation.placeId,
                    latitude: dropoffLocation.latitude,
                    longitude: dropoffLocation.longitude,
                    address: dropoffLocation.address,
                },
                imageUrls,
                paymentInfo:{
                    paidAmount:"",
                    paidAt:"",
                    paymentStatus:"",
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                totalDistance: null||"", // Can be calculated later if needed
                estimatedPrice: null||"", // Can be calculated later if needed
                pushToken, // Save the push token
                notificationEnabled: true,
                moverId: null||"", // Can be calculated later if needed

            };

            // Log the data being saved
            console.log('Saving order data:', JSON.stringify(orderData, null, 2));

            // Save to Firestore
            const docRef = await addDoc(collection(DB,"furnitureOrders"), orderData)
            
            console.log('Order saved successfully with ID:', docRef.id);

            // Show success message
            Alert.alert(
                'Success',
                'Your order has been submitted successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Error submitting order:', error);
            Alert.alert(
                'Error',
                'Failed to submit your order. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setOrderName('');
        setEmail('');
        setDescription('');
        setMovers('');
        setDate(null);
        setTime('');
        setImages([]);
        setPickupLocation(null);
        setDropoffLocation(null);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView 
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.header}>Create Furniture Order</Text>

                    {/* Image Picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={selectImages}>
                        <Icon name="add-photo-alternate" size={24} color="#666" />
                        <Text style={styles.imagePickerText}>Upload Images</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal style={styles.imagePreview}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.image}
                                />
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setImages(images.filter((_, i) => i !== index));
                                    }}
                                >
                                    <Icon name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Order Name */}
                    <TextInput
                        placeholder="Order Name"
                        style={styles.input}
                        value={orderName}
                        onChangeText={setOrderName}
                    />

                    {/* Email */}
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    {/* Description */}
                    <TextInput
                        placeholder="Description of Items"
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}

                        multiline
                    />


                    {/* Movers */}
                    <TextInput
                        placeholder="Number of Movers Required"
                        style={styles.input}
                        value={movers}
                        onChangeText={setMovers}
                        keyboardType="numeric"
                    />

                    {/* Date Picker */}
                    <TouchableOpacity
                        style={styles.datePicker}
                        onPress={() => setDatePickerVisible(true)}
                    >
                        <Text style={styles.datePickerText}>
                            {date ? date.toDateString() : 'Select Date'}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePicker
                        isVisible={datePickerVisible}
                        mode="date"
                        onConfirm={(selectedDate) => {
                            setDate(selectedDate);
                            setDatePickerVisible(false);
                        }}
                        minimumDate={new Date()}
                        onCancel={() => setDatePickerVisible(false)}
                    />

                    {/* Time Picker */}
                    <TouchableOpacity
                        style={styles.datePicker}
                        onPress={() => setTimePickerVisible(true)}
                    >
                        <Text style={styles.datePickerText}>
                            {time ? time : 'Select Time'}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePicker
                        isVisible={timePickerVisible}
                        mode="time"
                        onConfirm={(selectedTime) => {
                            setTime(selectedTime.toLocaleTimeString());
                            setTimePickerVisible(false);
                        }}
                        onCancel={() => setTimePickerVisible(false)}
                    />

                    {/* Pickup Location Button */}
                    <TouchableOpacity 
                        style={styles.locationButton}
                        onPress={() => setShowPickupModal(true)}
                    >
                        <Text style={styles.locationButtonText}>
                            {pickupLocation ? pickupLocation.address : "Select Pickup Location"}
                        </Text>
                        <Icon name="place" size={24} color="#666" />
                    </TouchableOpacity>

                    {/* Dropoff Location Button */}
                    <TouchableOpacity 
                        style={styles.locationButton}
                        onPress={() => setShowDropoffModal(true)}
                    >
                        <Text style={styles.locationButtonText}>
                            {dropoffLocation ? dropoffLocation.address : "Select Dropoff Location"}
                        </Text>
                        <Icon name="place" size={24} color="#666" />
                    </TouchableOpacity>

                    {/* Location Picker Modals */}
                    <LocationPickerModal
                        visible={showPickupModal}
                        onClose={() => setShowPickupModal(false)}
                        onLocationSelect={(location) => {
                            setPickupLocation(location);
                            setShowPickupModal(false);
                        }}
                        title="Select Pickup Location"
                    />

                    <LocationPickerModal
                        visible={showDropoffModal}
                        onClose={() => setShowDropoffModal(false)}
                        onLocationSelect={(location) => {
                            setDropoffLocation(location);
                            setShowDropoffModal(false);
                        }}
                        title="Select Dropoff Location"
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isLoading && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Order</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        paddingBottom: 100,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    imagePicker: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePickerText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
    },
    imagePreview: {
        marginBottom: 16,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    deleteButton: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        fontSize: 16,
        minHeight: 45,
    },
    datePicker: {
        backgroundColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    datePickerText: {
        textAlign: 'center',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    locationButtonText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FurnitureForm;
