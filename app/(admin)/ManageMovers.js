import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Linking
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { getDocs, collection } from "firebase/firestore";
import DB from "../../database/firebaseConfig";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Card,
  Text,
  Title,
  DataTable,
  Button,
  Divider,
  Paragraph,
  Avatar,
} from "react-native-paper";
import { Link, router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

import {

    GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import StarRating from "./Stars";

const key = "sk_test_CPes7EdioH5zt6FigGv5cN9hovQextyohqQam2xwAB";

const MoverCard = ({ mover, onDelete, onBan }) => {
    // const LeftContent = props => <Avatar.Icon {...props} icon={mover?.logo} />
    const LeftContent = props => <Avatar.Image size={50} source={{uri: mover?.logo}} />

  const renderRightActions = (progress, dragX) => (
    <TouchableOpacity
      onPress={() => onDelete(mover.id)}
      style={styles.deleteButton}
    >
      <Ionicons name="trash" size={24} color={"#fff"}></Ionicons>
      <Text style={styles.buttonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (progress, dragX) => (
    <TouchableOpacity onPress={() => router.push({
        pathname: "[userid]",
        params: { userId: mover?.id },
      })} style={styles.banButton}>
      {/* <FontAwesome name="ban" size={24} color="white" /> */}
      <MaterialIcons name="edit" size={24} color="white" />
      <Text style={styles.buttonText}>Edit</Text>
    </TouchableOpacity>
  );


  return (
   
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
        >
          <Pressable
            onPress={() => {
              router.push({
                pathname: "[userid]",
                params: { userId: mover?.id },
              });
            }}
          >
            <View style={styles.container}>
            <Card key={mover?.id} style={{ margin: 10 }}>
          <Card.Content>
            <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
            <Title style={{fontWeight:'bold'}}>{mover.companyName}</Title>
      <StarRating moverRating={mover.rating} />
      
    </View>
            <Paragraph style={{fontWeight:'bold'}} >Contact: <Text>{mover.phoneNumber}</Text></Paragraph>
            <Paragraph style={{fontWeight:'bold'}}>Email: <Text style={{color:'blue'}}>{mover.email}</Text></Paragraph>
            <Paragraph style={{fontWeight:'bold'}}>Business License: <Text>{mover.businessLicense}</Text></Paragraph>
            {/* <Paragraph>Insurance: {mover.insuranceDetails}</Paragraph> */}
          </Card.Content>
          <Card.Actions>
          <TouchableOpacity 
              style={styles.button} 
              onPress={() => Linking.openURL(mover.businessLicenseDoc)}
            >
              <Text style={styles.buttonText}>View Business License</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button} 
              onPress={() => Linking.openURL(mover.insuranceDoc)}
            >
              <Text style={styles.buttonText}>View Insurance Document</Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>
            </View>
          </Pressable>
        </Swipeable>

  );
};

const ManageMovers = () => {
  const [movers, setMovers] = useState([]);


  // const fetchMoversfromClerk = async () => {

  //   try {
  //     const response = await fetch('https://api.clerk.dev/v1/users', {
  //       method: 'GET',
  //       headers: {
  //         'Authorization':`Bearer ${key}` , // Replace with your actual API key or JWT
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     const MoversData = await response.json();
    
  //     console.log(MoversData);
  //     setMovers(MoversData);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // };

  const fetchMoversfromDB = async () => {
    try {
      const querySnapshot = await getDocs(collection(DB, "companies"));

      const moversData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Company Data: ", moversData);
      setMovers(moversData);
    } catch (error) {
      console.error("Error fetching Movers: ", error);
    }
  };

  useEffect(() => {
    
    fetchMoversfromDB();
  }, []);

  const renderItem = ({ item }) => (
    <MoverCard mover={item} onDelete={deleteMover} onBan={banMover} />
  );

  const deleteMover = async (userId) => {
    try {
      const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("Mover deleted successfully");
        fetchMoversfromDB();
      } else {
        console.error("Error deleting Mover:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting Mover:", error);
    }
  };

  const banMover = async (userId) => {
    try {
      const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          private_metadata: { banned: true },
        }),
      });
      if (response.ok) {
        console.log("Mover banned successfully");
        fetchMoversfromDB();
      } else {
        console.error("Error banning Mover:", response.statusText);
      }
    } catch (error) {
      console.error("Error banning Mover:", error);
    }
  };

  return (
<GestureHandlerRootView>

      <View style={{ padding: 20 }}>
      

      <Title style={{fontWeight:'bold',color:'#000'}}>Manage Movers</Title>
      <Title style={{ fontWeight: "bold", color: "#000" ,position:'absolute',marginTop:10,marginLeft:'75%'}}>
          <Button icon="plus" mode="contained" onPress={() => router.push('AddMover')} textColor="white" style={{backgroundColor:'black'}} >
    Mover
  </Button>
          </Title>
 
      
        <Divider />

        <FlatList
          data={movers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
</GestureHandlerRootView>
 
  );
};

export default ManageMovers;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  card1: {
    margin: 10,
    height: 210,
    width: 170,
    // overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius:50,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    
    backgroundColor: "#fff",
    // backgroundColor: '#030d1c',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,

    // alignItems: "center",
    // height: '100%',
  },
  cardText: {
    fontSize: 18,
    color: "#000",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    // height: '100%',
    marginVertical: 10,
  },
  banButton: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    // height: '100%',
    marginVertical: 10,
  },
  // buttonText: {
  //   color: "#fff",
  //   fontWeight: "bold",
  // },

button: {
    backgroundColor: '#000', // Match button color to your theme
    padding: 5,
    flex:1,
    borderRadius: 5,
    marginBottom: 10, // Add space between buttons
    width: '40%', // Make the button full-width to ensure text wraps
    alignItems: 'center', // Center the text inside the button
  },
  buttonText: {
    color: 'white',
    textAlign: 'center', // Center-align the text within the button
    flexWrap: 'wrap',
    fontWeight:'bold' // Allow text to wrap inside the button
  },

 
});
