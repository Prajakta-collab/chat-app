import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import base64 from "react-native-base64";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import firestore from "@react-native-firebase/firestore";


export default function App() {
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getUser();
    //for realtime update
    const subscribe = firestore()
      .collection("chatId")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type == "added") {
            let data: any = change.doc.data();
            data.createdAt = data.createdAt.toDate();
            setMessages((prevMessages) =>
              GiftedChat.append(prevMessages, data)
            );
          }
        });
      });
    return () => subscribe();
  }, []);

  async function getUser() {
    let userLocal = await AsyncStorage.getItem("user");
    if (userLocal) setUser(JSON.parse(userLocal));
  }

  async function handlePress() {
    let _id = base64.encode(email);
    let userLocal = { id: _id, email: email };
    await AsyncStorage.setItem("user", JSON.stringify(userLocal));
    setUser(userLocal);
  }

  function onSend(messages: IMessage[]) {
    //for storing firestore
    firestore()
      .collection("chatId")
      .doc(Date.now().toString())
      .set(messages[0]);
  }

  if (Object.keys(user).length == 0) {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Enter your Email "
          value={email}
          onChangeText={setEmail}
        />
        <Button title="Sign in" onPress={handlePress} />
      </View>
    );
  }

  return;
  <View style={styles.chatContainer}>
    <GiftedChat messages={messages} 
    onSend={(messages) => onSend(messages)}
    user={{_id:user.id }}
     />
  </View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    height: 40,
    width: "100%",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
