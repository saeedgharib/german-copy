import React,{useEffect,useState} from 'react';
import { Avatar, Card, IconButton } from 'react-native-paper';
import DB from '../../database/firebaseConfig';
import {Button, Image, Pressable, StyleSheet, View} from 'react-native'
import {doc,getDocs,collection, where, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const DriversList=()=>{

    const [drivers, setDrivers] = useState([])
    const [orderDetails, setOrderDetails] = useState([])
   
  const params=useLocalSearchParams()
console.log(params.orderId);
let orderId = params.orderId
    const fetchDrivers = async() =>{
        try {
            const query = await getDocs(collection(DB,"drivers"));
      
            const driverssData = query.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("Company Data: ", driverssData);
            setDrivers(driverssData);
          } catch (error) {
            console.error("Error fetching Drivers: ", error);
          }
}
useEffect(() => {
    fetchDrivers();
    fetchOrder();
},[])

const fetchOrder = async () => {
  try {
    const docRef = doc(DB, "furnitureOrders", params.orderId); // Use doc for a specific document
    const orderSnapshot = await getDoc(docRef);

    if (orderSnapshot.exists()) {
      console.log("Order Data:", orderSnapshot.data());
      setOrderDetails(orderSnapshot.data()) // This will contain the data in the document
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching Order:", error);
  }
};

const AssignDriver = async (driver) => {
  const jobId =params.orderId ; 
  console.log(jobId);
  // Replace with the specific order ID or pass it as a prop
  const orderRef = doc(DB,"furnitureOrders", jobId);
  try {
    await updateDoc(orderRef, {
    assignedDriver: {
      name: driver.name,
      phone: driver.phone,
      licenseUrl: driver.licenseUrl, // Include other relevant driver info here
      driverId: driver.id, // Optional: driver ID if needed
    }
  });
  
  await sendEmail()
} catch (error) {
  console.log("Error updating"+error)
}

}
const sendEmail = async () => {
  const emailData = {
    to: 'maliksaeed54321@gmail.com',
    subject: 'Job Assignment',
    html: '<p>Your order has been processed successfully!</p>',
  };

  try {
    const response = await fetch('https://resend-server-eight.vercel.app/api/index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Email sent successfully:', result);
    } else {
      console.error('Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const DriverCard = ({item}) => (

  

  <TouchableOpacity onPress={()=>AssignDriver(item)}>

  <Card.Title
  style={styles.card}
    title={item.name}
    titleStyle={styles.title}
    subtitle={"Contact No:"+item.phone}
    
    left={(props) => <FontAwesome name="user" size={48} color="lightgreen" />}
    // right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => {}} />}
    // right={()=> <Card.Cover source={{ uri: item.licenseUrl }} />}
  />
   
  </TouchableOpacity>

    

);



return(
    <GestureHandlerRootView>

    <FlatList
    data={drivers}
    renderItem={DriverCard}
    keyExtractor={(item) => item.id}
  />
     </GestureHandlerRootView>
)


  
};



const styles = StyleSheet.create({
  card:{
    backgroundColor:"white",
    margin: 10,
    borderRadius:12,
    borderWidth:1,
    borderColor: "grey",
    elevation:2,
    fontWeight:'bold',
  },
  title:{
fontWeight:'bold',
  }
});
export default DriversList;