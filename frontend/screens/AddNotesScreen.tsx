import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function AddNoteScreen({navigation} : any) {

    const [noteText, setNoteText] = useState('');

    const [isTyping, setIsTyping] = useState(false);

    const finishTyping = () => {
        Keyboard.dismiss();
        setIsTyping(false);
    }

    return (

        <SafeAreaView style = {styles.container}>

            <KeyboardAvoidingView
                behavior = {Platform.OS === 'ios' ? 'padding' : 'height'}
                style ={{ flex: 1 }}
            >

                {/* Header */}
                <View style={styles.headerRow}>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../assets/return_icon.png')} style={styles.icon} />
                    </TouchableOpacity>

                    <View style={styles.headerRightControls}>
            
                        <View style={styles.actionPill}>
                            <TouchableOpacity>
                                <Image source={require('../assets/notes_import_icon.png')} style={styles.smallIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity>
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

                {/* Date text */}
                <Text style = {styles.dateText}>5 березня 2026р. о 22:31</Text>

                {/* Text Input */}
                <TextInput
                    style = {styles.textInput}
                    placeholder = "Почніть писати тут..."
                    placeholderTextColor = "#000"
                    multiline = {true}
                    textAlignVertical = 'top'
                    value = {noteText}
                    onChangeText = {setNoteText}
                    keyboardAppearance = "light"
                    
                    onFocus = {() => setIsTyping(true)}
                    onBlur = {() => setIsTyping(false)}
                />

                {/* Dynamic Bottom Toolbar */}

                
                {isTyping ? (

                    <View style={styles.typingToolbar}>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_font_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_list_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_table_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_paperclip_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_center_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_link_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Image source={require('../assets/notes_pencil_icon.png')} style={styles.toolIcon} />
                        </TouchableOpacity>
                    
                    </View>

                ) : (

                    <View style = {styles.bottomToolbar}>

                        <View style = {styles.toolsPill}>

                            <TouchableOpacity>
                                <Image source = {require('../assets/notes_list_icon.png')}
                                    style = {styles.toolIcon} />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Image source = {require('../assets/notes_paperclip_icon.png')}
                                    style = {styles.toolIcon} />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Image source = {require('../assets/notes_pencil_icon.png')}
                                    style = {styles.toolIcon} />
                            </TouchableOpacity>

                        </View>

                        {/* New Note Button */}
                        <TouchableOpacity
                            style = {styles.newNote}
                            onPress = { () => {
                                    setNoteText('')
                                    finishTyping
                                }
                            }
                        >
                            <Image source = {require('../assets/notes_create_icon.png')}
                                style = {styles.toolIcon} />

                        </TouchableOpacity>

                    </View>

                )}

            </KeyboardAvoidingView>

        </SafeAreaView>

    )

}

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

})