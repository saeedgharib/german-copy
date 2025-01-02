import React, { useState } from 'react'
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { View, StyleSheet, TextInput, Button, Pressable, Text, Alert,Image,SafeAreaView,Platform } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {Link, router} from 'expo-router'


const logo = require("../../assets/images/logo.jpg")

const LoginForm=({register,guide,reset,driver}) =>{

  const { signIn, setActive, isLoaded } = useSignIn();
const {isSignedIn} = useAuth()
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    setLoading(true);
    if (!isLoaded) {
      return;
    }
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password: password,
      });
      try {
        await setActive({ session: completeSignIn.createdSessionId });
        setLoading(false);
        
      } catch (error) {
        
      }
      console.log(isSignedIn);
      
    } catch (err) {
      alert("Email or Password is incorrect")
    }
    setLoading(false);
  };
    
  return (
    <SafeAreaView style={styles.container}>
        <Spinner visible={loading} />
    
        <Image source={logo} style={styles.image}  resizeMode='contain'/>
        
        
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputView}>
            <TextInput style={styles.input} placeholder='Email' value={emailAddress} onChangeText={setEmailAddress} autoCorrect={false}
        autoCapitalize='none' />
            <TextInput style={styles.input} placeholder='PASSWORD' secureTextEntry value={password} onChangeText={setPassword} autoCorrect={false}
        autoCapitalize='none'/>
        </View>
        <View style={styles.rememberView}>
            <View style={styles.switch}>
               
            </View>
            <View>
                <Pressable onPress={()=>reset()}>
                    <Text style={styles.forgetText}>Forgot Password?</Text>
                </Pressable>
            </View>
        </View>

        <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={()=>onSignInPress()}>
                <Text style={styles.buttonText}>LOGIN</Text>
                </Pressable>
                
        </View>
       
        

        <Text style={styles.footerText}>Don't Have Account?<Pressable onPress={()=>register()}><Text style={styles.signup}>  Sign Up</Text></Pressable></Text>
        <Pressable onPress={()=>driver()}><Text style={styles.signup}>  Tips</Text></Pressable>
       
    </SafeAreaView>
  )
}

export default LoginForm;

const styles = StyleSheet.create({
  container : {
    alignItems : "center",
    paddingTop: Platform.OS === "ios"?70:-10,
    
  },
  image : {
    height : 200,
    width : 320,
    paddingTop: Platform.OS === "ios"?250:240,
  },
  title : {
    fontSize : 30,
    fontWeight : "bold",
    textTransform : "uppercase",
    textAlign: "center",
    paddingVertical : 20,  
    color : "green"
  },
  inputView : {
    gap : 15,
    width : "100%",
    paddingHorizontal : 40,
    marginBottom  :5
  },
  input : {
    height : 50,
    paddingHorizontal : 20,
    borderColor : "green",
    borderWidth : 1,
    borderRadius: 7
  },
  rememberView : {
    width : "100%",
    paddingHorizontal : 50,
    justifyContent: "space-between",
    alignItems : "center",
    flexDirection : "row",
    marginBottom : 8
  },
  switch :{
    flexDirection : "row",
    gap : 1,
    justifyContent : "center",
    alignItems : "center"
    
  },
  rememberText : {
    fontSize: 13
  },
  forgetText : {
    fontSize : 14,
    color : "red",
    paddingVertical:10,
  },
  button : {
    backgroundColor : "#34eba4",
    height : 45,
    borderColor : "gray",
    borderWidth  : 1,
    borderRadius : 5,
    alignItems : "center",
    justifyContent : "center"
  },
  buttonG : {
    backgroundColor : "blue",
    height : 45,
    borderColor : "gray",
    borderWidth  : 1,
    borderRadius : 5,
    alignItems : "center",
    justifyContent : "center"
  },
  buttonText : {
    color : "white"  ,
    fontSize: 18,
    fontWeight : "bold"
  }, 
  buttonView :{
    width :"100%",
    paddingHorizontal : 50
  },
  optionsText : {
    textAlign : "center",
    paddingVertical : 10,
    color : "gray",
    fontSize : 13,
    marginBottom : 6
  },
  mediaIcons : {
    flexDirection : "row",
    gap : 15,
    alignItems: "center",
    justifyContent : "center",
    marginBottom : 23
  },
  icons : {
    width : 40,
    height: 40,
  },
  footerText : {
    textAlign: "center",
    color : "gray",
  },
  signup : {
    color : "red",
    fontSize : 13
  }
})