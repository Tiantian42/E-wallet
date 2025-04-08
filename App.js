import { StyleSheet, AsyncStorage } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './AppContext';
import { registerForPushNotificationsAsync, presentNotificationAsync } from 'expo-notifications';
import { auth, firebase } from './firebase';
import { onSnapshot } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import LoginScreen from './screens/LoginScreen';
import MainDashboard from './screens/MainDashboard';
import SendCash from './screens/SendCash';
import ScanQR from './screens/ScanQR';
import EditProfile from './screens/EditProfile';
import Currency from './screens/Currency';
import Registrationpage from './screens/Registrationpage';
import Logs from './screens/Logs';
import Receive from './screens/Receive';
import GetStarted from './screens/GetStarted';
import Profile from './screens/Profile';
import Others from './screens/Others';
import NotificationsScreen from './screens/Notifications';
import TopUpScreen from './screens/TopUpScreen';
import SevenConnect from './screens/PaymentMethods/SevenConnect';
import GrabPayPH from './screens/PaymentMethods/GrabPayPH';
import GCash from './screens/PaymentMethods/GCash';
import BDO from './screens/PaymentMethods/BDO';
import BPI from './screens/PaymentMethods/BPI';
import LandBank from './screens/PaymentMethods/LandBank';
import Paymaya from './screens/PaymentMethods/Paymaya';
import Paypal from './screens/PaymentMethods/Paypal';
import ShopeePay from './screens/PaymentMethods/ShopeePay';
import UnionBank from './screens/PaymentMethods/UnionBank';
import * as Permissions from 'expo-permissions';


const Stack = createNativeStackNavigator();

