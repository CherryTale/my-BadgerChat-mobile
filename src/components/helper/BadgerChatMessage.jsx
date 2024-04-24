import { useContext } from "react";
import { StyleSheet, Text, Pressable } from "react-native";

import CS571 from '@cs571/mobile-client'
import * as SecureStore from 'expo-secure-store';
import BadgerCard from "./BadgerCard"
import BadgerLoginStatusContext from "../contexts/BadgerLoginStatusContext";

function BadgerChatMessage(props) {

    const [loginUsername, setLoginUsername] = useContext(BadgerLoginStatusContext);

    async function handlePostDelete() {
        try {
            const token = await SecureStore.getItemAsync('jwtToken');
            if(!token) {
                throw new Error('JWT token not found.')
            }
            const response = await fetch(`https://cs571.org/api/s24/hw9/messages?id=${props.id}`,{
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-CS571-ID": CS571.getBadgerId(),
                },
            })
            const json = await response.json();

            if(response.status === 200){
                console.log(json.msg);
                alert("Successfully deleted the post!");
                props.loadMessages();
                props.gotoHead();
            }else{
                throw new Error(json.msg);
            }
        } catch (error) {
            console.error("DELETE ERROR: ", error);
        }
    }

    const dt = new Date(props.created);

    return <BadgerCard style={{ margin: 8, padding: 8 }}>
        <Text style={{fontSize: 28, fontWeight: 600}}>{props.title}</Text>
        <Text style={{fontSize: 12}}>by {props.poster} | Posted on {dt.toLocaleDateString()} at {dt.toLocaleTimeString()}</Text>
        <Text></Text>
        <Text>{props.content}</Text>
        {props.poster === loginUsername &&
            <Pressable onPress={handlePostDelete}>
                <Text style={styles.deleteButton}>DELETE POST</Text>
            </Pressable>
        }
    </BadgerCard>
}

const styles = StyleSheet.create({
    deleteButton: {
        width: "100%",
        height: 40,
        lineHeight: 40,
        color: "white",
        fontWeight: "bold",
        backgroundColor: "crimson",
        textAlign: "center",
        verticalAlign: "middle",
        borderRadius: 6,
        marginTop: 4,
    },
});

export default BadgerChatMessage;