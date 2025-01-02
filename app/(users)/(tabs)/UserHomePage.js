import React from 'react'

import User from '../../../components/HomePages/User';
import DB from '../../../database/firebaseConfig';
import { addDoc, collection,doc, setDoc } from 'firebase/firestore';


const UserHomePage = () => {
  // const companiesData = [
  //   {
  //     id: '1',
  //     logo: 'https://www.allied.com/images/logos/allied-van-lines-logo.jpg',
  //     name: 'Allied Van Lines',
  //     description: 'Professional moving services for residential and commercial needs.',
  //     summary: 'Trusted movers since 1928.'
  //   },
  //   {
  //     id: '2',
  //     logo: 'https://www.bekins.com/wp-content/uploads/2021/05/logo.png',
  //     name: 'Bekins Moving Solutions',
  //     description: 'Providing expert moving services nationwide.',
  //     summary: 'Moving made easy.'
  //   },
  //   {
  //     id: '3',
  //     logo: 'https://www.mayflower.com/sites/default/files/logo_0.png',
  //     name: 'Mayflower',
  //     description: 'Full-service moving company offering a wide range of moving services.',
  //     summary: 'America’s most trusted mover.'
  //   },
  //   {
  //     id: '4',
  //     logo: 'https://www.moving.com/wp-content/themes/moving/images/logo-navy.svg',
  //     name: 'Moving.com',
  //     description: 'Comprehensive moving services for local and long-distance moves.',
  //     summary: 'Your moving resource.'
  //   },
  //   {
  //     id: '5',
  //     logo: 'https://www.northamerican.com/images/Logos/NALVanLogo-200x200.jpg',
  //     name: 'North American Van Lines',
  //     description: 'Offering professional moving and storage solutions.',
  //     summary: 'Moving your way.'
  //   },
  //   {
  //     id: '6',
  //     logo: 'https://moving.baymeadows.com/wp-content/uploads/2017/06/united-van-lines.jpg',
  //     name: 'United Van Lines',
  //     description: 'Leading moving company providing personalized moving services.',
  //     summary: 'Moving you forward.'
  //   },
  //   {
  //     id: '7',
  //     logo: 'https://www.uhaul.com/about/images/uhaulco_logo.png',
  //     name: 'U-Haul',
  //     description: 'Offering moving truck and trailer rentals, self-storage, and packing supplies.',
  //     summary: 'Your moving and storage resource.'
  //   },
  //   {
  //     id: '8',
  //     logo: 'https://two-men-and-a-truck-development.cdn.prismic.io/two-men-and-a-truck-development/06f6eab6-4a78-4b7f-a63c-3514eb08f74f_logo.png',
  //     name: 'Two Men and a Truck',
  //     description: 'Providing local and long-distance moving services for homes and businesses.',
  //     summary: 'Movers who care.'
  //   },
  //   {
  //     id: '9',
  //     logo: 'https://s3.amazonaws.com/moving-assets/logo-large.png',
  //     name: 'Gentle Giant',
  //     description: 'Offering moving and storage services with a focus on customer satisfaction.',
  //     summary: 'Big or small, we move it all.'
  //   },
  //   {
  //     id: '10',
  //     logo: 'https://abcmoving.com/wp-content/uploads/2020/10/ABC-Logo-Home-2020.png',
  //     name: 'ABC Moving & Storage',
  //     description: 'Providing full-service moving and storage solutions.',
  //     summary: 'Your local and long-distance movers.'
  //   }
  // ];

  // const addCompaniesToFirestore = async () => {
  //   try {
  //     for (let i = 0; i < 9; i++) {
  //       const company = companiesData[i];
  //       await setDoc(doc(DB,"companies",company.id),company)
          
  //     }
    
      

  //     console.log('Companies added to Firestore successfully!');
  //   } catch (error) {
  //     console.error('Error adding companies to Firestore: ', error);
  //   }
  // };

  return (
<User />
  )
}

export default UserHomePage
