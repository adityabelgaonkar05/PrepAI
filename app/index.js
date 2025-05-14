import { SafeAreaView, View, Text, ActivityIndicator, StyleSheet, ScrollView, Button, FlatList, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
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
        console.log('pickPdf called');
        let res;
        try {
            const pdfFilter = ['application/pdf'];
            res = await DocumentPicker.getDocumentAsync({
                type: pdfFilter,
                copyToCacheDirectory: Platform.OS !== 'web',
            });
        } catch (e) {
            console.error('Error opening document picker', e);
            Alert.alert('Error', 'Document picker failed');
            return;
        }
        console.log('DocumentPicker result:', res);
        if (!res.canceled && res.assets && res.assets.length > 0) {
            const asset = res.assets[0];
            setPdf(asset);
            Alert.alert('PDF Selected', asset.name);
        } else {
            Alert.alert('Selection cancelled');
        }
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
        try {
            const fileUri = pdf.uri;
            const formData = new FormData();
            formData.append('pdf', { uri: fileUri, name: pdf.name, type: 'application/pdf' });
            formData.append('title', title);
            formData.append('token', token);

            const response = await fetch(`${BACKEND_URL}/pdf-to-quiz`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Upload failed', response.status, text);
                Alert.alert('Error', `Upload failed (Status: ${response.status})`);
                return;
            }
            const data = await response.json();
            const code = data.link_code || data['link-code'];
            if (code) {
                Alert.alert('Quiz Created', `Your quiz code is ${code}`, [
                    { text: 'OK', onPress: () => router.push(`/quiz/${code}`) }
                ]);
            } else {
                console.error('No code returned', data);
                Alert.alert('Error', 'Quiz created but no code returned');
            }
        } catch (e) {
            console.error('Quiz creation failed', e);
            Alert.alert('Error', e.message || 'Unknown error during upload');
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
        <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>📚 PrepAI Quiz Manager</Text>
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
                {pdf ? <Text style={styles.fileName}>Selected PDF: {pdf.name}</Text> : null}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#2d103b',
    },
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    directNav: { 
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
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
        width: '100%',
        maxWidth: 700,
        marginBottom: 30,
        alignItems: 'center',
        backgroundColor: '#3a0d44',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    fileName: {
        marginTop: 8,
        marginVertical: 8,
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
        marginVertical: 12,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 15,
    },
    quizBox: {
        width: 350,
        padding: 15,
        marginBottom: 12,
        backgroundColor: '#3a0d44',
        borderRadius: 10,
        padding: 18,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        alignItems: 'center',
    },
    quizTitle: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    quizCode: {
        fontFamily: 'monospace',
        color: '#ddd',
        textAlign: 'center',
    },
    quizInfo: { flex: 1, paddingRight: 10 },
});