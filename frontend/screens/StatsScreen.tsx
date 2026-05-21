import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// 🔴 DON'T FORGET YOUR API URL!
import { API_URL } from '../config'; 

export default function StatsScreen({ navigation }: any ) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('Дні');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = ['Дні', 'Тижні', 'Місяці'];
  const yAxis = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Visual Y-Axis (representing 10-100)

  // --- FETCH DATA FROM CLOUD ---
  const fetchChartData = async (tabName: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Translate the tab name to the API parameter Vlad expects
      let periodStr = 'days';
      if (tabName === 'Тижні') periodStr = 'weeks';
      if (tabName === 'Місяці') periodStr = 'months';

      const response = await fetch(`${API_URL}/mood/chart?period=${periodStr}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        // Vlad's API might return 30 items. 
        // To make it fit your beautiful UI, we grab only the last 7 items!
        const last7Items = data.chart_data.slice(-7);
        setChartData(last7Items);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when screen opens AND when tab changes
  useFocusEffect(
    useCallback(() => {
      fetchChartData(activeTab);
    }, [activeTab])
  );

  const getDateLabel = () => {
    if (activeTab === 'Дні') return ' Останні 7 днів ';
    if (activeTab === 'Тижні') return ' Останні 7 тижнів ';
    return ' Останні 7 місяців '; 
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

      {/* --- SEGMENTED CONTROL (Tabs) --- */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- FLOATING FOX ICON --- */}
      <View style={styles.foxHeaderContainer}>
         <Image source={require('../assets/fox_head_icon.png')} style={styles.foxIcon} />
      </View>

      {/* --- CHART SECTION --- */}
      <View style={styles.chartWrapper}>

        {/* --- DATE NAVIGATOR --- */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => console.log('Previous Date')}>
            <Text style={styles.dateArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{getDateLabel()}</Text>
          <TouchableOpacity onPress={() => console.log('Next Date')}>
            <Text style={styles.dateArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F07C3B" />
          </View>
        ) : (
          <>
            <View style={styles.chartLayout}>
              {/* Y-AXIS */}
              <View style={styles.yAxisContainer}>
                {yAxis.map((num) => {
                  let textColor = '#5C3A21'; 
                  if (num === 10) textColor = '#4CAF50'; 
                  if (num === 5) textColor = '#FF9800'; 
                  if (num === 1) textColor = '#F44336'; 
                  
                  const showFox = num === 10 || num === 5 || num === 1;

                  return (
                    <View key={num} style={styles.yAxisRow}>
                      {showFox && <Image source={require('../assets/fox_head_icon.png')} style={styles.tinyFox} />}
                      <Text style={[styles.yAxisText, { color: textColor }]}>{num}</Text>
                    </View>
                  );
                })}
              </View>

              {/* MAIN GRAPH GRID */}
              <View style={styles.gridContainer}>
                {/* Horizontal Lines */}
                {yAxis.map((num, index) => (
                  <View key={num} style={[styles.gridLineHorizontal, index === yAxis.length - 1 && styles.gridLineBottom]} />
                ))}
                
                {/* Vertical Lines Overlay */}
                <View style={styles.verticalLinesOverlay}>
                  {chartData.map((_, index) => (
                    <View key={index} style={[styles.gridLineVertical, index === 0 && styles.gridLineLeft]} />
                  ))}
                </View>

                {/* 🟢 NEW: DATA POINTS PLOTTING OVERLAY 🟢 */}
                <View style={[StyleSheet.absoluteFillObject, { paddingHorizontal: 0 }]}>
                    {chartData.map((point, index) => {
                      // Mood is 0-100. We map this directly to the bottom % of the grid.
                      const bottomPercentage = Math.max(0, Math.min(100, point.value));
                      // We evenly space the dots left to right across the 7 columns
                      const leftPercentage = chartData.length > 1 ? (index / (chartData.length - 1)) * 100 : 50;

                      return (
                        <View
                          key={index}
                          style={{
                            position: 'absolute',
                            left: `${leftPercentage}%`,
                            bottom: `${bottomPercentage}%`,
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: '#F07C3B',
                            transform: [{ translateX: -6 }, { translateY: 6 }], // Center the dot
                            zIndex: 10,
                            borderWidth: 2,
                            borderColor: '#FFF',
                          }}
                        />
                      );
                    })}
                </View>

              </View>
            </View>

            {/* X-AXIS (Dynamic Cloud Labels) */}
            <View style={styles.xAxisContainer}>
              <View style={styles.yAxisSpacer} /> 
              <View style={styles.xAxisLabelsWrapper}>
                {chartData.map((point, index) => (
                  <Text 
                    key={index} 
                    style={[
                      styles.xAxisText, 
                      activeTab === 'Дні' && { transform: [{ rotate: '-45deg' }], marginTop: 10, marginLeft: -10 }
                    ]}
                  >
                    {/* The label comes directly from Vlad's SQL! (e.g., '13.03') */}
                    {point.label}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFAA77',
    resizeMode: 'contain',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFCDA8',
    borderRadius: 25,
    marginHorizontal: 30,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FDF1E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    color: '#5C3A21',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  foxHeaderContainer: {
    alignItems: 'flex-end',
    paddingRight: 40,
    marginBottom: -10,
    zIndex: 10,
  },
  foxIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  chartWrapper: {
    paddingHorizontal: 20,
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateArrow: {
    fontSize: 18,
    color: '#5C3A21',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  dateLabel: {
    color: '#5C3A21',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartLayout: {
    flexDirection: 'row',
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 0, 
  },
  yAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 30,
  },
  tinyFox: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    marginRight: 4,
  },
  yAxisText: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 16,
    textAlign: 'right',
  },
  gridContainer: {
    flex: 1,
    height: 300,
    position: 'relative',
  },
  gridLineHorizontal: {
    borderTopWidth: 1,
    borderColor: '#D3C4B7',
    height: 30, 
  },
  gridLineBottom: {
    borderBottomWidth: 1,
  },
  verticalLinesOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridLineVertical: {
    borderRightWidth: 1,
    borderColor: '#D3C4B7',
    flex: 1,
  },
  gridLineLeft: {
    borderLeftWidth: 1, // Adds the solid left wall to the graph
  },
  xAxisContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  yAxisSpacer: {
    width: 40, // Matches the width of the Y-axis so X-labels start under the graph
  },
  xAxisLabelsWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  xAxisText: {
    fontSize: 10,
    color: '#5C3A21',
    width: 35, // Gives rotated text enough room to breathe
    textAlign: 'center',
  },
});