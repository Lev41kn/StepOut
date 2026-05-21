import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [hasError, setHasError] = useState(false);


  const handleLogin = async () => {
  
  if (email === '' || password.length < 8) {
    setHasError(true);
  } else {
    setHasError(false);

    // --- NEW BACKEND LOGIC STARTS HERE ---
    try {
      // Send the email and password to Vlad's bouncer
      const response = await fetch(`${API_URL}/login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,       
          password: password, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userName', data.name);

        console.log("Token Saved Succefully!");
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        
      } else {
        alert("Backend says: " + data.message); 
      }

    } catch (error) {
      console.error("Login fetch error:", error);
      alert("Could not connect to the server. Is the hotspot still up?");
    }
  }
};
  

  return (
    <View style={styles.container}>

      {/* --- 1. WAVY BACKGROUND --- */}
      <Image source={require('../assets/login_background.png')} style={styles.waveBackground} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        
        {/* --- 2. TITLE --- */}
        <Text style={styles.title}>Log in</Text>

        {/* --- 3. EMAIL INPUT --- */}
        <View style={[styles.inputContainer, { borderBottomColor: hasError ? 'red' : '#A98A73' }]}>
          <Image source={require('../assets/email_icon.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="StepOut@gmail.com"
            placeholderTextColor="#A98A73"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setHasError(false);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {email.length > 0 && !hasError && (
             <Image source={require('../assets/checkmark_icon.png')} style={styles.inputIconRight} />
          )}
        </View>

        {/* --- ERROR MESSAGE BLOCK --- */}
        {hasError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorText}>
              Incorrect password or email. Please try again or click "Forgot password?" to see other options.
            </Text>
          </View>
        )}

        {/* --- 4. PASSWORD INPUT --- */}
        <View style={[styles.inputContainer, { borderBottomColor: hasError ? 'red' : '#A98A73' }]}>
          <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A98A73"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setHasError(false); // Hide error when typing
            }}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Image source={require('../assets/show_pswrd_icon.png')} style={styles.inputIconRight} />
          </TouchableOpacity>
        </View>

        {/* --- 5. FORGOT PASSWORD LINK --- */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPswrdScreen')}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* --- 6. CONNECT BUTTON --- */}
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={handleLogin}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>

        {/* --- 7. SIGN UP LINK --- */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.signupLink}>Sign up now</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF1E5',
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    width: width,
    height: 350,
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#A98A73',
    paddingVertical: 10,
    marginBottom: 20,
  },
  inputIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  inputIconRight: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5C3A21',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: '#5C3A21',
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#FFAA77',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  connectButtonText: {
    color: '#5C3A21',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#5C3A21',
    fontSize: 14,
  },
  signupLink: {
    color: '#FF7B42',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -15,
    marginBottom: 20,
  },
  errorIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 6,
  },
  errorIconText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    flex: 1,
  },
});