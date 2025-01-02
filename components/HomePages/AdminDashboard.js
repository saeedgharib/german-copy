import React from 'react'
import { StyleSheet,  View, Image, TouchableOpacity, ScrollView } from 'react-native'
import { Card, Text, Title, DataTable, Button, Divider } from 'react-native-paper';
import { useAuth, useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router';
import { Redirect } from 'expo-router';

export default AdminDashboard = () => {
    const {user}=useUser();
    const { signOut } = useAuth()
    const { isSignedIn } = useAuth();
  
    console.log(isSignedIn);
    
  
    const doLogout = async() => {
      
      await signOut()
      // router.replace("/public/Login");
      console.log("User logged out");
    };
      return (
    <ScrollView>
<View style={{ padding: 20 }}>
  <Title>Hello Admin,<Title style={{fontWeight:'bold',color:'#000'}}>{user?.fullName.toLocaleUpperCase()}</Title></Title>
  <Divider bold={true}  />
  {/* <Title style={{fontWeight:'bold',color:'green'}}>Registered Companies</Title> */}
  <Divider />
  </View>
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuBox} onPress={()=>router.push('/Users' )}>
      <Image
  style={styles.icon}
  source={{ uri: 'https://img.icons8.com/?size=100&id=psevkzUhHRTs&format=png&color=000000' }}
  defaultSource={require('../../assets/images/logo.jpg')}
/>
        <Text style={styles.info}>Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox} onPress={()=>router.push('/ManageMovers')}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://img.icons8.com/color/70/000000/administrator-male.png' }}
        />
        <Text style={styles.info}>Manage Movers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox} onPress={()=>router.push('OrderStats' )}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://img.icons8.com/color/70/000000/pie-chart.png' }}
        />
        <Text style={styles.info}>Stats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox}  onPress={()=>router.push('ShowTransactions' )}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://img.icons8.com/?size=100&id=Tys9Kx3DE6tD&format=png&color=000000' }}
        />
        <Text style={styles.info}>Transactions
        </Text>
      </TouchableOpacity>
{/* 
      <TouchableOpacity style={styles.menuBox}>
        <Image
          style={styles.icon}
          // source={{ uri: 'https://img.icons8.com/color/70/000000/product.png' }}
        />
        <Text style={styles.info}>...</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox}>
        <Image
          style={styles.icon}
          // source={{ uri: 'https://img.icons8.com/color/70/000000/traffic-jam.png' }}
        />
        <Text style={styles.info}>...</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox}>
        <Image
          style={styles.icon}
          // source={{ uri: 'https://img.icons8.com/dusk/70/000000/visual-game-boy.png' }}
        />
        <Text style={styles.info}>...</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.menuBox}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://img.icons8.com/color/70/000000/user.png' }}
        />
        <Text style={styles.info}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBox} onPress={doLogout}>
        <Image
          style={styles.icon}
          source={{ uri: 'https://img.icons8.com/?size=100&id=8119&format=png&color=ffffff' }}
        />
        <Text style={styles.info}>Log Out</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuBox: {
    // backgroundColor: '#DCDCDC',
    backgroundColor: '#030d1c',
    borderRadius:20,
    width: 180,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowOffset: { width: 1, height: 2 },
  },
  icon1: {
    width: 60,
    height: 60,
    padding:40,
    marginBottom:20,
  },
  icon: {
    width: 100,
    height: 10,
    padding:40,
    marginBottom:20,
    
  },
  info: {

    fontSize: 22,
    fontWeight:'bold',
    // color: '#696969',
    color:"#fff",
  },
})

        