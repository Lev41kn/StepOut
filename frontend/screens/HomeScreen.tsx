import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PaperProvider, Text, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <SafeAreaView style={styles.container}>

            <View style={styles.setIcon}>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
                <Image source={require('../assets/settings_icon.png')} style={styles.setIconImg} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 40,
                paddingBottom: 130 // Padding for the floating TabBar
              }}
            >
              {/* Streak Card */}
              <View style={styles.streakWrapper}>
                <View style={styles.streakCard}>
                  <Text variant='headlineSmall' style={styles.streakText}>Стрік: 17 днів</Text>
                </View>
                <Image source={require('../assets/streak_fox.png')} style={styles.foxAvatar} />
              </View>

              {/* Mood Card */}
              <View style={styles.moodCard}>
                <Text variant='titleMedium' style={styles.moodTitle}>Оціни свій настрій:</Text>
                <View style={styles.sliderContainer}>
                  <LinearGradient
                    colors={['#F07C3B', '#F8D800', '#03C03C']}
                    start={{x: 0, y: 0}} end={{x:1, y: 0}}
                    style={styles.gradientLine}
                  />
                  <Image source={require('../assets/slider_thumb.png')} style={styles.sliderThumb} />
                </View>
              </View>

              {/* Active Card */}
              <View style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <Text variant='titleMedium' style={styles.activeHeaderText}>Активні завдання:</Text>
                </View>
                <View style={styles.activeList}>
                  <View style={styles.activeTask}>
                    <Text style={styles.activeText}>Відміть свій настрій сьогодні.</Text>
                    <View style={styles.activeCheck} />
                  </View>
                  <View style={styles.activeTask}>
                    <Text style={styles.activeText}>Привітатися з кимось — «Привіт».</Text>
                    <View style={styles.activeCheck} />
                  </View>
                  <View style={styles.activeTask}>
                    <Text style={styles.activeText}>Поставити просте питання в магазині.</Text>
                    <View style={styles.activeCheck} />
                  </View>
                </View>
              </View>

              {/* Daily Card */}
              <View style={styles.dailyCard}>
                <View style={styles.dailyHeader}>
                  <Text variant='titleMedium' style={styles.dailyHeaderText}>Завдання на день:</Text>
                </View>
                <View style={styles.dailyTask}>
                  <Text style={styles.dailyText}>Напиши одну річ, якою ти можеш бути задоволений сьогодні</Text>
                  <View style={styles.dailyCheck} />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </PaperProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBD2',
    paddingHorizontal: 20
  },
  setIcon: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  setIconImg: {
    width: 47,
    height: 47,
    resizeMode: 'contain'
  },
  streakWrapper: {
    marginTop: 8,
    position: 'relative',
    zIndex: 10,
    elevation: 10,
  },
  streakCard: {
    backgroundColor: '#FFDBAB',
    borderRadius: 20,
    height: 72,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 22,
    paddingLeft: 18,
  },
  foxAvatar: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    width: 93,
    height: 93,
    resizeMode: 'contain',
  },
  moodCard: {
    backgroundColor: '#FFDBAB',
    minHeight: 113,
    padding: 20,
    borderRadius: 20,
    marginTop: 21,
    marginBottom: 20,
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
  activeCard: {
    backgroundColor: '#FFDBAB',
    marginTop: 10,
    paddingBottom: 20,
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
    minHeight: 50,
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
  dailyCard: {
    backgroundColor: '#FFDBAB',
    marginTop: 34,
    paddingBottom: 25,
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
    minHeight: 60,
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
  }
});