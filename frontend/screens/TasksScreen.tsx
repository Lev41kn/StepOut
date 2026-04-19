import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/// --- MOCK DATABASE ---
const MOCK_SUGGESTIONS = [
  { id: 's1', text: 'Напиши комусь одне нейтральне повідомлення' },
  { id: 's2', text: 'Запиши голосове повідомлення тільки для себе' },
  { id: 's3', text: 'Подумки або письмово сформулюй простий комплімент людині' },
];

const MOCK_ARCHIVE = [
  { id: 'a1', text: 'Зроби 5 повільних вдихів і видихів 4 секунди — вдих, 6 — видих' },
  { id: 'a2', text: 'Поставити питання і вислухати відповідь' },
  { id: 'a3', text: 'Побути в компанії 2-3 людей мінімум 5 хвилин' },
];

export default function TasksScreen({ navigation }: any ) {
  // --- STATE ---
  
  const [activeTasks, setActiveTasks] = useState(MOCK_SUGGESTIONS);
  const [archivedTasks, setArchivedTasks] = useState(MOCK_ARCHIVE);

  // --- LOGIC FUNCTIONS ---

  // 1. Completing a task (Moves from Top -> Bottom)
  const completeTask = (taskToMove: any) => {
    
    setActiveTasks(current => current.filter(task => task.id !== taskToMove.id));
    
    setArchivedTasks(current => [taskToMove, ...current]);
  };

  
  const uncompleteTask = (taskToMove: any) => {
    
    setArchivedTasks(current => current.filter(task => task.id !== taskToMove.id));
    
    setActiveTasks(current => [taskToMove, ...current]);
  };

  // 3. Reloads the active tasks with fresh ones from the "database"
  const handleReload = () => {
    
    const freshTasks = [
      { id: `new_${Math.random()}`, text: `Нове згенероване завдання #${Math.floor(Math.random() * 1000)}` },
      { id: `new_${Math.random()}`, text: `Ще одне цікаве завдання #${Math.floor(Math.random() * 1000)}` },
      { id: `new_${Math.random()}`, text: `Останнє завдання на сьогодні #${Math.floor(Math.random() * 1000)}` },
    ];
    setActiveTasks(freshTasks);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} /> 
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Image source={require('../assets/settings_icon.png')} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: TASK SUGGESTIONS (ACTIVE) */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Пропозиції завдань:</Text>
            <TouchableOpacity onPress={handleReload}>
              <Image source={require('../assets/reload_icon.png')} style={styles.reloadIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            {activeTasks.length === 0 && (
              <Text style={styles.emptyText}>Ви виконали всі пропозиції! Натисніть кнопку оновлення.</Text>
            )}
            
            {activeTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskRow} 
                onPress={() => completeTask(task)}
                activeOpacity={0.7}
              >
                <Text style={styles.taskText}>{task.text}</Text>
                {/* Empty Checkbox */}
                <View style={styles.checkboxCircle} />
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* SECTION 2: TASK ARCHIVE (COMPLETED) */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Архів завдань:</Text>
          </View>

          <View style={styles.cardBody}>
            {archivedTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskRow} 
                onPress={() => uncompleteTask(task)}
                activeOpacity={0.7}
              >
                <Text style={styles.taskText}>{task.text}</Text>
                {/* Filled Checkbox (Because it's in the archive) */}
                <View style={[styles.checkboxCircle, styles.checkboxCircleActive]}>
                  <View style={styles.innerDot} />
                </View>
              </TouchableOpacity>
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