import React, { useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { PaperProvider, Text, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { API_URL } from '../config'; 

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
  // --- CLOUD STATE ---
  const [streak, setStreak] = useState(0);
  const [moodValue, setMoodValue] = useState(50);
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);

  // 🟢 REAL TASKS STATE
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [dailyTask, setDailyTask] = useState<any>(null); // We only have 1 daily task

  // --- 1. LOAD DATA WHEN SCREEN OPENS ---
  useFocusEffect(
    useCallback(() => {
      
      const fetchTodayMood = async (token: string) => {
        try {
          const response = await fetch(`${API_URL}/mood/today`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            setStreak(data.streak);
            if (data.today_mood !== null) {
              setMoodValue(data.today_mood);
              setHasLoggedMoodToday(true);
            } else {
              setHasLoggedMoodToday(false);
            }
          }
        } catch (error) {
          console.error("Error fetching mood:", error);
        }
      };

      // 🟢 NEW: FETCH TASKS FROM CLOUD
      const fetchTodayTasks = async (token: string) => {
        try {
          const response = await fetch(`${API_URL}/tasks/today`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.status === 'success') {
            setDailyTask(data.daily_task);
            setActiveTasks(data.active_tasks || []);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      const loadAllData = async () => {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) return;
          await fetchTodayMood(token);
          await fetchTodayTasks(token);
      };

      loadAllData();
    }, [])
  );

  // --- 2. SAVE MOOD TO CLOUD ---
  const handleSlidingComplete = async (val: number) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(`${API_URL}/mood/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mood_value: val }),
        });

        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setStreak(data.streak); 
          setHasLoggedMoodToday(true);
        } else {
          Alert.alert("Помилка", "Не вдалося зберегти настрій.");
        }
      } catch (error) {
        console.error("Network error saving mood:", error);
      }
  };

  // --- 3. 🟢 TOGGLE CLOUD TASKS ---
  const toggleTask = async (userTaskId: number, isDaily: boolean = false) => {
    // 1. Optimistic UI update (feels instant to the user)
    if (isDaily && dailyTask) {
        setDailyTask({ ...dailyTask, is_completed: !dailyTask.is_completed });
    } else {
        setActiveTasks(currentTasks => 
            currentTasks.map(task => 
                task.user_task_id === userTaskId ? { ...task, is_completed: !task.is_completed } : task
            )
        );
    }

    // 2. Tell the server
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(`${API_URL}/tasks/toggle/${userTaskId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok && data.status === 'success') {
            setStreak(data.streak); // Update streak if this task changed it!
        } else {
            console.error("Failed to toggle task in cloud.");
        }
    } catch (error) {
        console.error("Network error toggling task:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <SafeAreaView style={styles.container}>

            {/* TOP SETTINGS ICON */}
            <View style={styles.setIcon}>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
                <Image source={require('../assets/settings_icon.png')} style={styles.setIconImg} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 40, paddingBottom: 130 }}>
              
              {/* STREAK CARD */}
              <View style={styles.streakWrapper}>
                <View style={styles.streakCard}>
                  <Text variant='headlineSmall' style={styles.streakText}>Стрік: {streak} днів</Text>
                </View>
                <Image source={require('../assets/streak_fox.png')} style={styles.foxAvatar} />
              </View>

             {/* MOOD CARD */}
             <View style={styles.moodCard}>
               <Text variant='titleMedium' style={styles.moodTitle}>
                 {hasLoggedMoodToday ? 'Настрій на сьогодні збережено!' : 'Оціни свій настрій:'}
               </Text>
               <View style={styles.sliderContainer}>
                 <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center' }}>
                   <LinearGradient
                     colors={['#F07C3B', '#F8D800', '#03C03C']}
                     start={{x: 0, y: 0}} end={{x:1, y: 0}}
                     style={styles.gradientLine}
                   />
                 </View>
                 <View style={{ height: '100%', marginHorizontal: 12 }}>
                   <Image
                     source={require('../assets/slider_thumb.png')}
                     pointerEvents="none"
                     style={[styles.sliderThumb, { left: `${moodValue}%`, transform: [{ translateX: -10 }] }]}
                   />
                   <Slider
                     style={{ position: 'absolute', width: '100%', height: 80, top: -20 }}
                     minimumValue={0}
                     maximumValue={100}
                     value={moodValue}
                     onValueChange={setMoodValue}
                     onSlidingComplete={handleSlidingComplete}
                     minimumTrackTintColor="transparent"
                     maximumTrackTintColor="transparent"
                     thumbTintColor="transparent"
                   />
                 </View>
               </View>
             </View>

              {/* 🟢 ACTIVE TASKS CARD */}
              <View style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <Text variant='titleMedium' style={styles.activeHeaderText}>Активні завдання:</Text>
                </View>
                <View style={styles.activeList}>
                  
                  {activeTasks.length > 0 ? (
                      activeTasks.map((task) => (
                        <TouchableOpacity 
                          key={task.user_task_id} 
                          style={styles.activeTask}
                          onPress={() => toggleTask(task.user_task_id, false)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.activeText}>{task.description}</Text>
                          <View style={[styles.activeCheck, task.is_completed && styles.activeCheckCompleted]}>
                            {task.is_completed ? <Text style={styles.checkMarkText}>✓</Text> : null}
                          </View>
                        </TouchableOpacity>
                      ))
                  ) : (
                      <Text style={{ textAlign: 'center', color: '#A98A73', marginTop: 10 }}>
                          Немає активних завдань. Перейдіть у вкладку Завдання, щоб обрати їх!
                      </Text>
                  )}

                </View>
              </View>

              {/* 🟢 DAILY TASK CARD */}
              <View style={styles.dailyCard}>
                <View style={styles.dailyHeader}>
                  <Text variant='titleMedium' style={styles.dailyHeaderText}>Завдання на день:</Text>
                </View>
                
                {dailyTask ? (
                  <TouchableOpacity 
                    style={styles.dailyTask}
                    onPress={() => toggleTask(dailyTask.user_task_id, true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dailyText}>{dailyTask.description}</Text>
                    <View style={[styles.dailyCheck, dailyTask.is_completed && styles.activeCheckCompleted]}>
                      {dailyTask.is_completed ? <Text style={styles.checkMarkText}>✓</Text> : null}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ textAlign: 'center', color: '#A98A73', marginTop: 20 }}>
                      Завантаження завдання...
                  </Text>
                )}
                
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
      paddingBottom: 25,
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
        paddingTop: 21,
        paddingBottom: 0,
        paddingHorizontal: 27,
        gap: 15,
      },
  activeTask: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEC386',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    backgroundColor: '#E5A96C',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeCheckCompleted: {
    backgroundColor: '#C5894C',
  },
  checkMarkText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
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
    backgroundColor: '#E5A96C',
    justifyContent: 'center',
    alignItems: 'center'
  }
});