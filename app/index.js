import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Button, FlatList } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [pdf, setPdf] = useState(null);
    const router = useRouter();
    const quizzes = [
        { title: 'Sample Quiz 1', code: 'QUIZ123' },
        { title: 'Another Sample Quiz with a Very Long Title to Test Ellipsis', code: 'QUIZ456' },
    ];

    useEffect(() => {
        async function checkToken() {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                setToken(storedToken);
            } catch (e) {
                console.error("Failed to fetch token from async storage:", e);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        }
        checkToken();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        router.push('/login');
    };

    const pickPdf = async () => {
        const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (res.type === 'success') setPdf(res);
    };

    const uploadPdf = () => {
        // TODO: implement upload logic
        console.log('Uploading PDF:', pdf);
    };

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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.uploadContainer}>
                <Button title="Select PDF" onPress={pickPdf} />
                {pdf && (
                    <>
                        <Text style={styles.fileName}>{pdf.name}</Text>
                        <Button title="Upload PDF" onPress={uploadPdf} />
                    </>
                )}
            </View>
            <Text style={styles.sectionTitle}>My Quizzes</Text>
            <FlatList
                data={quizzes}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                    <View style={styles.quizBox}>
                        <Text style={styles.quizTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                        <Text selectable style={styles.quizCode}>{item.code}</Text>
                    </View>
                )}
            />
            <Button title="Logout" onPress={handleLogout} color="red" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    uploadContainer: {
        width: '90%',
        marginBottom: 20,
        alignItems: 'center',
    },
    fileName: {
        marginTop: 8,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    quizBox: {
        width: '90%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    quizTitle: {
        fontSize: 16,
        marginBottom: 5,
    },
    quizCode: {
        fontFamily: 'monospace',
    },
});