import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';

export default function SettingsScreen({ navigation }: any){

    return (

        <SafeAreaView style={styles.container}>
           
            {/* Top Bar */}
            <View style = {styles.topBar}>

                <TouchableOpacity onPress = {() => navigation.goBack()}>

                    <Image source = {require('../assets/return_icon.png')} style = {styles.returnIcon} />

                </TouchableOpacity>

                <Image source = {require('../assets/settings_icon.png')} style = {styles.settingsIcon} />

            </View>

            {/* Button List */}
            <View style = {styles.buttonList}>

                <TouchableOpacity style={styles.menuButton}>

                    <Image source={require('../assets/arrow_icon.png')} style={styles.menuArrow} />

                    <Text style={styles.menuText}>Приватність</Text>

                </TouchableOpacity>


                <TouchableOpacity style={styles.menuButton}>

                    <Image source={require('../assets/arrow_icon.png')} style={styles.menuArrow} />

                    <Text style={styles.menuText}>Мова</Text>
                    
                </TouchableOpacity>



                <TouchableOpacity style={styles.menuButton}>

                    <Image source={require('../assets/arrow_icon.png')} style={styles.menuArrow} />

                    <Text style={styles.menuText}>Тема</Text>
                    
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>

                    <Image source={require('../assets/arrow_icon.png')} style={styles.menuArrow} />

                    <Text style={styles.menuText}>Лого</Text>
                    
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>

                    <Image source={require('../assets/arrow_icon.png')} style={styles.menuArrow} />

                    <Text style={styles.menuText}>Сповіщення</Text>
                    
                </TouchableOpacity>


            </View>

            {/* Info Bar */}
            <View style = {styles.infoContainer}>

                <View style = {styles.infoHeader}>

                    <Image source = {require('../assets/mail_icon.png')} style = {styles.mailIcon} />

                    <Text style = {styles.headerText}>Зв'язок з нами:</Text>

                </View>

                <Text style = {styles.contactText}>

                    Питання та підтримка: <Text style = {styles.mailText}>support@пошта.com</Text>

                </Text>

                <Text style = {styles.contactText}>

                    Бізнес та пропозиції: <Text style = {styles.mailText}>business@пошта.com</Text>
                    
                </Text>

            </View>

            {/* Toolbar Card */}
            <View style={styles.toolbarCard}>
                        
                        <TouchableOpacity onPress={() => console.log('Tasks clicked')}>
                          <Image source={require('../assets/tasks_icon.png')} style={styles.toolbarIcon} />
                        </TouchableOpacity>
            
                        <TouchableOpacity onPress={() => console.log('Stats clicked')}>
                          <Image source={require('../assets/stat_icon.png')} style={styles.toolbarIcon} />
                        </TouchableOpacity>
            
                        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
                          <Image source={require('../assets/home_icon.png')} style={styles.toolbarIcon} />
                        </TouchableOpacity>
            
                        <TouchableOpacity onPress={() => console.log('Notes clicked')}>
                          <Image source={require('../assets/notes_icon.png')} style={styles.toolbarIcon} />
                        </TouchableOpacity>
            
                        <TouchableOpacity onPress={() => console.log('Profile clicked')}>
                          <Image source={require('../assets/profile_icon.png')} style={styles.toolbarIcon} />
                        </TouchableOpacity>
            
                      </View>

        </SafeAreaView>

    )

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFEBD2',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    returnIcon: {
        // marginLeft: 17,
        width: 40,
        height: 40,
        // marginTop: 39,
        resizeMode: 'contain',
    },
    settingsIcon: {
        // marginTop: 10,
        // marginRight: 11,
        width: 47,
        height: 47,
        resizeMode: 'contain',
    },
    buttonList: {
        paddingHorizontal: 20,
        marginTop: 40,
        gap: 15,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFB87B', // The lighter orange for the buttons
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        alignSelf: 'flex-start',
        width: '60%',
    },
    menuArrow: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10,
    },
    menuText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 110,
        left: 20,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    mailIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 8,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    contactText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    mailText: {
        color: '#F07C3B',
        fontWeight: 'bold',
    },
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

});