import { useAuth, useUser } from '@clerk/clerk-expo'
import React from 'react'
import { Pressable, Text } from 'react-native'
import { Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons';
const driverHome = () => {
   const LogoutButton = () => {
    const { signOut } = useAuth();
  
    const doLogout = () => {
      signOut();
    };
     
  
    return (
      <Pressable onPress={doLogout} style={{ marginRight: 10 }}>
        <Ionicons name="log-out-outline" size={24} color={'#000'} />
      </Pressable>
    );
  };
  const {user}=useUser()
  return (  
    <>

    <Text>Hello Driver</Text>
    <Text>Hello {user?.emailAddresses[0]?.emailAddress}</Text>
    <LogoutButton/>
    </>
  )
}

export default driverHome
