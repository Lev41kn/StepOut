import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';

import { API_URL } from '../config';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }: any) {

  // --- STATE ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // --- ERROR STATE ---
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  // --- VALIDATION LOGIC ---
  const handleSignUp = async () => {
    let isValid = true;

    // Regex checks for: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    // Check Password format
    if (!strongPasswordRegex.test(password)) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    // Check if Confirm Password matches
    if (password !== confirmPassword || confirmPassword === '') {
      setConfirmPasswordError(true);
      isValid = false;
    } else {
      setConfirmPasswordError(false);
    }

    // --- NEW BACKEND LOGIC GOES HERE ---
    // If both pass, send to the backend!
    if (isValid) {
      try {
        // Send the data to the backend
        const response = await fetch(`${API_URL}/signup`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Make sure you have these state variables in your component!
            name: name,         
            email: email,       
            password: password, 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Success! The backend received the data.");
        
          // Once we know the backend works, we will uncomment your navigation!
          /*
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
          */
        } else {
          alert("Backend says: " + data.message); // E.g., "Email already in use"
        }

      } catch (error) {
        console.error("Fetch error:", error);
        alert("Could not connect to the server. Is Vlad's computer ready?");
      }
    }
  };

  return (
    <View style={styles.container}>

      {/* --- WAVY BACKGROUND --- */}
      <Image source={require('../assets/login_background.png')} style={styles.waveBackground} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          <Text style={styles.title}>Sign up</Text>

          {/* --- 1. NAME INPUT --- */}
          <View style={styles.inputContainer}>
            <Image source={require('../assets/user_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#A98A73"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* --- 2. EMAIL INPUT --- */}
          <View style={styles.inputContainer}>
            <Image source={require('../assets/email_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="StepOut@gmail.com"
              placeholderTextColor="#A98A73"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* --- 3. PASSWORD INPUT --- */}
          <View style={[styles.inputContainer, { borderBottomColor: passwordError ? 'red' : '#A98A73' }]}>
            <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A98A73"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(false);
              }}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Image 
                source={require('../assets/show_pswrd_icon.png')} 
                style={styles.inputIconRight} 
              />
            </TouchableOpacity>
          </View>

          {/* PASSWORD ERROR MESSAGE */}
          {passwordError && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorText}>
                Please use at least 8 characters, including uppercase and lowercase letters, a number, and a special character.
              </Text>
            </View>
          )}

          {/* --- 4. CONFIRM PASSWORD INPUT --- */}
          <View style={[styles.inputContainer, { borderBottomColor: confirmPasswordError ? 'red' : '#A98A73' }]}>
            <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#A98A73"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError(false);
              }}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Image 
                source={require('../assets/show_pswrd_icon.png')} 
                style={styles.inputIconRight} 
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRM PASSWORD ERROR MESSAGE */}
          {confirmPasswordError && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorText}>
                Passwords do not match. Please try again.
              </Text>
            </View>
          )}

          {/* --- 5. CONNECT BUTTON --- */}
          <TouchableOpacity 
            style={styles.connectButton} 
            onPress={handleSignUp}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>

          {/* --- 6. LOG IN LINK --- */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginLink}>Log in now</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- STYLES ---
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 120,
    paddingBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 25,
  },
  inputIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#5C3A21',
    marginRight: 10,
  },
  inputIconRight: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#A98A73',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5C3A21',
  },
  
  // --- ADDED ERROR STYLES ---
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -20,
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

  connectButton: {
    backgroundColor: '#FFAA77',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#5C3A21',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF7B42',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});