import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Button, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { BACKEND_URL } from '@env';
import * as Clipboard from 'expo-clipboard';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [quizzesList, setQuizzesList] = useState([]);
    const [directCode, setDirectCode] = useState('');
    const [title, setTitle] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const router = useRouter();

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

    useEffect(() => {
        if (!token) return;
        const fetchQuizzes = async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/get-all-quizzes`, {

                    token
                });
                setQuizzesList(res.data.quizList);
            } catch (e) {
                console.error('Failed to fetch quizzes', e);
            }
        };
        fetchQuizzes();
    }, [token]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        router.push('/login');
    };

    const pickPdf = async () => {
        const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (res.type === 'success') setPdf(res);
    };

    const handleDirectNavigate = () => {
        if (directCode.trim()) router.push(`/quiz/${directCode.trim()}`);
    };

    const createQuiz = async () => {
        if (uploadLoading) return;
        if (!pdf) {
            Alert.alert("Error", "Please select a PDF first.");
            return;
        }
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('pdf', { uri: pdf.uri, name: pdf.name, type: 'application/pdf' });
        formData.append('title', title);
        formData.append('token', token);
        try {
            const res = await axios.post(
                `${BACKEND_URL}/pdf-to-quiz`, 
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            const code = res.data.link_code || res.data['link-code'];
            console.log(code);
            router.push(`/quiz/${code}`);
        } catch (e) {
            console.error('Quiz creation failed', e);
        } finally {
            setUploadLoading(false);
        }
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
            <View style={styles.directNav}>
                <TextInput
                    style={styles.directInput}
                    placeholder="Enter quiz code"
                    placeholderTextColor="#ccc"
                    value={directCode}
                    onChangeText={setDirectCode}
                />
                <Button title="Go" onPress={handleDirectNavigate} color="#bb86fc" />
            </View>
            <View style={styles.uploadContainer}>
                <Button title="Select PDF" onPress={pickPdf} color="#bb86fc" />
                {pdf && (
                    <>
                        <Text style={styles.fileName}>{pdf.name}</Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Enter quiz title"
                            placeholderTextColor="#ccc"
                            value={title}
                            onChangeText={setTitle}
                        />
                        {title ? (
                            uploadLoading
                            ? <ActivityIndicator color="#bb86fc" />
                            : <Button title="Create Quiz" onPress={createQuiz} color="#bb86fc" />
                        ) : null}
                    </>
                )}
            </View>
            <Text style={styles.sectionTitle}>My Quizzes</Text>
            <FlatList
                data={quizzesList}
                keyExtractor={item => item.link_code || item.code}
                renderItem={({ item }) => (
                    <View style={styles.quizBox}>
                        <TouchableOpacity style={styles.quizInfo} onPress={() => router.push(`/quiz/${item.link_code}`)}>
                            <Text style={styles.quizTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                            <Text selectable style={styles.quizCode}>{item.link_code}</Text>
                        </TouchableOpacity>
                        <Button title="Copy" onPress={() => Clipboard.setString(item.link_code)} color="#bb86fc" />
                    </View>
                )}
            />
            <Button title="Logout" onPress={handleLogout} color="#e53935" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2d103b',
        alignItems: 'center',
        paddingVertical: 20,
    },
    directNav: { 
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '90%',
        maxWidth: 700,
    },
    directInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#bb86fc',
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        padding: 8,
        marginRight: 10,
        borderRadius: 4,
    },
    uploadContainer: {
        width: '90%',
        marginBottom: 30,
        alignItems: 'center',
        backgroundColor: '#3a0d44',
        padding: 15,
        borderRadius: 8,
    },
    fileName: {
        marginTop: 8,
        marginBottom: 8,
        fontStyle: 'italic',
        color: '#eee',
    },
    titleInput: { 
        width: '100%',
        borderWidth: 1,
        borderColor: '#bb86fc',
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        padding: 8,
        marginVertical: 10,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    quizBox: {
        width: 400,

        padding: 15,
        marginBottom: 12,
        gap: 10,
        backgroundColor: '#3a0d44',
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    quizTitle: {
        fontSize: 16,
        color: '#fff',
        flex: 1,
        marginRight: 10,
    },
    quizCode: {
        fontFamily: 'monospace',
        color: '#ddd',
    },
    quizInfo: { 
        flex: 1
    },
});