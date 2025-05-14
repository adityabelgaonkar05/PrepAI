import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@env';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#bb86fc" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}           // make scrollable area flex
      contentContainerStyle={styles.container}  // allow children to grow
    >
      <Text style={styles.title}>{quiz?.title}</Text>

      {/* MCQ Section */}
      {quizContent.map((q, idx) => (
        <View key={q._id} style={styles.questionBox}>
          <Text style={styles.question}>{`${idx+1}. ${q.question}`}</Text>
          {q.options.map(opt => {
            const selected = selectedOptions[q._id] === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optionBox, selected && styles.optionSelected]}
                onPress={() => handleOptionSelect(q._id, opt)}
              >
                <Text style={styles.option}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {!mcqSubmitted
        ? <Button title="Submit Answers" onPress={submitMCQs} color="#bb86fc"/>
        : <Text style={styles.score}>Score: {mcqScore} / {quizContent.length}</Text>
      }

      {/* Text Questions Section */}
      <Text style={styles.textSectionTitle}>Text Questions</Text>
      {textQuestions.map((tq, i) => (
        <View key={i} style={styles.textBox}>
          <Text style={styles.textQuestion}>{`${i+1}. ${tq}`}</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Your answer..."
            placeholderTextColor="#777"
            value={textAnswers[tq] || ''}
            onChangeText={txt => setTextAnswers(prev => ({ ...prev, [tq]: txt }))}
          />
          <Button title="Validate" onPress={() => submitText(tq)} color="#bb86fc"/>
          {textVerdicts[tq] && (
            <View style={styles.feedbackBox}>
              <Text style={styles.verdict}>
                {textVerdicts[tq] === 'yes' ? 'Correct' : 'Incorrect'}
              </Text>
              <Text style={styles.feedback}>{textFeedbacks[tq]}</Text>
            </View>
          )}
        </View>
      ))}

      <Button onPress={() => router.push('/')} title="Back To Home" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,             // let contentContainer expand
    backgroundColor: '#2d103b',
    alignItems: 'flex-start',// stretch children full-width
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
  questionBox: {
    width: '100%',            // full-width question containers
    marginVertical: 10,
  },
  question:    { color: '#fff', fontSize: 16, marginBottom: 5 },
  option:      { color: '#ddd', marginLeft: 10 },
  textSectionTitle: { color: '#fff', fontSize: 18, marginTop: 20 },
  textQuestion:     { color: '#ddd', marginVertical: 5 },
  optionBox: {
    borderWidth: 1, borderColor: '#555', padding: 8, marginVertical: 4, borderRadius: 4
  },
  optionSelected: {
    backgroundColor: '#bb86fc'
  },
  score: {
    color: '#fff', fontSize: 18, marginVertical: 10
  },
  textBox: {
    width: '100%',            // full-width text answer containers
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1, borderColor: '#777', backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff', padding: 8, borderRadius: 4, minHeight: 60, marginVertical: 6
  },
  feedbackBox: {
    backgroundColor: '#3a0d44', padding: 8, borderRadius: 4, marginTop: 6
  },
  verdict: {
    color: '#fff', fontWeight: 'bold', marginBottom: 4
  },
  feedback: {
    color: '#ddd'
  },
});
