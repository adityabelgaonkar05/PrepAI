import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import { BACKEND_URL } from "@env";
import axios from "axios";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clicked, setClicked] = useState(false);

    const handleLogin = async () => {
        // setClicked(true);
        // if(clicked) return;

        if (!email || !password) {
            Alert.alert("Error", "Please enter both email ;and password.");
            return;
        }
        
        console.log("Logging in with:", { email, password, BACKEND_URL });
        const res = await axios.post(`${BACKEND_URL}/signin`, {
            email,
            password
        })

        if (res.status === 200) {
            Alert.alert("Login successful:", res);
            const token = res.data.user.token;
            await SecureStore.setItemAsync('authToken', token);
            Alert.alert("Success", "Login successful!");
            router.push("./");
        }

        Alert.alert("Login Attempt", `Email: ${email}\nPassword: ${password}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});