import React, { useState, useCallback } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 IMPORT YOUR API URL (Make sure the path is correct for your folder structure!)
import { API_URL } from '../config'; 

export default function NotesScreen({ navigation } : any) {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true); // Added a quick loading state!

   useFocusEffect(
     useCallback(() => {
       const fetchCloudNotes = async () => {
         try {
           setLoading(true);
           // 1. Get the VIP Wristband
           const token = await AsyncStorage.getItem('userToken');
           
           if (!token) {
             console.log("No token found");
             return;
           }

           // 2. Ask the Waiter for this specific user's notes
           // Assuming Vlad's blueprint is registered under /api/notes
           const response = await fetch(`${API_URL}/notes/`, {
             method: 'GET',
             headers: {
               'Authorization': `Bearer ${token}`, // Pass the wristband!
               'Content-Type': 'application/json',
             },
           });

           const data = await response.json();

           // 3. Save the cloud notes to the screen
           if (response.ok && data.status === 'success') {
             setNotes(data.notes);
           } else {
             console.error("Backend error:", data);
             console.log("Token being sent:", token);
           }
         } catch (error) {
           console.error("Network error fetching notes:", error);
         } finally {
           setLoading(false);
         }
       };

       fetchCloudNotes();
     }, [])
   );

const renderNoteCard = ({ item }: any) => {
    return (
      
      <TouchableOpacity
        style={styles.noteCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddNotesScreen', { note: item })}
      >
        <ImageBackground
          source={require('../assets/savednote_bg.png')}
          style={styles.cardBackground}
          resizeMode="stretch" 
        >
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {/* Added a little pin icon if Vlad's DB says it's pinned! */}
              {item.is_pinned ? '📌 ' : ''}{item.title || 'Без назви'}
            </Text>
            {/* 🔴 Changed item.date to item.created_at to match database */}
            <Text style={styles.noteDate}>{item.created_at}</Text>
          </View>

          <View style={styles.noteBody}>
             {/* 🔴 Changed item.text to item.content to match database */}
            <Text style={styles.notePreview} numberOfLines={2}>{item.content || '...'}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Image source={require('../assets/notes_search_icon.png')} style={styles.searchBarIcon} />
        <Text style={styles.searchBarText}>Нотатки</Text>
        <Image source={require('../assets/notes_archive_icon.png')} style={styles.searchBarIcon} />
      </View>

      {/* Show a spinner while the cloud is fetching, otherwise show the list */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFB07D" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notes}
          // 🔴 Changed to item.id to match database primary key
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNoteCard}
          contentContainerStyle={styles.contentArea}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>У вас ще немає нотаток. Створіть першу!</Text>
          }
        />
      )}

      {/* 🔴 TEMPORARY NUKE BUTTON - DELETE THIS LATER!
      <TouchableOpacity 
        style={{ backgroundColor: 'red', padding: 15, marginHorizontal: 20, marginTop: 10, borderRadius: 10 }}
        onPress={async () => {
          await AsyncStorage.removeItem('userToken');
          alert("Token Deleted! Please reload the app.");
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
          NUKE OLD TOKEN
        </Text>
      </TouchableOpacity> */}

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
  container: { flex: 1, backgroundColor: '#FFEBD2' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFB07D', borderRadius: 25, paddingVertical: 10,
    paddingHorizontal: 15, marginHorizontal: 20, marginTop: 10,
  },
  searchBarIcon: { width: 30, height: 30, resizeMode: 'contain' },
  searchBarText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  contentArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160, // Extra padding at the bottom so elements don't get stuck behind the floating action button
  },
  noteCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardBackground: {
    width: '100%',
    minHeight: 110, // Gives the card a stable structural block form factor
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 38, // Fits the text exactly within the top dark orange band of your asset
    paddingHorizontal: 18,
  },
  noteTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginRight: 10,
  },
  noteDate: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  noteBody: {
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  notePreview: {
    fontSize: 13,
    color: '#5C3A21',
    lineHeight: 18,
  },
  plus: {
    position: 'absolute',
    bottom: 95, // Lifts the button nicely clear of the bottom screen edge
    right: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Guarantees it floats over top of any scroll elements
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#5C3A21', 
    fontSize: 16 
  },
  plusIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }
});