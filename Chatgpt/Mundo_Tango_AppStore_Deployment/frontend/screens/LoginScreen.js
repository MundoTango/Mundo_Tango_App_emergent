import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '../utils/supabaseClient';
export default function LoginScreen({ navigation }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) navigation.replace('Home');
    else alert(error.message);
  };
  return (<View style={{ padding: 16 }}>
    <Text style={{ fontSize: 24, marginBottom: 12 }}>Mundo Tango</Text>
    <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginBottom:8}}/>
    <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{borderWidth:1, padding:8, marginBottom:8}}/>
    <Button title="Log in" onPress={login} />
    <Button title="Register" onPress={()=>navigation.navigate('Register')} />
  </View>);
}