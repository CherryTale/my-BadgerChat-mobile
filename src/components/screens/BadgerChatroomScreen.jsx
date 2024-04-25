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
            style={{paddingTop:8}}
            ref={flatListRef}
        />
        {!(props.continueAsGuest) &&
            <Pressable onPress={() => setModalVisible(true)}>
                <Text style={styles.addButton}>ADD POST</Text>
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
                    <Text style={{fontSize:20,fontWeight:"bold", marginBottom:12}}>Create A Post</Text>
                    <Text style={{fontSize:16}}>Title</Text>
                    <TextInput
                        style={[styles.input,{height:40}]}
                        autoCapitalize="none"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <Text style={{fontSize:16}}>Body</Text>
                    <TextInput
                        style={[styles.input,{height:80,textAlignVertical:"top"}]}
                        autoCapitalize="none"
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />
                    <View style={{flexDirection:"row",justifyContent:"center"}}>
                        <Button color="darkred" title="CREATE POST" onPress={() => handlePostSubmit()} disabled={title === "" || content === ""} />
                        <Text> </Text>
                        <Button color="grey" title="CANCEL" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </View>
        </Modal>
    </>
}

const styles = StyleSheet.create({
    addButton: {
        width: "100%",
        height: 40,
        lineHeight: 40,
        color: "white",
        fontWeight: "bold",
        backgroundColor: "darkred",
        textAlign: "center",
        verticalAlign: "middle"
    },
    centeredView: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
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
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    }
});

export default BadgerChatroomScreen;