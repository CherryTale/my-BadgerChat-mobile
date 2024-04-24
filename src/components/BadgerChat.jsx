import { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import CS571 from '@cs571/mobile-client'
import * as SecureStore from 'expo-secure-store';
import BadgerChatroomScreen from './screens/BadgerChatroomScreen';
import BadgerRegisterScreen from './screens/BadgerRegisterScreen';
import BadgerLoginScreen from './screens/BadgerLoginScreen';
import BadgerLandingScreen from './screens/BadgerLandingScreen';
import BadgerLogoutScreen from './screens/BadgerLogoutScreen';
import BadgerConversionScreen from './screens/BadgerConversionScreen';
import BadgerLoginStatusContext from './contexts/BadgerLoginStatusContext'


const ChatDrawer = createDrawerNavigator();

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false);
  const [chatrooms, setChatrooms] = useState([]);
  const [showLoginError, setShowLoginError] = useState(false);
  const [showRegisterError, setShowRegisterError] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  useEffect(() => {
    async function loadChatrooms() {
      try {
        const response = await fetch('https://cs571.org/api/s24/hw9/chatrooms', {
          headers: {
            "X-CS571-ID": CS571.getBadgerId(),
          }
        })
        const json = await response.json();
        setChatrooms(json);
      } catch (error) {
        console.error("GETROOMS ERROR: ", error);
      }
    }
    loadChatrooms();
  }, []);

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

        if(response.status === 200){
          console.log(json.msg);
          await SecureStore.setItemAsync('jwtToken', json.token);
          setLoginUsername(json.user.username);
          setIsLoggedIn(true);
          setShowLoginError(false);
        }else{
          setShowLoginError(true);
          throw new Error(json.msg);
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

        if(response.status === 200){
          console.log(json.msg);
          await SecureStore.setItemAsync('jwtToken', json.token);
          setLoginUsername(json.user.username);
          setIsLoggedIn(true);
          setRegisterError("");
          setShowRegisterError(false);
        }else{
          setRegisterError(json.msg);
          setShowRegisterError(true);
          throw new Error(json.msg);
        }
      } catch (error) {
        console.error("SIGNUP ERROR: ", error);
      }
    }
  }

  return <BadgerLoginStatusContext.Provider value={[loginUsername,setLoginUsername]}>{
    isLoggedIn || continueAsGuest ?
      <NavigationContainer>
        <ChatDrawer.Navigator>
          <ChatDrawer.Screen name="Landing" component={BadgerLandingScreen} />
          {
            chatrooms.map(chatroom => {
              return <ChatDrawer.Screen key={chatroom} name={chatroom}>
                {(props) => <BadgerChatroomScreen name={chatroom} continueAsGuest={continueAsGuest} />}
              </ChatDrawer.Screen>
            })
          }
          {loginUsername !== "" ?
            <ChatDrawer.Screen name="Logout">
              {(props) => <BadgerLogoutScreen setIsLoggedIn={setIsLoggedIn} />}
            </ChatDrawer.Screen>
          :
            <ChatDrawer.Screen name="Signup">
              {(props) => <BadgerConversionScreen setContinueAsGuest={setContinueAsGuest} setIsRegistering={setIsRegistering} />}
            </ChatDrawer.Screen>
          }
        </ChatDrawer.Navigator>
      </NavigationContainer>
    : isRegistering ?
      <BadgerRegisterScreen
        handleSignup={handleSignup}
        setIsRegistering={setIsRegistering}
        showRegisterError={showRegisterError}
        registerError={registerError}
      />
    :
      <BadgerLoginScreen
        handleLogin={handleLogin}
        setIsRegistering={setIsRegistering}
        showLoginError={showLoginError}
        setContinueAsGuest={setContinueAsGuest}
      />
  }</BadgerLoginStatusContext.Provider>
}