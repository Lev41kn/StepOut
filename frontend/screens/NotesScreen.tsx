import React, { useState, useCallback } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotesScreen({ navigation } : any) {
    const [notes, setNotes] = useState<any[]>([]);

   useFocusEffect(
     useCallback(() => {
       const loadNotes = async () => {
         try {
           const storedNotes = await AsyncStorage.getItem('@stepout_notes');
           if (storedNotes) {
             setNotes(JSON.parse(storedNotes));
           }
         } catch (error) {
           console.error("Error loading notes:", error);
         }
       };
       loadNotes();
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
          resizeMode="stretch" // Ensures the asset spans the full box boundaries perfectly
        >
          {/* Card Header Content Area */}
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Без назви'}</Text>
            <Text style={styles.noteDate}>{item.date}</Text>
          </View>

          {/* Card Body Content Area */}
          <View style={styles.noteBody}>
            <Text style={styles.notePreview} numberOfLines={2}>{item.text || '...'}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Image source={require('../assets/notes_search_icon.png')} style={styles.searchBarIcon} />
        <Text style={styles.searchBarText}>Нотатки</Text>
        <Image source={require('../assets/notes_archive_icon.png')} style={styles.searchBarIcon} />
      </View>

      {/* Notes Area (Scrollable List) */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteCard}
        contentContainerStyle={styles.contentArea}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>У вас ще немає нотаток. Створіть першу!</Text>
        }
      />

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
});