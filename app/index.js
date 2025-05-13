import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        async function checkToken() {
            try {
                const storedToken = await SecureStore.getItemAsync('authToken'); // Use your actual token key
                setToken(storedToken);
            } catch (e) {
                console.error("Failed to fetch token from secure store:", e);
                setToken(null); // Ensure token is null on error
                
            } finally {
                setIsLoading(false);
            }
        }
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!token) {
        return <Redirect href="/login" />;
    }

    // If token exists, this is the home page content.
    return (
        <View style={styles.container}>
            <Text>Welcome to the app!</Text>
            {/* Your home page content will go here */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});