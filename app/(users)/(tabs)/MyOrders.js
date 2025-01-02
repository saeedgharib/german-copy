import React from 'react'
import Order from '../../../components/Orders/order'
import { router } from 'expo-router'
import { addDoc,collection } from 'firebase/firestore'
import DB from '../../../database/firebaseConfig'
import FurnitureForm from '../../../components/Orders/createOrder'
const MyOrders = () => {
  
  const ProceedNext=(formData) => {

      try {
        
          router.push({
            pathname:'SetPackageLocation',
            params: formData
          })
      } catch (error) {
          console.log(error);
      }
    
  
    
  }
  return (
    // <Order proceed={ProceedNext}/>
    <FurnitureForm />
  )
}

export default MyOrders
