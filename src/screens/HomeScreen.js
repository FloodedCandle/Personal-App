import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, RefreshControl, SafeAreaView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import { PieChart } from 'react-native-chart-kit';
import BudgetItem from '../components/BudgetItem';
import { useSelector, useDispatch } from 'react-redux';
import { setBudgets } from '../redux/budgetSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getThemeColors } from '../config/chartThemes';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Chart = ({ categoryData, theme }) => {
  const screenWidth = Dimensions.get('window').width;
  const colors = getThemeColors(theme);

  if (!categoryData || categoryData.length === 0) {
    return (
      <View style={styles.emptyChartContainer}>
        <CustomText>No data available for chart</CustomText>
      </View>
    );
  }

  const pieData = categoryData
    .filter(category => category && category.name && category.amountSaved !== undefined)
    .map((category, index) => ({
      name: category.name,
      value: category.amountSaved,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

  return (
    <PieChart
      data={pieData}
      width={screenWidth - 40}
      height={220}
      chartConfig={chartConfig}
      accessor="value"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  );
};

const chartConfig = {
  backgroundColor: '#ECF0F1',
  backgroundGradientFrom: '#ECF0F1',
  backgroundGradientTo: '#ECF0F1',
  color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  style: { borderRadius: 16 },
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const budgets = useSelector(state => state.budgets);
  const [categoryData, setCategoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [chartTheme, setChartTheme] = useState('default');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const checkOfflineMode = useCallback(async () => {
    const offlineMode = await AsyncStorage.getItem('offlineMode');
    setIsOfflineMode(offlineMode === 'true');
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const offlineMode = await AsyncStorage.getItem('offlineMode');
      const isOffline = offlineMode === 'true';
      setIsOfflineMode(isOffline);

      let budgetsData;
      if (isOffline) {
        const storedBudgets = await AsyncStorage.getItem('offlineBudgets');
        budgetsData = storedBudgets ? JSON.parse(storedBudgets) : [];
      } else {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userBudgetsRef = doc(db, 'userBudgets', userId);
          const docSnap = await getDoc(userBudgetsRef);
          if (docSnap.exists()) {
            budgetsData = docSnap.data().budgets || [];
          }
        }
      }

      // Filter out completed budgets
      const activeBudgets = budgetsData.filter(budget => budget.amountSpent < budget.goal);

      dispatch(setBudgets(activeBudgets));
      processCategoryData(activeBudgets);
    } catch (error) {
      console.error('Error fetching budgets: ', error);
    }
  }, [dispatch, processCategoryData]);

  const processCategoryData = useCallback((budgets) => {
    console.log('Processing category data for active budgets:', budgets);
    const categoryMap = {};
    budgets.forEach(budget => {
      if (budget && budget.category && budget.category.name) {
        if (!categoryMap[budget.category.name]) {
          categoryMap[budget.category.name] = { goalAmount: 0, amountSpent: 0 };
        }
        categoryMap[budget.category.name].goalAmount += budget.goal || 0;
        categoryMap[budget.category.name].amountSpent += budget.amountSpent || 0;
      }
    });

    const processedData = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      amountSaved: data.amountSpent,
      goalAmount: data.goalAmount
    }));
    console.log('Processed category data:', processedData);
    setCategoryData(processedData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkOfflineMode();
      fetchBudgets();
      loadChartTheme();
    }, [checkOfflineMode, fetchBudgets])
  );

  const loadChartTheme = async () => {
    try {
      const offlineMode = await AsyncStorage.getItem('offlineMode');
      setIsOfflineMode(offlineMode === 'true');

      if (offlineMode === 'true') {
        const savedTheme = await AsyncStorage.getItem('offlineChartTheme');
        if (savedTheme) {
          setChartTheme(savedTheme);
        } else {
          setChartTheme('default');
        }
      } else {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userPreferencesRef = doc(db, 'userPreferences', userId);
          const docSnap = await getDoc(userPreferencesRef);
          if (docSnap.exists()) {
            const { chartTheme } = docSnap.data();
            setChartTheme(chartTheme || 'default');
          } else {
            setChartTheme('default');
          }
        } else {
          setChartTheme('default');
        }
      }
    } catch (error) {
      console.error('Error loading chart theme:', error);
      setChartTheme('default');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkOfflineMode();
    await fetchBudgets();
    await loadChartTheme();
    setRefreshing(false);
  }, [checkOfflineMode, fetchBudgets]);

  const handleBudgetPress = (budget) => {
    navigation.navigate('BudgetDetail', { budget, isOfflineMode });
  };

  const handleThemeChange = () => {
    navigation.navigate('ChartTheme', { currentTheme: chartTheme, isOfflineMode });
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'chart':
        return (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <CustomText style={styles.chartTitle}>Budget Overview</CustomText>
              <TouchableOpacity onPress={handleThemeChange}>
                <MaterialIcons name="color-lens" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            <Chart categoryData={categoryData} theme={chartTheme} />
          </View>
        );
      case 'budgetHeader':
        return (
          <View style={styles.budgetsContainer}>
            <CustomText style={styles.budgetsTitle}>Budgets</CustomText>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateBudget', { isOfflineMode })}>
              <MaterialIcons name="add" size={24} color="#ECF0F1" />
            </TouchableOpacity>
          </View>
        );
      case 'budget':
        return (
          <BudgetItem
            name={item.name}
            amountSpent={item.amountSpent || 0}
            amountTotal={item.goal}
            remaining={Math.max(item.goal - (item.amountSpent || 0), 0)}
            progress={Math.min((item.amountSpent || 0) / item.goal, 1)}
            icon={item.icon}
            onPress={() => handleBudgetPress(item)}
          />
        );
    }
  };

  const data = [
    { type: 'chart', id: 'chart' },
    { type: 'budgetHeader', id: 'budgetHeader' },
    ...budgets.map(budget => ({ type: 'budget', id: budget.id, ...budget }))
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <View style={styles.headerContent}>
          <CustomText style={styles.headerText}>
            Dashboard{isOfflineMode ? ' (Offline)' : ''}
          </CustomText>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconButton}>
              <MaterialIcons name="person-outline" size={24} color="#ECF0F1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notification')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#ECF0F1" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2ECC71']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  budgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  budgetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  emptyChartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default HomeScreen;
