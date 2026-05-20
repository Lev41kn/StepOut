import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// 🔴 DON'T FORGET YOUR API URL!
import { API_URL } from '../config'; 

export default function TasksScreen({ navigation }: any ) {
  // --- CLOUD STATE ---
  const [lockedTasks, setLockedTasks] = useState<any[]>([]); 
  const [suggestions, setSuggestions] = useState<any[]>([]); 
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH ALL DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const todayRes = await fetch(`${API_URL}/tasks/today`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const todayData = await todayRes.json();
      if (todayRes.ok && todayData.status === 'success') {
        setLockedTasks(todayData.active_tasks || []);
      }

      const sugRes = await fetch(`${API_URL}/tasks/suggestions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sugData = await sugRes.json();
      if (sugRes.ok && sugData.status === 'success') {
        setSuggestions(sugData.suggestions || []);
      }

      const archRes = await fetch(`${API_URL}/tasks/archive`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const archData = await archRes.json();
      if (archRes.ok && archData.status === 'success') {
        setArchivedTasks(archData.archive || []);
      }

    } catch (error) {
      console.error("Error fetching tasks data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // --- 2. RELOAD SUGGESTIONS ---
  const handleReload = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/tasks/suggestions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error reloading suggestions:", error);
    }
  };

  // --- 3. PICK A TASK ---
  const pickTask = async (task: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/tasks/pick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_id: task.raw_id })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        fetchData(); // Reload to show it locked!
      } else {
        Alert.alert("Увага", data.message || "Не вдалося додати завдання.");
      }
    } catch (error) {
      console.error("Error picking task:", error);
    }
  };

  // --- 4. 🟢 UNPICK A TASK ---
  const unpickTask = async (userTaskId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/tasks/remove/${userTaskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        fetchData(); // Reload to bring back an empty slot & suggestion!
      } else {
        Alert.alert("Увага", data.message || "Не вдалося скасувати завдання.");
      }
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };


  // --- 5. COMBINE LISTS FOR DISPLAY ---
  const emptySlots = Math.max(0, 3 - lockedTasks.length);
  
  const displayTasks = [
    ...lockedTasks.map(t => ({ 
        id: `locked_${t.user_task_id}`, 
        raw_id: t.user_task_id,
        description: t.description, 
        isLocked: true,
        isCompleted: t.is_completed // 🟢 Track if it's already done!
    })),
    ...suggestions.slice(0, emptySlots).map(t => ({ 
        id: `sugg_${t.id}`, 
        raw_id: t.id,
        description: t.description, 
        isLocked: false,
        isCompleted: false
    }))
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }} /> 
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Image source={require('../assets/settings_icon.png')} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: TASK SUGGESTIONS */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Пропозиції завдань:</Text>
            {lockedTasks.length < 3 && (
                <TouchableOpacity onPress={handleReload}>
                  <Image source={require('../assets/reload_icon.png')} style={styles.reloadIcon} />
                </TouchableOpacity>
            )}
          </View>

          <View style={styles.cardBody}>
            {isLoading ? (
               <ActivityIndicator size="small" color="#5C3A21" style={{ marginVertical: 20 }} />
            ) : displayTasks.length === 0 ? (
              <Text style={styles.emptyText}>Немає доступних завдань.</Text>
            ) : (
              displayTasks.map((task) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskRow} 
                  onPress={() => {
                      // 🟢 SMART LOGIC: Decide what to do when tapped!
                      if (task.isLocked) {
                          if (task.isCompleted) {
                              Alert.alert("Молодець!", "Ви вже виконали це завдання на Головному екрані. Його не можна скасувати!");
                          } else {
                              unpickTask(task.raw_id);
                          }
                      } else {
                          pickTask(task);
                      }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.taskText}>{task.description}</Text>
                  
                  <View style={[styles.checkboxCircle, task.isLocked && styles.checkboxCircleActive]}>
                     {task.isLocked && <View style={styles.innerDot} />}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* SECTION 2: TASK ARCHIVE */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Архів завдань:</Text>
          </View>

          <View style={styles.cardBody}>
            {archivedTasks.length === 0 && !isLoading && (
               <Text style={styles.emptyText}>Ваш архів поки що порожній. Виконуйте завдання, щоб заповнити його!</Text>
            )}

            {archivedTasks.map((task, index) => (
              <View key={index} style={styles.taskRow}>
                <Text style={styles.taskText}>
                    <Text style={{ fontWeight: 'bold', color: '#A98A73' }}>{task.assigned_date}: </Text>
                    {task.description}
                </Text>
                <View style={[styles.checkboxCircle, styles.checkboxCircleActive]}>
                  <View style={styles.innerDot} />
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBD2', 
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFAA77',
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#FDE4CC', 
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5, 
    overflow: 'hidden', 
  },
  cardHeader: {
    backgroundColor: '#FFAA77', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21', 
  },
  reloadIcon: {
    width: 24,
    height: 24,
    tintColor: '#5C3A21',
    resizeMode: 'contain',
  },
  cardBody: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#A98A73',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  taskRow: {
    backgroundColor: '#FCD7B5', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskText: {
    flex: 1, 
    fontSize: 13,
    color: '#5C3A21',
    fontWeight: '500',
    paddingRight: 15,
    lineHeight: 18,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D7B9A1', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCircleActive: {
    backgroundColor: '#C59D82', 
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5C3A21', 
  },
});