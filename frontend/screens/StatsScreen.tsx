import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen({ navigation }: any ) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('Дні');

  // --- DATA ---
  const tabs = ['Дні', 'Тижні', 'Місяці'];
  const yAxis = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  
  const xAxisData: any = {
    'Дні': ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    'Тижні': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    'Місяці': ['01', '05', '10', '15', '20', '25', '30'],
  };

  const getDateLabel = () => {
    if (activeTab === 'Дні') return ' 13 Березня ';
    if (activeTab === 'Тижні') return ' 9-15 Березня ';
    return ' Березень '; 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>

        <View style={{ flex: 1 }} /> 

        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          {/* Make sure you have a gear icon in your assets! */}
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

        {/* --- NEW DATE NAVIGATOR --- */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => console.log('Previous Date')}>
            <Text style={styles.dateArrow}>{'<'}</Text>
          </TouchableOpacity>
          
          <Text style={styles.dateLabel}>{getDateLabel()}</Text>
          
          <TouchableOpacity onPress={() => console.log('Next Date')}>
            <Text style={styles.dateArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartLayout}>
          {/* Y-AXIS (Numbers 10 down to 1) */}
          <View style={styles.yAxisContainer}>
            {yAxis.map((num) => {
              // Figma design has specific colors and icons for 10, 5, and 1
              let textColor = '#5C3A21'; // Default brown
              if (num === 10) textColor = '#4CAF50'; // Green
              if (num === 5) textColor = '#FF9800'; // Orange
              if (num === 1) textColor = '#F44336'; // Red
              
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
            {/* Draw Horizontal Lines */}
            {yAxis.map((num, index) => (
              <View key={num} style={[styles.gridLineHorizontal, index === yAxis.length - 1 && styles.gridLineBottom]} />
            ))}
            
            {/* Draw Vertical Lines */}
            <View style={styles.verticalLinesOverlay}>
              {xAxisData[activeTab].map((_: any, index: number) => (
                <View key={index} style={[styles.gridLineVertical, index === 0 && styles.gridLineLeft]} />
              ))}
            </View>
          </View>
        </View>

        {/* X-AXIS (Dynamic Labels) */}
        <View style={styles.xAxisContainer}>
          {/* We add empty space on the left so the X labels align perfectly under the grid */}
          <View style={styles.yAxisSpacer} /> 
          
          <View style={styles.xAxisLabelsWrapper}>
            {xAxisData[activeTab].map((label: string, index: number) => (
              <Text 
                key={index} 
                style={[
                  styles.xAxisText, 
                  // If it's the "Days" tab, rotate the text exactly like your Figma design!
                  activeTab === 'Дні' && { transform: [{ rotate: '-45deg' }], marginTop: 10, marginLeft: -10 }
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>

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