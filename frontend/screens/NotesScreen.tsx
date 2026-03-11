import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function NotesScreen({navigation} : any){


    return (

        <SafeAreaView style={styles.container}>

            {/* Search Bar */}
            <View style = {styles.searchBar}>

                <Image source = {require('../assets/notes_search_icon.png')} style = {styles.searchBarIcon} />
                <Text style = {styles.searchBarText}>Нотатки</Text>
                <Image source = {require('../assets/notes_archive_icon.png')} style = {styles.searchBarIcon} />

            </View>

            {/* Notes Area */}
            <View style = {styles.contentArea}>

            </View>

            {/* New Note Button */}
            <TouchableOpacity
                style = {styles.plus}
                onPress = {() => navigation.navigate('AddNotesScreen')}>

                <Image source = {require('../assets/new_note_icon.png')} 
                    style = {styles.plusIcon} />

            </TouchableOpacity>

            {/* Toolbar Card */}
            <View style={styles.toolbarCard}>
                        
                <TouchableOpacity style = {styles.navButton}
                    onPress={() => console.log('Tasks clicked')}>
                    <Image source={require('../assets/tasks_icon.png')} style={styles.toolbarIcon} />
                </TouchableOpacity>
            
                <TouchableOpacity style = {styles.navButton}
                    onPress={() => console.log('Stats clicked')}>
                    <Image source={require('../assets/stat_icon.png')} style={styles.toolbarIcon} />
                </TouchableOpacity>
            
                <TouchableOpacity style = {styles.navButton}
                    onPress={() => navigation.navigate('HomeScreen')}>
                    <Image source={require('../assets/home_icon.png')} style={styles.toolbarIcon} />
                </TouchableOpacity>
            
                <TouchableOpacity 
                    onPress={() => navigation.navigate('NotesScreen')}
                    style = {styles.navButton}>
                    <View style = {styles.activeTabContainer}>
                        <Image source={require('../assets/notes_icon.png')} 
                    style={[styles.toolbarIcon, styles.activeIcon]} />
                    </View>
                </TouchableOpacity>
            
                <TouchableOpacity style = {styles.navButton}
                    onPress={() => console.log('Profile clicked')}>
                    <Image source={require('../assets/profile_icon.png')} style={styles.toolbarIcon} />
                </TouchableOpacity>
            
            </View>

        </SafeAreaView>

    )

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFEBD2'
    },

    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFB07D',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginTop: 10,
    },
    searchBarIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    searchBarText: {
        fontSize: 18,
        color: '#333',
    },

    // Notes Area
    contentArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // New Note
    plus: {
        position: 'absolute',
        bottom: 95,
        right: 20,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    plusIcon: {

    },

    // Toolbar Card

    toolbarCard: {
        height: 70,
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: '#FFB07D',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 17,
        paddingBottom: 16,
        // borderTopLeftRadius: 25,
        // borderTopRightRadius: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    toolbarIcon: {

    },
    activeTabContainer: {
        backgroundColor: 'rgba(107, 66, 38, 0.15)',
        width: 56,
        height: 56,
        borderRadius: 24, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButton: {
        flex: 1,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIcon: {
        width: 32, 
        height: 32,
        tintColor: '#FDF1E5',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },

})