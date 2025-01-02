import React, { useEffect,useState } from 'react'
import { View,ScrollView,FlatList,Image ,StyleSheet, Pressable,TouchableOpacity} from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { getDocs,collection } from 'firebase/firestore';
import DB from '../../database/firebaseConfig';
import { Card, Text, Title, DataTable, Button, Divider ,Paragraph,Avatar} from 'react-native-paper';
import { Link, router, useRouter } from 'expo-router';
import { Ionicons,FontAwesome } from '@expo/vector-icons';

import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'







const key='sk_test_CPes7EdioH5zt6FigGv5cN9hovQextyohqQam2xwAB';


const UserCard = ({ person, onDelete, onBan }) => {
  const renderRightActions = (progress, dragX) => (
    <TouchableOpacity onPress={() => onDelete(person.id)} style={styles.deleteButton}>
      <Ionicons name="trash" size={24} color={'#fff'}></Ionicons>
      <Text style={styles.buttonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (progress, dragX) => (
    <TouchableOpacity onPress={() => onBan(person.id)} style={styles.banButton}>
      <FontAwesome name="ban" size={24} color="white" />
      <Text style={styles.buttonText}>Ban</Text>
    </TouchableOpacity>
  );

  return (
    <>
    {person.unsafe_metadata.role=='user'?
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
    >
  <Pressable onPress={()=>{router.push({pathname:'[userid]',params:{userId:person?.id}})}}>

      {/* <View style={styles.card}>
      <Image  source={{uri:person?.image_url}} style={{height:30,width:30, borderRadius:50}}  />
        <Text style={styles.cardText}>{"  "+person.first_name+" "+person.last_name} </Text>
        <Text style={{color:'blue'}}>{"          "+person.email_addresses[0]?.email_address }</Text>
        
      </View> */}
      <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          // style={{flexDirection: 'row', alignItems: 'center'}}
  titleStyle={{width:'90rem'}} // Allow wrapping of the text
  subtitleStyle={{}}

          title={`${person.first_name} ${person.last_name}` }
          subtitle={`Email: ${person.email_addresses[0]?.email_address}`}
          left={() => (
            // <Avatar.Image
            //   size={100}
            //   source={{ uri: person.image_url|| 'https://www.gravatar.com/avatar?d=mp' }}
            //   style={styles.avatar}
            // />
            <Image  source={{uri:person?.image_url}} style={{height:50,width:50, borderRadius:50}}  />
          )}
        />
        <Card.Content>
          <Title>Account Information</Title>
          <Paragraph>Created At: {new Date(person.created_at).toLocaleDateString()}</Paragraph>
          <Paragraph>Last Active: {new Date(person.last_active_at).toLocaleDateString()}</Paragraph>
          <Paragraph>Last Sign-In: {new Date(person.last_sign_in_at).toLocaleDateString()}</Paragraph>
          <Paragraph>Role: {person.unsafe_metadata.role}</Paragraph>
        </Card.Content>
        <Card.Actions>
          {/* <Text style={styles.status}>Image Available: {has_image ? 'Yes' : 'No'}</Text> */}
        </Card.Actions>
      </Card>
    </View>
</Pressable>
    </Swipeable>
    :null
    }
    </>
  );
};



const Admin = () => {
const [users, setUsers] = useState([]);
const {user}=useUser()

const [companies, setCompanies] = useState([]);






const fetchUsers = async () => {


  try {
    const response = await fetch('https://api.clerk.dev/v1/users', {
      method: 'GET',
      headers: {
        'Authorization':`Bearer ${key}` , // Replace with your actual API key or JWT
        'Content-Type': 'application/json',
      },
    });
    const usersData = await response.json();
    console.log(usersData);
    setUsers(usersData); 
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};


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
useEffect(() => {
  // Dummy data for companies
 
  fetchCompanies();
  fetchUsers();
  // Dummy data for order history
  
}, []);


const renderItem = ({ item }) => (
  <UserCard person={item} onDelete={deleteUser} onBan={banUser} />
);

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${key}` ,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      console.log('User deleted successfully');
      fetchUsers();
    } else {
      console.error('Error deleting user:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const banUser = async (userId) => {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${key}` ,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        private_metadata: { banned: true },
      }),
    });
    if (response.ok) {
      console.log('User banned successfully'); 
      fetchUsers();
    } else {
      console.error('Error banning user:', response.statusText);
    }
  } catch (error) {
    console.error('Error banning user:', error);
  }
};

  return (
    <GestureHandlerRootView style={styles.container}> 



<View style={{ padding: 20 }} >

<Title style={{fontWeight:'bold',color:'#000'}}>Manage Users</Title>
<Title style={{ fontWeight: "bold", color: "#000" ,position:'absolute',marginTop:10,marginLeft:'75%'}}>
          <Button icon="plus" mode="contained" onPress={() => router.push('/AddUser')} textColor="white" style={{backgroundColor:'black'}} >
    User
  </Button>
          </Title>
  <Divider />
  <Divider />
 
<FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
     
    />

</View>

</GestureHandlerRootView>
  )
}

export default Admin

const styles = StyleSheet.create({
  container:{
    backgroundColor:'transparent',
  },
    card1: {
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
    card: {
      flex:1,
      flexDirection:'row',
      flexWrap: 'wrap',
      backgroundColor: '#fff',
      // backgroundColor: '#030d1c',
      padding: 25,
      marginVertical: 10,
      marginHorizontal: 5,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 10,
      elevation: 5,
      
      alignItems: 'center',
      // height: '100%',
    },
    cardText: {
      fontSize: 18,
      color: '#000',
    },
    deleteButton: {
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      width: 75,
      // height: '100%',
      marginVertical: 10,
    },
    banButton: {
      backgroundColor: 'orange',
      justifyContent: 'center',
      alignItems: 'center',
      width: 75,
      // height: '100%',
      marginVertical: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },


  avatar: {
    margin: 8,
  },


  
  });