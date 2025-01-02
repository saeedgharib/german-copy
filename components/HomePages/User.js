import React, { useEffect,useRef,useState } from 'react'
import { View,ScrollView,FlatList,Image ,StyleSheet, Pressable, TouchableOpacity} from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { getDocs,collection } from 'firebase/firestore';
import DB from '../../database/firebaseConfig';
import { Card, Text, Title, DataTable, Button, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationScreen from '../../app/(users)/(tabs)/NotificationScreen';

const User = () => {

const {user}=useUser()

const [companies, setCompanies] = useState([]);
const [orderHistory, setOrderHistory] = useState([]);

const fetchCompanies = async () => {
    try {
    
      const querySnapshot = await getDocs(collection(DB,"companies")); 

const companyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
console.log("Company Data: ", companyData);
setCompanies(companyData);
    } catch (error) {
      console.error("Error fetching companies: ", error);
    }
  };
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  useEffect(() => {
    // Handle notifications when app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        // You can add custom handling here
    });

    // Handle notifications when app is in background
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Background notification:', response);
        // You can add navigation to order details here
    });

    return () => {
        subscription.remove();
        backgroundSubscription.remove();
    };
}, []);

const fetchOrders = async () => {
  try {
  
    const querySnapshot = await getDocs(collection(DB,"furnitureOrders")); 

const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
console.log("Orders Data: ", ordersData);
setOrderHistory(ordersData);
  } catch (error) {
    console.error("Error fetching companies: ", error);
  }
};
useEffect(() => {
  // Dummy data for companies
 
  fetchCompanies();
  fetchOrders();
  // Dummy data for order history
  // const dummyOrders = [
  //   { id: '1001', date: '2023-01-01', status: 'Delivered'},
  //   { id: '1002', date: '2023-01-05', status: 'Shipped' },
  //   { id: '1003', date: '2023-01-10', status: 'Pending'},
  // ];
  // setOrderHistory(dummyOrders);
}, []);

const renderCompanyCard = ({ item }) => (
    <Pressable >
    

  <Card style={styles.card} onPress={()=>router.push({pathname:'CompanyDetails',params:{id:item.id}})}>
    <Card.Content >
    <Image  source={{uri:item.logo}} style={styles.logo} />
      <Title>{item.companyName}</Title>
      <Text>{item.summary}</Text>
    </Card.Content>
  </Card>
    
    </Pressable>
);

const [isModalVisible, setModalVisible] = useState(false);

const toggleModal = () => {
  setModalVisible(!isModalVisible);
};
  return (

<ScrollView>

<View style={{ padding: 20 }}>
  <Title>Hello, <Title style={{fontWeight:'bold',color:'green'}}>{user?.fullName}</Title></Title>
  <Divider />
  <FlatList
    data={companies}
    renderItem={renderCompanyCard}
    keyExtractor={item => item.id}
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginVertical: 20 }}
  />


  <Title>Previous Order History</Title>
  <DataTable>
    <DataTable.Header>
      <DataTable.Title >Order ID</DataTable.Title>
      <DataTable.Title>Date</DataTable.Title>
      <DataTable.Title>Status</DataTable.Title>
    </DataTable.Header>
    {orderHistory.map(order => (
      <DataTable.Row key={order.id}>
        <DataTable.Cell>{order.id.slice(0,8)}..</DataTable.Cell>
        <DataTable.Cell>{order.date.slice(0,10)}</DataTable.Cell>
        <DataTable.Cell>{order.status}</DataTable.Cell>
      </DataTable.Row>
    ))}
  </DataTable>
</View>
<View style={styles.iconContainer}>
<TouchableOpacity onPress={toggleModal}  >

<MaterialIcons name="notifications-on" size={24} color="green" />
</TouchableOpacity>
</View>
<NotificationScreen isVisible={isModalVisible} onClose={toggleModal} />
</ScrollView>
  )
}

export default User

const styles = StyleSheet.create({
    card: {
      margin: 10,
      height: 210,
      width: 170,
      // overflow: 'hidden',
    },
    logo: {
      width: 120,
      height: 100,
      alignSelf: 'center',
      marginBottom: 10,
    },
    title: {
      textAlign: 'center',
      marginBottom: 10,
    },
    iconContainer: {
      position: 'absolute',
      bottom: 20, // Position 20px from the bottom
      right: 20,  // Position 20px from the right
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 30, // Make it circular
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 5, // For Android shadow
    },
  });