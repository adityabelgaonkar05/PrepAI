import { View, TextInput, Button, StyleSheet, Alert, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { BACKEND_URL } from "@env";
import axios from "axios";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signup = async () => {
    if (loading) return;
    setLoading(true);
    if (!email || !username || !password) {
      Alert.alert("Error", "All fields required.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords must match.");
      setLoading(false);
      return;
    }
    try {
      const { status, data } = await axios.post(
        `${BACKEND_URL}/signup`,
        { email, username, password }
      );
      if (status === 200) {
        await AsyncStorage.setItem("token", data.user.token);
        router.replace("/");
      } else if (status === 201) {
        Alert.alert("Error", "User already exists.");
      }
    } catch (e) {
      const s = e.response?.status;
      if (s === 400) Alert.alert("Error", "Invalid signup data.");
      else Alert.alert("Error", "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.v}>
      <TextInput
        placeholder="Email"
        style={styles.i}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Username"
        style={styles.i}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.i}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm"
        style={styles.i}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />
      <Button disabled={loading} title={loading ? "..." : "Register"} onPress={signup} />
      <Text onPress={() => router.replace("/login")} style={styles.l}>
        Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  v: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9f9f9" },
  i: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 8 },
  l: { marginTop: 10, color: "blue", textAlign: "center" },
});
