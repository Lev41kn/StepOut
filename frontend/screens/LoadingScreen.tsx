import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

import { useFonts } from 'expo-font';

export default function LoadingScreen( {navigation}: any ){

    // Font
    const [fontsLoaded] = useFonts({
        'Vollkorn-ExtraBold': require('../assets/fonts/Vollkorn-ExtraBold.ttf')
    })

    // Loading Timer
    useEffect(() => {

        const timer = setTimeout(() => {

                navigation.replace('HomeScreen');

        }, 3000); // in milliseconds
            
        return () => clearTimeout(timer);

    }, [navigation]);

    

    if(!fontsLoaded){
        return null;
    }

    // Screen
    return (

        <View style = {styles.container}>

            {/* Art Container */}
            <View style = {styles.artContainer}>

                {/* Four Stars */}
                {/* Numbers form left to right */}
                <Image source={require('../assets/loading_star.png')} 
                 style = {[styles.star, styles.firstStar]}/>
                <Image source={require('../assets/loading_star.png')}
                 style = {[styles.star, styles.secondStar]}/>
                <Image source={require('../assets/loading_star.png')}
                 style = {[styles.star, styles.thirdStar]}/>
                <Image source={require('../assets/loading_star.png')}
                 style = {[styles.star, styles.fourthStar]}/>

                {/* Loading Fox */}
                <Image
                 source = {require('../assets/loading_fox.png')}
                 style = {styles.loadingFoxImage}
                />

            </View>

            {/* App Name */}
            <Text style = {styles.appName}>StepOut</Text>

        </View>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFEBD2',
        alignItems: 'center',
        justifyContent: 'center'
    },
    artContainer: {
        // backgroundColor: '#FFF',
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    star: {
        color: '#FF9049',
        position: 'absolute',
        resizeMode: 'contain'
    },
    firstStar: {
        left: '-27%',
        top: '12%',
        width: 24,
        height: 20
    },
    secondStar: {
        left: '5%',
        top: '-40%',
        width: 22,
        height: 26
    },
    thirdStar: {
        left: '50%',
        top: '-20%',
        width: 16,
        height: 20
    },
    fourthStar: {
        right: '-25%',
        top: '-10%',
        width: 22,
        height: 26
    },
    loadingFoxImage: {
        width: 267.67,
        height: 242,
        resizeMode: 'contain'
    },
    appName: {
        position: 'absolute',
        bottom: 55,
        fontSize: 28,
        color: '#613403',
        fontFamily: 'Vollkorn-ExtraBold'
    },

});