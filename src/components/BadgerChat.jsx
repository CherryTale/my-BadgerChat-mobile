import { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import CS571 from '@cs571/mobile-client'
import * as SecureStore from 'expo-secure-store';
import BadgerChatroomScreen from './screens/BadgerChatroomScreen';
import BadgerRegisterScreen from './screens/BadgerRegisterScreen';
import BadgerLoginScreen from './screens/BadgerLoginScreen';
import BadgerLandingScreen from './screens/BadgerLandingScreen';


const ChatDrawer = createDrawerNavigator();

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false);
  const [chatrooms, setChatrooms] = useState([]);
  const [showLoginError, setShowLoginError] = useState(false);
  const [showRegisterError, setShowRegisterError] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    // hmm... maybe I should load the chatroom names here
    setChatrooms(["Hello", "World"]) // for example purposes only!
  }, []);

  async function getToken() {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      if (token) {
        return token;
      } else {
        throw new Error('JWT token not found.')
      }
    } catch (error) {
      console.error('Failed to retrieve JWT token:', error);
    }
  }

  async function handleLogin(username, password) {
    if (username === "" || password === ""){
      setShowLoginError(true);
    }else{
      try {
        const response = await fetch("https://cs571.org/api/s24/hw9/login",{
          method: "POST",
          headers: {
            "X-CS571-ID": CS571.getBadgerId(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username.toLowerCase(),
            password: password
          })
        })
        const json = await response.json();
        console.log(json.msg);

        if(response.status!==200){
          setShowLoginError(true);
        }else{
          await SecureStore.setItemAsync('jwtToken', json.token);
          await SecureStore.setItemAsync('username', json.user.username);
          setIsLoggedIn(true);
          setShowLoginError(false);
        }
      } catch (error) {
        console.error("LOGIN ERROR: ", error);
      }
    }
  }

  async function handleSignup(username, password, repeatPassword) {
    if (username===""){
      setRegisterError("Please enter a username");
      setShowRegisterError(true);
    }else if(password===""){
      setRegisterError("Please enter a password");
      setShowRegisterError(true);
    }else if(password!==repeatPassword){
      setRegisterError("Passwords do not match");
      setShowRegisterError(true);
    }else{
      try {
        const response = await fetch("https://cs571.org/api/s24/hw9/register",{
          method: "POST",
          headers: {
            "X-CS571-ID": CS571.getBadgerId(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username.toLowerCase(),
            password: password
          })
        })
        const json = await response.json();
        console.log(json.msg);

        if(response.status === 200){
          await SecureStore.setItemAsync('jwtToken', json.token);
          await SecureStore.setItemAsync('username', json.user.username);
          setIsLoggedIn(true);
          setShowRegisterError(false);
        }else{
          setRegisterError(json.msg);
          setShowRegisterError(true);
        }
      } catch (error) {
        console.error("SIGNUP ERROR: ", error);
      }
    }
  }

  if (isLoggedIn) {
    return (
      <NavigationContainer>
        <ChatDrawer.Navigator>
          <ChatDrawer.Screen name="Landing" component={BadgerLandingScreen} />
          {
            chatrooms.map(chatroom => {
              return <ChatDrawer.Screen key={chatroom} name={chatroom}>
                {(props) => <BadgerChatroomScreen name={chatroom} />}
              </ChatDrawer.Screen>
            })
          }
        </ChatDrawer.Navigator>
      </NavigationContainer>
    );
  } else if (isRegistering) {
    return <BadgerRegisterScreen handleSignup={handleSignup} setIsRegistering={setIsRegistering} showRegisterError={showRegisterError} registerError={registerError} />
  } else {
    return <BadgerLoginScreen handleLogin={handleLogin} setIsRegistering={setIsRegistering} showLoginError={showLoginError} />
  }
}