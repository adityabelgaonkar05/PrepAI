import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, StyleSheet, Button, FlatList, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { BACKEND_URL } from '@env';
import * as Clipboard from 'expo-clipboard';

const HeaderComponent = React.memo(({ directCode, setDirectCode, handleDirectNavigate, pickPdf, pdf, createQuiz, uploadLoading }) => {
    const [localTitle, setLocalTitle] = useState('');
    return (
        <>
            <Text style={styles.header}>📚 PrepAI Quiz Manager</Text>
            <View style={styles.directNav}>
                <TextInput
                    style={styles.directInput}
                    placeholder="Enter quiz code"
                    placeholderTextColor="#ccc"
                    value={directCode}
                    onChangeText={setDirectCode}
                />
                <Button title="Go" onPress={handleDirectNavigate} color="#6849FF" />
            </View>
            <View style={styles.uploadContainer}>
                <Button title="Select PDF" onPress={pickPdf} color="#6849FF" />
                {pdf && <Text style={styles.fileName}>{pdf.name}</Text>}
                {pdf && (
                    <>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Enter quiz title"
                            placeholderTextColor="#ccc"
                            value={localTitle}
                            onChangeText={setLocalTitle}
                            returnKeyType="done"
                        />
                        {localTitle ? (
                            uploadLoading
                            ? <ActivityIndicator color="#6849FF" />
                            : <Button title="Create Quiz" onPress={() => createQuiz(localTitle)} color="#6849FF" />
                        ) : null}
                    </>
                )}
            </View>
            <Text style={styles.sectionTitle}>My Quizzes</Text>
        </>
    );
});

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [quizzesList, setQuizzesList] = useState([]);
    const [directCode, setDirectCode] = useState('');
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

    const createQuiz = async (quizTitle) => {
        if (uploadLoading || !pdf) {
            if (!pdf) Alert.alert("Error", "Please select a PDF first.");
            return;
        }
        setUploadLoading(true);
        try {
            const fileUri = pdf.uri;
            const formData = new FormData();
            formData.append('pdf', { uri: fileUri, name: pdf.name, type: 'application/pdf' });
            formData.append('title', quizTitle);
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
            if (data.error && data.error.includes('Failed to parse Gemini response')) {
                Alert.alert('Incompatible file.', 'This PDF has no readable content.');
                return;
            }
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
            <FlatList
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                data={quizzesList}
                keyExtractor={item => item.link_code || item.code}
                contentContainerStyle={styles.container}
                ListHeaderComponent={<HeaderComponent
                    directCode={directCode}
                    setDirectCode={setDirectCode}
                    handleDirectNavigate={handleDirectNavigate}
                    pickPdf={pickPdf}
                    pdf={pdf}
                    createQuiz={createQuiz}
                    uploadLoading={uploadLoading}
                />}
                renderItem={({ item }) => (
                    <View style={styles.quizBox}>
                        <TouchableOpacity style={styles.quizInfo} onPress={() => router.push(`/quiz/${item.link_code}`)}>
                            <Text style={styles.quizTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                            <Text selectable style={styles.quizCode}>{item.link_code}</Text>
                        </TouchableOpacity>
                        <Button title="Copy" onPress={() => Clipboard.setString(item.link_code)} color="#6849FF" />
                    </View>
                )}
                ListFooterComponent={() => (
                    <View style={{ marginVertical: 20 }}>
                        <Button title="Logout" onPress={handleLogout} color="#e53935" />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#191A1F',
    },
    container: {
        flexGrow: 1,
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
        borderColor: '#6849FF',
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
        backgroundColor: '#27282C',
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
        borderColor: '#6849FF',
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
        width: '100%',
        maxWidth: 700,
        marginBottom: 12,
        backgroundColor: '#27282C',
        borderRadius: 10,
        padding: 18,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    quizTitle: {
        fontSize: 18,
        color: '#FFF',
        marginBottom: 6,
        textAlign: 'left',
    },
    quizCode: {
        fontFamily: 'monospace',
        color: '#CCC',
        textAlign: 'left',
    },
    quizInfo: { flex: 1, paddingRight: 10 },
});