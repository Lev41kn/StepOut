import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar } from 'expo-status-bar';

import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotesScreen from './screens/NotesScreen';
import AddNotesScreen from './screens/AddNotesScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPswrdScreen from './screens/ForgotPswrdScreen';

import TabBar from './components/TabBar';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="NotesScreen" component={NotesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (

    <>
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          <Stack.Screen name="LoadingScreen" component={LoadingScreen} />

          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ForgotPswrdScreen" component={ForgotPswrdScreen} />

          <Stack.Screen name="MainTabs" component={MainTabs} />

          <Stack.Screen name="AddNotesScreen" component={AddNotesScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </>
    
  );
}