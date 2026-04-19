import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


// --- FIXED ACHIEVEMENTS DATA ---
const ACHIEVEMENTS = [
  { id: 'badge1', image: require('../assets/ach_1.png') },
  { id: 'badge2', image: require('../assets/ach_2.png') },
  { id: 'badge3', image: require('../assets/ach_3.png') },
  { id: 'badge4', image: require('../assets/ach_4.png') },
  { id: 'badge5', image: require('../assets/ach_5.png') },
  { id: 'badge6', image: require('../assets/ach_6.png') },
  { id: 'badge7', image: require('../assets/ach_7.png') },
  { id: 'badge8', image: require('../assets/ach_8.png') },
  { id: 'badge9', image: require('../assets/ach_9.png') },
];

export default function ProfileScreen({ navigation }: any) {

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          
          {/* STATIC TOP SECTION */}
          <View style={styles.staticSection}>
            
            {/* Settings Icon */}
            <View style={styles.setIcon}>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
                <Image source={require('../assets/settings_icon.png')} style={styles.settingsIcon} />
              </TouchableOpacity>
            </View>

            {/* Main Avatar */}
            <View style={styles.avatarContainer}>
              <Image source={require('../assets/profile_fox.png')} style={styles.mainAvatar} />
            </View>

            {/* Customization Row */}
            <Text style={styles.sectionTitle}>Кастомізація персонажа:</Text>
            <View style={styles.customizationRow}>
              <TouchableOpacity>
                <Image source={require('../assets/profile_glasses.png')} style={styles.customIcon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={require('../assets/profile_hat.png')} style={styles.customIcon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={require('../assets/profile_shirt.png')} style={styles.customIcon} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={require('../assets/profile_bg.png')} style={styles.customIcon} />
              </TouchableOpacity>
            </View>

            {/* Name Box */}
            <View style={styles.nameBox}>
              <Text style={styles.nameText}>
                Ім'я:  <Text style={styles.nameBold}>Остап</Text>
              </Text>
            </View>

          </View>

          {/* SCROLLABLE BOTTOM SECTION */}
          <ScrollView 
            style={styles.scrollSection} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Мої досягнення:</Text>
            
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((badge) => (
                <TouchableOpacity key={badge.id} style={styles.badgeWrapper} activeOpacity={0.8}>
                  <Image 
                    source={badge.image} 
                    style={styles.badgeImage} 
                  />
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>

        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBD2', 
  },
  
  // --- STATIC SECTION ---
  staticSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  setIcon: {
    alignItems: 'flex-end',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#FFAA77', 
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -10,
  },
  mainAvatar: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  customizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  customIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    tintColor: '#F07C3B',
  },
  nameBox: {
    backgroundColor: '#FFDBAB',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  nameBold: {
    fontWeight: 'bold',
  },

  // --- SCROLL SECTION ---
  scrollSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  badgeWrapper: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 10,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});