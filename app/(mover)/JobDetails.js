import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import DB from '../../database/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import MapScreen from '../../components/Companies/MapScreen';

const JobDetails = () => {
  const { jobId } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const fetchJobDetails = async () => {
    try {
      const jobDoc = await getDoc(doc(DB, 'furnitureOrders', jobId));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      } else {
        Alert.alert('Error', 'Job not found.');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to fetch job details.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const updateJobStatus = async (status) => {
    try {
      await updateDoc(doc(DB, 'furnitureOrders', jobId), {
        bookingStatus: status,
      });
      Alert.alert('Success', `Job status updated to ${status}.`);
      setJob(prev => ({ ...prev, status: status }));
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status.');
    }
  };
  console.log(job);
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{job.orderName}</Title>
          <Paragraph>Phone: {job.phoneNumber}</Paragraph>
          <Paragraph>Email: {job.email}</Paragraph>
          <Paragraph>Move Date: {job.date}</Paragraph>
          <Paragraph>Move Time: {job.time}</Paragraph>
          <Paragraph>Pickup Location: {job.pickupLocation?.address}</Paragraph>
          <Paragraph>Dropoff Location: {job.dropoffLocation?.address}</Paragraph>
          <Paragraph>Status: {job.status}</Paragraph>
        </Card.Content>
      <Button
            mode="contained"
            onPress={() => router.push(
              {
                pathname:'DriversList',
                params:{orderId:jobId}
              }
            ) }
            style={{margin:10,backgroundColor:'lightgreen'}}
          >
            Assign Driver
          </Button>
      </Card>
      <View style={styles.buttonsContainer}>
        
        {job.bookingStatus == 'booked' && (
          <Button
            mode="contained"
            onPress={() => updateJobStatus('in-progress')}
            style={styles.button}
          >
            Start Job
          </Button>
        )}
        {job.bookingStatus === 'in-progress' && (
          <Button
            mode="contained"
            onPress={() => updateJobStatus('completed')}
            style={styles.button}
          >
            Complete Job
          </Button>
        )}
       
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Back
        </Button>
      </View>
      {job && <MapScreen job={job} />}
    </View>
  );
};

export default JobDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  card: {
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
