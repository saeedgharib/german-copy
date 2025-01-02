import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import DB from '../../database/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { router, useRouter } from 'expo-router';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { useUser} from '@clerk/clerk-expo';

const Dashboard = () => {
  const [moverData, setMoverData] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState([]);

  const {user}=useUser()
  let jobId

  const fetchMoverData = async () => {
    if (user) {
      try {
        const q = query(collection(DB, "companies"), where("username", "==", user?.username));
        const querySnapshot = await getDocs(q);

        const moverData = [];
        querySnapshot.forEach((doc) => {
          // Append the document data to the moverData array
          moverData.push({ id: doc.id, ...doc.data() });
          console.log(doc.id, " => ", doc.data());
          jobId=doc.id;
        });

        if (moverData.length > 0) {
          // Assuming you only expect one matching document
          setMoverData(moverData[0]);
        } else {
          console.log('No matching company found');
        }

        fetchAssignedJobs()
      } catch (error) {
        console.error('Error fetching mover data:', error);
      }
    }
  };
  const fetchAssignedJobs = async () => {

    if (user) {
      const jobsRef = collection(DB, 'furnitureOrders');
      const q = query(jobsRef, where('moverId', '==',jobId));
      const querySnapshot = await getDocs(q);

      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(jobs);

      setAssignedJobs(jobs);
    }
  };

  useEffect(() => {

    fetchMoverData();
    // fetchAssignedJobs();
  }, []);

  const handleJobPress = (jobId) => {
    router.push(`JobDetails?jobId=${jobId}`);
  };

  const handleProfile = () => {
    router.push('MoverProfile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>Welcome, {moverData?.companyName || 'Mover'}</Title>
        <Button mode="contained" onPress={handleProfile} style={styles.button}>
          Profile
        </Button>

      </View>
      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        data={assignedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleJobPress(item.id)}>
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.orderName}</Title>
                <Paragraph>Move Date: {item.date}</Paragraph>
                <Paragraph>Move Time: {item.time}</Paragraph>
                <Paragraph>Status: {item.status}</Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No assigned jobs.</Text>}
      />

    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginRight: 10,
  },
  addButton: {
    marginTop: 20,
  },
});

