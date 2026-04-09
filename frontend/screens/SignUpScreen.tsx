import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }: any) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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
              <Image 
                source={isPasswordVisible ? require('../assets/show_pswrd_icon.png') : require('../assets/show_pswrd_icon.png')} 
                style={styles.inputIconRight} 
              />
            </TouchableOpacity>
          </View>

          {/* --- 4. CONFIRM PASSWORD INPUT --- */}
          <View style={styles.inputContainer}>
            <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#A98A73"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Image 
                source={isConfirmPasswordVisible ? require('../assets/show_pswrd_icon.png') : require('../assets/show_pswrd_icon.png')} 
                style={styles.inputIconRight} 
              />
            </TouchableOpacity>
          </View>

          {/* --- 5. CONNECT BUTTON --- */}
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
    borderBottomColor: '#A98A73',
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
  connectButton: {
    backgroundColor: '#FFAA77',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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