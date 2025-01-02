import React, { useEffect, useState } from "react";
import { StyleSheet, View, Animated, Dimensions } from "react-native";
import {
  Card,
  Text,
  Chip,
  Avatar,
  Button,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import {
  doc,
  getDocs,
  collection,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DB from "../../database/firebaseConfig";

const { width } = Dimensions.get("window");

const DriverCard = React.memo(({ item, index, onAssign, assigning }) => {
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarSection}>
            <Avatar.Icon
              size={60}
              icon="account"
              style={styles.avatar}
              color="#fff"
              backgroundColor={item.isAvailable ? "#2196F3" : "#9E9E9E"}
            />
            <View style={styles.nameSection}>
              <Text variant="titleLarge" style={styles.name}>
                {item.name}
              </Text>
              <Chip
                icon={item.isAvailable ? "check-circle" : "clock"}
                style={[
                  styles.statusChip,
                  { backgroundColor: item.isAvailable ? "#E3F2FD" : "#FAFAFA" },
                ]}
              >
                {item.isAvailable ? "Available" : "Busy"}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Chip icon="phone" style={styles.chip} textStyle={styles.chipText}>
            {item.phone}
          </Chip>
          <Chip icon="car" style={styles.chip} textStyle={styles.chipText}>
            {item.vehicleType || "Standard"}
          </Chip>
          <Chip icon="star" style={styles.chip} textStyle={styles.chipText}>
            {item.rating || "4.5"} ★
          </Chip>
        </View>

        <Button
          mode="contained"
          onPress={() => onAssign(item)}
          loading={assigning}
          disabled={assigning || !item.isAvailable}
          style={[styles.button, !item.isAvailable && styles.disabledButton]}
          labelStyle={styles.buttonLabel}
        >
          {item.isAvailable ? "Assign Driver" : "Currently Unavailable"}
        </Button>
      </Surface>
    </Animated.View>
  );
});

const DriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const params = useLocalSearchParams();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([fetchDrivers(), fetchOrder()]).finally(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const fetchOrder = async () => {
    try {
      const docRef = doc(DB, "furnitureOrders", params.orderId); // Use doc for a specific document
      const orderSnapshot = await getDoc(docRef);

      if (orderSnapshot.exists()) {
        console.log("Order Data:", orderSnapshot.data());
        setOrderDetails(orderSnapshot.data()); // This will contain the data in the document
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching Order:", error);
    }
  };
  const fetchDrivers = async () => {
    try {
      const query = await getDocs(collection(DB, "drivers"));
      const driversData = query.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching Drivers:", error);
    }
  };

  const handleAssignDriver = async (driver) => {
    setAssigning(true);
    try {
      await updateDoc(doc(DB, "furnitureOrders", params.orderId), {
        assignedDriver: {
          name: driver.name,
          phone: driver.phone,
          licenseUrl: driver.licenseUrl,
          driverId: driver.id,
        },
        isDriverAssigned: true,
        assignmentDate: new Date().toISOString(),
      });

      // Update driver document
      await updateDoc(doc(DB, "drivers", driver.id), {
        isAvailable: false,
        assignedJob: {
          jobId: params.orderId,
          assignmentDate: new Date().toISOString(),
          orderDetails: {
            pickupLocation: { ...orderDetails?.pickupLocation },
            deliveryLocation: { ...orderDetails?.dropoffLocation },
            customerName: orderDetails?.orderName,
            orderDescription: orderDetails?.description,
          },
        },
      });

      router.back();
    } catch (error) {
      console.error("Error assigning driver:", error);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim }, styles.content]}>
        <Text variant="headlineMedium" style={styles.title}>
          Available Drivers
        </Text>
        <FlatList
          data={drivers}
          renderItem={({ item, index }) => (
            <DriverCard
              item={item}
              index={index}
              onAssign={handleAssignDriver}
              assigning={assigning}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    paddingHorizontal: 16,
    marginBottom: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  detailsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: "#F5F5F5",
  },
  chipText: {
    color: "#424242",
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#2196F3",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 8,
  },
});

export default DriversList;
