import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import { PaperProvider, Text, ProgressBar, MD3LightTheme, IconButton } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

//Theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F07C3B',
    background: '#FFE5C2'
  }
};



export default function HomeScreen({ navigation }: any ) {

  return (
    
    <SafeAreaProvider>

      <PaperProvider theme = {theme}>

        <SafeAreaView style = {styles.container}>

          {/* Settings Icon */}
          <View style={styles.setIcon}>
            <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
              <Image 
                source={require('../assets/settings_icon.png')} 
                style={styles.setIconImg} 
              />
            </TouchableOpacity>
          </View>

          {/* Streak Card */}
          <View style = {styles.streakCard}>

            <Text variant = 'headlineSmall' style = {styles.streakText}>
              Стрік: 17 днів
            </Text>

            <Image
              source = {require('../assets/streak_fox.png')}
              style = {styles.foxAvatar}
            />

          </View>

          {/* Mood Card */}
          <View style = {styles.moodCard}>

            <Text variant = 'titleMedium' style = {styles.moodTitle}>
              Оціни свій настрій:
            </Text>

            <View style = {styles.sliderContainer}>

              <LinearGradient
                colors = {['#F07C3B', '#F8D800', '#03C03C']}
                start = {{x: 0, y: 0}}
                end = {{x:1, y: 0}}
                style = {styles.gradientLine}
              />

              <Image 
                source = {require('../assets/slider_thumb.png')}
                style={styles.sliderThumb} 
              />
              
            </View>

          </View>

          {/* ActiveCard */}
          <View style = {styles.activeCard}>

            <View style = {styles.activeHeader}>
              <Text variant = 'titleMedium' style = {styles.activeHeaderText}>
                Активні завдання:
              </Text>
            </View>

            <View style = {styles.activeList}>

              {/* task 1 */}
              <View style = {styles.activeTask}>
                <Text style = {styles.activeText}>Відміть свій настрій сьогодні.</Text>
                <View style = {styles.activeCheck} />
              </View>

              {/* task 2 */}
              <View style = {styles.activeTask}>
                <Text style = {styles.activeText}>Привітатися з кимось — «Привіт».</Text>
                <View style = {styles.activeCheck} />
              </View>

              {/* task 3 */}
              <View style = {styles.activeTask}>
                <Text style = {styles.activeText}>Поставити просте питання в магазині.</Text>
                <View style = {styles.activeCheck} />
              </View>

            </View>

          </View>

          {/* ActiveCard */}
          <View style = {styles.dailyCard}>

            <View style = {styles.dailyHeader}>
              <Text variant = 'titleMedium' style = {styles.dailyHeaderText}>
                Завдання на день:
              </Text>
            </View>

            <View style = {styles.dailyTask}>
                <Text style = {styles.dailyText}>Напиши одну річ,
                   якою ти можеш бути задоволений сьогодні</Text>

                <View style = {styles.dailyCheck} />
              </View>

          </View>

          {/* Toolbar Card */}
          <View style={styles.toolbarCard}>
            
            <TouchableOpacity onPress={() => console.log('Tasks clicked')}>
              <Image source={require('../assets/tasks_icon.png')} style={styles.toolbarIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Stats clicked')}>
              <Image source={require('../assets/stat_icon.png')} style={styles.toolbarIcon} />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => console.log('Home clicked')}
                style = {styles.activeTabContainer}>
                <Image source={require('../assets/home_icon.png')} style={[styles.toolbarIcon, 
                { width: 36, height: 36 }, styles.activeIcon]} />

            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Notes clicked')}>
              <Image source={require('../assets/notes_icon.png')} style={styles.toolbarIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Profile clicked')}>
              <Image source={require('../assets/profile_icon.png')} style={styles.toolbarIcon} />
            </TouchableOpacity>

          </View>

          <StatusBar style = "dark" />

        </SafeAreaView>

      </PaperProvider>

    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5C2',
    paddingHorizontal: 20
  },

  // Settings Card

  setIcon: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  setIconImg: {
    width: 47,
    height: 47,
    resizeMode: 'contain'
  },

  // Streak Card

  streakCard: {
    backgroundColor: '#FFDBAB',
    // padding: 25,
    borderRadius: 20,
    marginTop: 8,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 72,
  },
  streakText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 22,
    paddingLeft: 18,
    paddingTop: 16
  },
  foxAvatar: {
    position: 'absolute',
    right: -10,
    bottom: -33,
    width: 93,
    height: 93,
    resizeMode: 'contain'
  },

  // Mood Card

  moodCard: {
    backgroundColor: '#FFDBAB',
    height: 113,
    padding: 20,
    borderRadius: 20,
    marginTop: 21,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  moodTitle: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative'
  },
  gradientLine: {
    height: 24,
    borderRadius: 12,
    width: '100%'
  },
  sliderThumb: {
    position: 'absolute',
    left: '15%',
    bottom: -2,
  },

  // Active Card

  activeCard: {
    backgroundColor: '#FFDBAB',
    height: 196,
    marginTop: 43,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  activeHeader: {
    backgroundColor: '#FFAD76',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 33,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  activeHeaderText: {
    fontWeight: 'bold',
    color: '#000'
  },
  activeList: {
    paddingTop: 10,
    padding: 27,
    gap: 12
  },
  activeTask: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEC386',
    paddingTop: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  activeText: {
    flex: 1,
    color: '#333',
    marginRight: 15,
    fontSize: 13
  },
  activeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5A96C'
  },

  // Daily Card

  dailyCard: {
    backgroundColor: '#FFDBAB',
    height: 114,
    marginTop: 34,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  dailyHeader: {
    backgroundColor: '#FFAD76',
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 33,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  dailyHeaderText: {
    fontWeight: 'bold',
    color: '#000'
  },
  dailyTask: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEC386',
    marginTop: 21,
    marginHorizontal: 27,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  dailyText: {
    flex: 1,
    color: '#333',
    marginRight: 15,
    fontSize: 13
  },
  dailyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5A96C'
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
    // 1. Delete the padding!
    // 2. Set an exact width and height so it cannot be squished
    width: 56,
    height: 56,
    // 3. Make the borderRadius exactly HALF of the width/height (56 / 2 = 28)
    borderRadius: 24, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    width: 32, 
    height: 32,
    tintColor: '#FDF1E5', 
    // --- NEW SHADOW PROPERTIES ---
    shadowColor: '#000000', // Black shadow
    shadowOffset: { width: 0, height: 2 }, // Pushes the shadow down slightly
    shadowOpacity: 0.4, // Makes it semi-transparent (0.0 to 1.0)
    shadowRadius: 3, // Blurs the edges
  },

});