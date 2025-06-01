import { 
  View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, 
  Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function QuizPage() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizContent, setQuizContent] = useState([]);
  const [textQuestions, setTextQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [textAnswers, setTextAnswers] = useState({});
  const [textFeedbacks, setTextFeedbacks] = useState({});
  const [textVerdicts, setTextVerdicts] = useState({});

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

  const handleOptionSelect = (id, opt) => {
    if (mcqSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [id]: opt }));
  };

  const submitMCQs = () => {
    let score = 0;
    quizContent.forEach(q => {
      if (selectedOptions[q._id] === q.answer) score++;
    });
    setMcqScore(score);
    setMcqSubmitted(true);
  };

  const submitText = async (question) => {
    const answer = textAnswers[question]?.trim();
    if (!answer) return Alert.alert("Enter answer");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/validate-answer`,
        { token, pdfContentId: quiz.PdfContentId, question, answer }
      );
      setTextVerdicts(prev => ({ ...prev, [question]: res.data.verdict }));
      setTextFeedbacks(prev => ({ ...prev, [question]: res.data.feedback }));
    } catch (e) {
      console.error("Validation failed", e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6849FF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>{quiz?.title}</Text>

        {quizContent.map((q, idx) => (
          <View key={q._id} style={styles.card}>
            <Text style={styles.question}>{`${idx + 1}. ${q.question}`}</Text>
            {q.options.map(opt => {
              const selected = selectedOptions[q._id] === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionBox, 
                    selected && styles.optionSelected
                  ]}
                  onPress={() => handleOptionSelect(q._id, opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {!mcqSubmitted && quizContent.length > 0 
          ? <Button title="Submit MCQs" onPress={submitMCQs} color="#6849FF" />
          : quizContent.length > 0 ? <Text style={styles.score}>Score: {mcqScore} / {quizContent.length}</Text>
          : <Text style={styles.score}>Invalid Code</Text>
        }

        {/* Text Questions */}
        {textQuestions.length > 0 ?? <Text style={styles.subHeader}>Text Questions</Text>}
        {textQuestions.map((tq, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.question}>{`${i + 1}. ${tq}`}</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Type your answer..."
              placeholderTextColor="#999"
              value={textAnswers[tq] || ''}
              onChangeText={txt => setTextAnswers(prev => ({ ...prev, [tq]: txt }))}
            />
            <Button 
              title="Validate" 
              onPress={() => submitText(tq)} 
              color="#6849FF" 
            />
            {textVerdicts[tq] && (
              <View style={styles.feedbackBox}>
                <Text style={styles.verdict}>
                  {textVerdicts[tq] === 'yes' ? '✅ Correct' : '❌ Incorrect'}
                </Text>
                <Text style={styles.feedback}>{textFeedbacks[tq]}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.bottom}>
          <Button 
            title="Back To Home" 
            onPress={() => router.push('/')} 
            color="#6849FF" 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#191A1F',
    alignItems: 'stretch',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191A1F',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    color: '#fff',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  card: {
    // backgroundColor: '',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  question: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    padding: 12,
    marginVertical: 6,
  },
  optionSelected: {
    backgroundColor: '#6849FF',
    borderColor: '#6849FF',
  },
  optionText: {
    color: '#ddd',
  },
  score: {
    color: '#fff',
    fontSize: 18,
    alignSelf: 'center',
    marginVertical: 15,
  },
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#777',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  feedbackBox: {
    backgroundColor: '#6849FF',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  verdict: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  feedback: {
    color: '#ddd',
  },
  bottom: {
    marginVertical: 20,
    alignItems: 'center',
  },
});
