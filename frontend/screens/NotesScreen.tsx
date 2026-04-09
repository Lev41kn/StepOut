import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen({ navigation } : any) {
    return (
        <SafeAreaView style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Image source={require('../assets/notes_search_icon.png')} style={styles.searchBarIcon} />
                <Text style={styles.searchBarText}>Нотатки</Text>
                <Image source={require('../assets/notes_archive_icon.png')} style={styles.searchBarIcon} />
            </View>

            {/* Notes Area */}
            <View style={styles.contentArea}>
            </View>

            {/* New Note Button */}
            <TouchableOpacity
                style={styles.plus}
                onPress={() => navigation.navigate('AddNotesScreen')}
            >
                <Image source={require('../assets/new_note_icon.png')} style={styles.plusIcon} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFEBD2'
    },
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
    contentArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
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
    }
});