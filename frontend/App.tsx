import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotesScreen from './screens/NotesScreen';
import AddNotesScreen from './screens/AddNotesScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  return (

    // Navigator Container
    <NavigationContainer>

      {/* Hides Default Top Bar */}
      <Stack.Navigator screenOptions = {{ headerShown: false}} initialRouteName="LoadingScreen">

        {/* Loading Screen */}
        <Stack.Screen name = "LoadingScreen" component = {LoadingScreen} />

        {/* Home Screen */}
        <Stack.Screen name = "HomeScreen" component = {HomeScreen} />

        {/* Settings Screen */}
        <Stack.Screen name = "SettingsScreen" component = {SettingsScreen} />

        {/* Notes Screen */}
        <Stack.Screen name = "NotesScreen" component = {NotesScreen} />

        {/* AddNotes Screen */}
        <Stack.Screen name = "AddNotesScreen" component = {AddNotesScreen} />

        {/* Login Screen */}
        <Stack.Screen name = "LoginScreen" component = {LoginScreen} />

      </Stack.Navigator>

    </NavigationContainer>

  );

}