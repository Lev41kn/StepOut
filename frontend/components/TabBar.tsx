import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function TabBar({ state, navigation } : any) {
  const currentRouteName = state.routeNames[state.index];

  const renderNavButton = (routeName: any, iconSource: any, targetScreen: any) => {
    const isActive = currentRouteName === targetScreen;

    return (
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => {
          if (targetScreen) {
            navigation.navigate(targetScreen);
          } else {
            console.log(`${routeName} clicked`);
          }
        }}
      >
        {isActive ? (
          <View style={styles.activeTabContainer}>
            <Image source={iconSource} style={[styles.toolbarIcon, styles.activeIcon]} />
          </View>
        ) : (
          <Image source={iconSource} style={styles.toolbarIcon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.toolbarContainer}>
      <View style={styles.toolbarCard}>
        {renderNavButton('Tasks', require('../assets/tasks_icon.png'), null)}
        {renderNavButton('Stats', require('../assets/stat_icon.png'), null)}
        {renderNavButton('Home', require('../assets/home_icon.png'), 'HomeScreen')}
        {renderNavButton('Notes', require('../assets/notes_icon.png'), 'NotesScreen')}
        {renderNavButton('Profile', require('../assets/profile_icon.png'), null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  toolbarCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F7B28B',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButton: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  activeTabContainer: {
    backgroundColor: '#6C4E31',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
  },
  activeIcon: {
    tintColor: '#F7B28B',
  },
});