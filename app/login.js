import { View, TextInput, Button, StyleSheet, Alert, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { BACKEND_URL } from "@env";
import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (loading) return;
    setLoading(true);
    if (!email || !password) {
      Alert.alert("Error", "Email and password required.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `https://quiz-topia-backend.onrender.com/signin`,
        { email, password },
      );
      console.log(res);
      if (res.status === 200) {
        await AsyncStorage.setItem("token", res.data.user.token);
        router.replace("/");
      }
    } catch (e) {
      Alert.alert("Error", "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.v}>
      <Text style={{textAlign: "center", fontSize: 30, marginBottom: 20}}>
        Login
      </Text>
      <TextInput
        placeholder="Email"
        style={styles.i}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.i}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button disabled={loading} title={loading ? "..." : "Login"} onPress={login} />
      <Text style={{textAlign: "center", fontSize: 18}}>Dont Have An Account? <Text onPress={() => router.replace("/register")} style={styles.l}>
        Register
      </Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  v: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9f9f9" },
  i: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 8 },
  l: { marginTop: 10, color: "blue", textAlign: "center" },
});