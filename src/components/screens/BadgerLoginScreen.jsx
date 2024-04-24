import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

function BadgerLoginScreen(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return <View style={styles.container}>
        <Text style={{ fontSize: 36, marginBottom: 20 }}>BadgerChat Login</Text>

        <Text>Username</Text>
        <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
        />

        <Text>Password</Text>
        <TextInput
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        {props.showLoginError && <Text style={{color:"crimson", marginBottom:12}}>Incorrect login, please try again.</Text>}

        <Button color="crimson" title="Login" onPress={() => {
            props.handleLogin(username, password);
        }} />
        <Text style={{margin:20}}>New here?</Text>

        <View style={{flexDirection:"row"}}>
            <Button color="grey" title="Signup" onPress={() => props.setIsRegistering(true)} />
            <Text> </Text>
            <Button color="grey" title="CONTINUE AS GUEST" onPress={() => props.setContinueAsGuest(true)} />
        </View>
    </View>;
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
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    }
});

export default BadgerLoginScreen;