export default function App() {
 
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [logInfo, setLogs] = useState([]);
  const [notificationTapped, setNotificationTapped] = useState(false);
  const [notifiedMessages, setNotifiedMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);
  const [fontsLoaded, error] = useFonts({ 
    Poppins_regular: require("./assets/fonts/Poppins_regular.ttf"),
    Poppins_medium: require("./assets/fonts/Poppins_medium.ttf"),
    Poppins_semibold: require("./assets/fonts/Poppins_semibold.ttf"),
    Poppins_bold: require("./assets/fonts/Poppins_bold.ttf"),
    Lato_regular: require("./assets/fonts/Lato_regular.ttf"),
    Lato_semibold: require("./assets/fonts/Lato_semibold.ttf"),
  });



  useEffect(() => {
    const checkNotification = async () => {
      const lastNotifiedMessageId = await AsyncStorage.getItem('lastNotifiedMessageId');
      
      if (latestMessage && latestMessage.id !== lastNotifiedMessageId) {
        sendNotification(
          latestMessage.transactions,
          latestMessage.SenderEmail,
          latestMessage.Note
        );
        sendPushNotification({ message: 'New message' });
        
        AsyncStorage.setItem('lastNotifiedMessageId', latestMessage.id);
      }
    };
    
    checkNotification();
  }, [latestMessage]);

  
  useEffect(() => {
    const user = auth.currentUser?.uid || auth.currentUser;
    if (user) {
      const uid = user;
      const todoRef = firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('notes')
        .doc('messages')
        .collection('receivedMessages')
        .orderBy('Timestamp', 'desc'); // Order the documents by timestamp in descending order
      const unsubscribe = onSnapshot(todoRef, (querySnapshot) => {
        const logs = querySnapshot.docs.map((doc) => {
          const { ReceiverUid, Timestamp, transactions, Sender, SenderEmail, Note } = doc.data();
          let formattedTimestamp = '';
          if (Timestamp && Timestamp.toDate) {
            formattedTimestamp = Timestamp.toDate().toLocaleString();
          }
          return {
            id: doc.id,
            ReceiverUid,
            Timestamp: formattedTimestamp,
            transactions,
            Sender,
            SenderEmail,
            Note
          };
        });
        setLogs(logs);
      });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (notificationTapped) {
      // Navigating to the NotificationsScreen when notificationTapped is true
      navigation.navigate('Notifications');
    }
  }, [notificationTapped]);

  const sendNotification = async (transactions, senderEmail, note) => {
    const localNotification = {
      title: 'New Message',
      body: `You just received ₱${transactions} from ${senderEmail}${note ? ` with a note: ${note}` : ''}`,
      android: {
        sound: true,
      },
      ios: {
        sound: true,
      },
    };

    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status === 'granted') {
      await presentNotificationAsync(localNotification);
    } else {
      console.log('Permission not granted for notifications.');
    }
  };

  const sendPushNotification = async (message) => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const userRef = firebase.firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();
      const expoPushToken = userDoc.data()?.expoPushToken;
  
      if (expoPushToken) {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...message,
            to: expoPushToken,
            data: {
              screenName: 'Notifications', // Add the screen name here
            },
          }),
        });
  
        const result = await response.json();
        console.log('Notification result:', result);
      } else {
        console.log('Expo Push Token not found in Firestore.');
      }
    }
  };

  useEffect(() => {
    const user = auth.currentUser?.uid || auth.currentUser;
    if (user) {
      const uid = user;
      const todoRef = firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('notes')
        .doc('messages')
        .collection('receivedMessages')
        .orderBy('Timestamp', 'desc')
        .limit(1); // Retrieve only the most recent document
  
      const unsubscribe = onSnapshot(todoRef, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const { ReceiverUid, Timestamp, transactions, Sender, SenderEmail, Note } = doc.data();
          let formattedTimestamp = '';
          if (Timestamp && Timestamp.toDate) {
            formattedTimestamp = Timestamp.toDate().toLocaleString();
          }
          const latestMessage = {
            id: doc.id,
            ReceiverUid,
            Timestamp: formattedTimestamp,
            transactions,
            Sender,
            SenderEmail,
            Note
          };
  
          if (!notifiedMessages.includes(latestMessage.id) && (!latestMessageId || latestMessage.id !== latestMessageId)) {
            // Show the notification only if it's a new message and not the last notified message
            setLatestMessage(latestMessage);
            setLatestMessageId(latestMessage.id); // Update the latestMessageId
            sendNotification(
              latestMessage.transactions,
              latestMessage.SenderEmail,
              latestMessage.Note
            );
            sendPushNotification({ message: 'New message' });
  
            // Add the message ID to the list of notified messages
            setNotifiedMessages((prevMessages) => [...prevMessages, latestMessage.id]);
          }
        }
      });
  
      return () => unsubscribe();
    }
  }, [notifiedMessages, latestMessageId]); // Add "latestMessageId" as a dependency
  
    useEffect(() => {
      const registerForPushNotifications = async () => {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Permission not granted for notifications.');
          return;
        }
        const token = await registerForPushNotificationsAsync();
        console.log('Expo Push Token:', token.data);
  
        setExpoPushToken(token.data);
  
        // Save the token to the user's document in Firestore
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const userRef = firebase.firestore().collection('users').doc(uid);
          await userRef.update({
            expoPushToken: token.data,
          });
          console.log('Expo Push Token saved to Firestore.');
        }
      };
  
      registerForPushNotifications();
  
      const handleNotificationReceived = async (notification) => {
        console.log('Notification received in foreground:', notification);
        // Handle the received notification here
  
        // Retrieve the relevant information from the notification
        const { data } = notification;
        const { transactions, senderEmail, note } = data;
  
        // Check if the notification is a new message and has not been notified before
        if (data.message === 'New message' && !notifiedMessages.includes(data.messageId)) {
          // Show the notification
          sendNotification(transactions, senderEmail, note);
          sendPushNotification({ message: 'New message' });
  
          // Add the message ID to the list of notified messages
          setNotifiedMessages((prevMessages) => [...prevMessages, data.messageId]);
        }
      };
  
      const foregroundSubscription = Notifications.addNotificationReceivedListener(handleNotificationReceived);
  
      return () => {
        foregroundSubscription.remove();
      };
    }, [notifiedMessages]);

  if (!fontsLoaded && !error) {
    return null;
  }

  
  

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppProvider>
      
            <Stack.Navigator>
              <Stack.Screen options={{ headerShown: false }} name="GetStarted" component={GetStarted} />
              <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
              <Stack.Screen options={{ headerShown: false }} name="Main" component={MainDashboard} />
              <Stack.Screen options={{ headerShown: false }} name="Send" component={SendCash} />
              <Stack.Screen options={{ headerShown: false }} name="ScanQR" component={ScanQR} />
              <Stack.Screen options={{ headerShown: false }} name="EditProfile" component={EditProfile} />
              <Stack.Screen options={{ headerShown: false }} name="Currency" component={Currency} />
              <Stack.Screen options={{ headerShown: false }} name="Registrationpage" component={Registrationpage} />
              <Stack.Screen name="Logs" component={Logs} />
              <Stack.Screen name="Receive" component={Receive} />
              <Stack.Screen options={{ headerShown: false }} name="Profile" component={Profile} />
              <Stack.Screen options={{ headerShown: false }} name="Others" component={Others} />
              <Stack.Screen options={{ headerShown: false }} name="TopUpScreen" component={TopUpScreen} />
              <Stack.Screen options={{ headerShown: false }} name="Notifications" component={NotificationsScreen} />
              <Stack.Screen options={{ headerShown: false }} name="SevenConnect" component={SevenConnect} />
              <Stack.Screen options={{ headerShown: false }} name="GrabPayPH" component={GrabPayPH} />
              <Stack.Screen options={{ headerShown: false }} name="GCash" component={GCash} />
              <Stack.Screen options={{ headerShown: false }} name="BDO" component={BDO} />
              <Stack.Screen options={{ headerShown: false }} name="BPI" component={BPI} />
              <Stack.Screen options={{ headerShown: false }} name="ShopeePay" component={ShopeePay} />
              <Stack.Screen options={{ headerShown: false }} name="Paypal" component={Paypal} />
              <Stack.Screen options={{ headerShown: false }} name="UnionBank" component={UnionBank} />
              <Stack.Screen options={{ headerShown: false }} name="Paymaya" component={Paymaya} />
              <Stack.Screen options={{ headerShown: false }} name="LandBank" component={LandBank} />
            </Stack.Navigator>
        
        </AppProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});