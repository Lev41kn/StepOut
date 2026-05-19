import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 DON'T FORGET TO IMPORT YOUR API URL!
import { API_URL } from '../config'; 

export default function AddNoteScreen({route, navigation } : any) {

    const existingNote = route.params?.note;
    
    // 🟢 UPDATED: Look for .content first (from the database), fallback to .text just in case
    const [noteTitle, setNoteTitle] = useState(existingNote ? existingNote.title : '');
    const [noteText, setNoteText] = useState(existingNote ? (existingNote.content || existingNote.text) : '');

    const [isTyping, setIsTyping] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    const finishTyping = () => {
        Keyboard.dismiss();
        setIsTyping(false);
    }

    // 🟢 UPDATED: Cloud Delete Function
    const handleDelete = async () => {
        setDeleteModalVisible(false);
        
        if (existingNote) {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                // Send DELETE request to Vlad's route: /api/notes/<id>
                const response = await fetch(`${API_URL}/notes/${existingNote.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error("Failed to delete from cloud");
                    Alert.alert("Помилка", "Не вдалося видалити нотатку.");
                    return; // Stop here if it failed
                }
            } catch (error) {
                console.error("Network error during delete:", error);
                return;
            }
        }
        navigation.goBack();
    }

    // 🟢 UPDATED: Cloud Save & Update Function
    const handleSaveAndExit = async () => {
        // Only save if there is actually text!
        if (noteTitle.trim().length > 0 || noteText.trim().length > 0) {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert("Помилка", "Ви не авторизовані.");
                    return;
                }

                // If we are editing an old note, use PUT and attach the ID. If new, use POST.
                const url = existingNote ? `${API_URL}/notes/${existingNote.id}` : `${API_URL}/notes/`;
                const method = existingNote ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: noteTitle,
                        content: noteText, // Map your noteText state to the 'content' column in DB
                        is_pinned: existingNote?.is_pinned || false // Keep it pinned if it was already pinned!
                    }),
                });

                const data = await response.json();
                
                if (!response.ok) {
                    console.error("Backend Error:", data);
                    Alert.alert("Помилка", data.message || "Не вдалося зберегти нотатку");
                    return; // Don't exit the screen if save failed
                }
            } catch (error) {
                console.error("Network error during save:", error);
                Alert.alert("Помилка", "Перевірте підключення до інтернету");
                return;
            }
        }
        
        // If save was successful (or if inputs were completely empty), go back to list
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={handleSaveAndExit}>
                        <Image source={require('../assets/return_icon.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <View style={styles.headerRightControls}>
                        <View style={styles.actionPill}>
                            <TouchableOpacity>
                                <Image source={require('../assets/notes_import_icon.png')} style={styles.smallIcon} />
                            </TouchableOpacity>
                            {/* --- HOOKED UP DELETE BUTTON --- */}
                            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                                <Image source={require('../assets/notes_delete_icon.png')} style={styles.smallIcon} />
                            </TouchableOpacity>
                        </View>

                        {isTyping && (
                            <TouchableOpacity style={styles.checkCircle} onPress={finishTyping}>
                                <Image source={require('../assets/notes_done_icon.png')} style={styles.checkIcon} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 🟢 UPDATED: Show cloud created_at date instead of local formatted date */}
                <Text style={styles.dateText}>
                    {existingNote ? (existingNote.created_at || existingNote.date) : 'Нова нотатка'}
                </Text>
                
                {/* Title Input */}
                <TextInput
                    style={{ paddingHorizontal: 25, fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 }}
                    placeholder="Назва нотатки"
                    placeholderTextColor="#A98A73"
                    value={noteTitle}
                    onChangeText={setNoteTitle}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                />

                {/* Text Input */}
                <TextInput
                    style={styles.textInput}
                    placeholder="Почніть писати тут..."
                    placeholderTextColor="#000"
                    multiline={true}
                    textAlignVertical='top'
                    value={noteText}
                    onChangeText={setNoteText}
                    keyboardAppearance="light"
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                />

                {/* Dynamic Bottom Toolbar */}
                {isTyping ? (
                    <View style={styles.typingToolbar}>
                        <TouchableOpacity><Image source={require('../assets/notes_font_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_list_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_table_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_paperclip_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_center_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_link_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        <TouchableOpacity><Image source={require('../assets/notes_pencil_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bottomToolbar}>
                        <View style={styles.toolsPill}>
                            <TouchableOpacity><Image source={require('../assets/notes_list_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                            <TouchableOpacity><Image source={require('../assets/notes_paperclip_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                            <TouchableOpacity><Image source={require('../assets/notes_pencil_icon.png')} style={styles.toolIcon} /></TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.newNote}
                            onPress={() => {
                                setNoteTitle('');
                                setNoteText('');
                                finishTyping();
                            }}
                        >
                            <Image source={require('../assets/notes_create_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                transparent={true}
                visible={isDeleteModalVisible}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Ви дійсно бажаєте{'\n'}видалити цю нотатку?
                        </Text>

                        <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
                            <Text style={styles.modalButtonTextRed}>Видалити</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={() => setDeleteModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Скасувати</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFEBD2',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        alignItems: 'center'
    },
    icon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    actionPill: {
        flexDirection: 'row',
        backgroundColor: '#FFBF93',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 15,
    },
    smallIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#5C3A21',
    },
    dateText: {
        textAlign: 'center',
        color: '#6B4226',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 10,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 20,
        fontSize: 16,
        color: '#333',
    },
    bottomToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    toolsPill: {
        flexDirection: 'row',
        backgroundColor: '#FFBF93',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 15,
    },
    toolIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: '#5C3A21',
    },
    newNote: {
        backgroundColor: '#FFBF93',
        borderRadius: 12,
        padding: 10,
    },
    typingToolbar: {
        flexDirection: 'row',
        backgroundColor: '#FFBF93',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    headerRightControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkCircle: {
        backgroundColor: '#FFBF93',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#5C3A21',
    },

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFAA77',
        width: '75%',
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    modalButton: {
        backgroundColor: '#FFEBD2',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 8,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    modalButtonTextRed: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C00000',
    }
});