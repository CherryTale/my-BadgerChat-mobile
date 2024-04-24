import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

function BadgerRegisterScreen(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    return <View style={styles.container}>
        <Text style={{ fontSize: 36, marginBottom: 20 }}>Join BadgerChat!</Text>

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

        <Text>Confirm Password</Text>
        <TextInput
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
        />
        
        {props.showRegisterError && <Text style={{color:"crimson", marginBottom:12}}>{props.registerError}</Text>}

        <View style={{flexDirection:"row"}}>
            <Button color="crimson" title="Signup" onPress={() => props.handleSignup(username, password, repeatPassword)} />
            <Text> </Text>
            <Button color="grey" title="Nevermind!" onPress={() => props.setIsRegistering(false)} />
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
    },
});

export default BadgerRegisterScreen;