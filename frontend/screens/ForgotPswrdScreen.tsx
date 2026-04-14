import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function ForgotPswrdScreen({ navigation }: any) {

  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const renderStep = () => {
    if (step === 1) {
      return (
        // Forgot Password
        <>
          <Text style={styles.title}>Forgot{'\n'}password</Text>
          <Text style={styles.subtitle}>Please enter your email address to receive a reset code.</Text>
          
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

          <TouchableOpacity style={styles.actionButton} onPress={() => setStep(2)}>
            <Text style={styles.actionButtonText}>Send code</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Remember password?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.footerLink}>Log in now</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (step === 2) {
      return (

        //Enter Code 
        <>
          <Text style={styles.title}>Enter code</Text>
          <Text style={styles.subtitle}>Please enter the 4-digit code sent to your email.</Text>
          
          <View style={[styles.inputContainer, { justifyContent: 'center' }]}>
            <TextInput
              style={styles.codeInput}
              placeholder="0 0 0 0"
              placeholderTextColor="#A98A73"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={() => setStep(3)}>
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={() => console.log('Resend Code')}>
              <Text style={styles.footerLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (step === 3) {
      return (

        // New Password
        <>
          <Text style={styles.title}>New{'\n'}password</Text>
          <Text style={styles.subtitle}>Please create a new secure password.</Text>
          
          <View style={styles.inputContainer}>
            <Image source={require('../assets/lock_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#A98A73"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Image source={require('../assets/show_pswrd_icon.png')} style={styles.inputIconRight} />
            </TouchableOpacity>
          </View>

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
              <Image source={require('../assets/show_pswrd_icon.png')} style={styles.inputIconRight} />
            </TouchableOpacity>

          </View>

          <TouchableOpacity 
            style={styles.actionButton} 
            
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.actionButtonText}>Update</Text>
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/login_background.png')} style={styles.waveBackground} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {renderStep()}
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
    paddingTop: 80, 
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#5C3A21',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#A98A73',
    paddingVertical: 10,
    marginBottom: 30,
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
    letterSpacing: 0
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 15,
    color: '#5C3A21',
    textAlign: 'center',
  },
  actionButton: {
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
  actionButtonText: {
    color: '#5C3A21',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#5C3A21',
    fontSize: 14,
  },
  footerLink: {
    color: '#FF7B42',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});