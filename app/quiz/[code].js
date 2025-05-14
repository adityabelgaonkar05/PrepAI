import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function QuizPage() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizContent, setQuizContent] = useState([]);
  const [textQuestions, setTextQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to fetch token from async storage:", e);
      }
    }
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) fetchQuiz();
  }, [token]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/get-quiz-by-code`,
        { quizCode: code, token }
      );
      if (res.status === 200) {
        const data = res.data.quiz;
        setQuiz(data);
        setQuizContent(data.quizContent);
        setTextQuestions(data.textQuestions);
      }
    } catch (e) {
      if (e.response?.status === 404) {
        Alert.alert("Quiz Not Found", "Please check the code and try again.");
      } else if (e.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        router.push('/login');
      } else {
        console.error("Failed to fetch quiz:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#bb86fc" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{quiz?.title}</Text>
      {quizContent?.map((q, idx) => (
        <View key={q._id} style={styles.questionBox}>
          <Text style={styles.question}>{`${idx + 1}. ${q.question}`}</Text>
          {q.options.map(opt => (
            <Text key={opt} style={styles.option}>{`\u2022 ${opt}`}</Text>
          ))}
        </View>
      ))}
      <Text style={styles.textSectionTitle}>Text Questions</Text>
      {textQuestions.map((tq, i) => (
        <Text key={i} style={styles.textQuestion}>{`${i + 1}. ${tq}`}</Text>
      ))}
      <Button onPress={() => router.push('/')} title="Back To Home" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d103b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  code: {
    fontSize: 32,
    color: '#bb86fc',
    fontFamily: 'monospace',
  },
  questionBox: { marginVertical: 10 },
  question:    { color: '#fff', fontSize: 16, marginBottom: 5 },
  option:      { color: '#ddd', marginLeft: 10 },
  textSectionTitle: { color: '#fff', fontSize: 18, marginTop: 20 },
  textQuestion:     { color: '#ddd', marginVertical: 5 },
});
