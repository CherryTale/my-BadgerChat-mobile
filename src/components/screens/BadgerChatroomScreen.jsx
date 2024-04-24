import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, Modal, TextInput, Button, Alert } from "react-native";

import CS571 from '@cs571/mobile-client'
import * as SecureStore from 'expo-secure-store';
import BadgerChatMessage from '../helper/BadgerChatMessage'

function BadgerChatroomScreen(props) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const flatListRef = useRef(null);

    async function loadMessages () {
        setIsLoading(true);
        try {
            const response = await fetch(`https://cs571.org/api/s24/hw9/messages?chatroom=${props.name}`, {
                headers: {
                    "X-CS571-ID": CS571.getBadgerId()
                }
            })
            const json = await response.json();

            if(response.status === 200 || response.status === 304){
                console.log(json.msg);
                setMessages(json.messages);
            }else{
                throw new Error(json.msg);
            }
        } catch (error) {
            console.error("GETMESSAGE ERROR: ", error);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {loadMessages();}, []);
    
    function gotoHead() {
        if(flatListRef.current){
            flatListRef.current.scrollToOffset({offset:0, animated: true})
        }else{
            console.error("flatListRef.current not found.");
        }
    }

    async function handlePostSubmit() {
        try {
            const token = await SecureStore.getItemAsync('jwtToken');
            if(!token) {
                throw new Error('JWT token not found.')
            }
            const response = await fetch(`https://cs571.org/api/s24/hw9/messages?chatroom=${props.name}`,{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-CS571-ID": CS571.getBadgerId(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            })
            const json = await response.json();

            if(response.status === 200){
                console.log(json.msg);
                setModalVisible(false);
                gotoHead();
                loadMessages();
                Alert.alert("Successfully posted!", "Successfully posted!");
            }else{
                throw new Error(json.msg);
            }
        } catch (error) {
            console.error("POSTSUBMIT ERROR: ", error);
        }
    }

    return <>
        <FlatList
            data={messages}
            renderItem={({item}) =>
                <BadgerChatMessage
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    poster={item.poster}
                    content={item.content}
                    created={item.created}
                    loadMessages={loadMessages}
                    gotoHead={gotoHead}
                />
            }
            keyExtractor={item => item.id}
            onRefresh={loadMessages}
            refreshing={isLoading}
            style={{paddingTop:8,paddingBottom:8}}
            ref={flatListRef}
        />
        {!(props.continueAsGuest) &&
            <Pressable onPress={() => setModalVisible(true)} style={styles.container}>
                <Text style={styles.button}>ADD POST</Text>
            </Pressable>
        }
        <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text>Create A Post</Text>
                    <Text>Title</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <Text>Body</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        value={content}
                        onChangeText={setContent}
                    />
                    <View style={{flexDirection:"row"}}>
                        <Button color="crimson" title="CREATE POST" onPress={() => handlePostSubmit()} disabled={title === "" || content === ""} />
                        <Text> </Text>
                        <Button color="grey" title="CANCEL" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </View>
        </Modal>
    </>
}

const styles = StyleSheet.create({
    container :{
        alignItems: "center",
        flexGrow: 1,
    },
    button: {
        height: 40,
        color: "white",
        fontWeight: "bold",
        backgroundColor: "crimson",
        padding: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    }
});

export default BadgerChatroomScreen;