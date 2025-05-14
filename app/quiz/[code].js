import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function QuizPage() {
  const { code } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Code:</Text>
      <Text style={styles.code}>{code}</Text>
    </View>
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
});
