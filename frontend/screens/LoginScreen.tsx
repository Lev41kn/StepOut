import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

          {email.length > 0 && (
             <Image source={require('../assets/checkmark_icon.png')} style={styles.inputIconRight} />
          )}

        </View>

        {/* --- 4. PASSWORD INPUT --- */}
        <View style={styles.inputContainer}>
          <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A98A73"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Image source={require('../assets/show_pswrd_icon.png')} style={styles.inputIconRight} />
          </TouchableOpacity>
        </View>

        {/* --- 5. FORGOT PASSWORD LINK --- */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => console.log('Go to Forgot Password')}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* --- 6. CONNECT BUTTON --- */}
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={() => 
            // This completely wipes the history so you can't swipe back!
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          } 
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
});