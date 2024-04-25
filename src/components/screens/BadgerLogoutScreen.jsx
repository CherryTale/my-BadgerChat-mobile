import { useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import * as SecureStore from 'expo-secure-store';
import BadgerLoginStatusContext from "../contexts/BadgerLoginStatusContext";

function BadgerLogoutScreen(props) {

    const [loginUsername, setLoginUsername] = useContext(BadgerLoginStatusContext);

    async function logout() {
        try {
            await SecureStore.deleteItemAsync('jwtToken');
            setLoginUsername("");
            props.setIsLoggedIn(false);
            props.setIsRegistering(false);
        } catch (error) {
            console.error("LOGOUT ERROR: ", error);
        }
    }

    return <View style={styles.container}>
        <Text style={{fontSize: 24, marginTop: -100}}>Are you sure you're done?</Text>
        <Text>Come back soon!</Text>
        <Text/>
        <Button title="Logout" color="darkred" onPress={logout} />

    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        width: "50%",
        margin: 12,
        borderWidth: 1,
        padding: 10,
    }
});

export default BadgerLogoutScreen;