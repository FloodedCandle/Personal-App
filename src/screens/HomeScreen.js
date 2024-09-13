import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import { PieChart } from 'react-native-chart-kit';
import BudgetItem from '../components/BudgetItem';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getThemeColors } from '../config/chartThemes';

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

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
  const [budgets, setBudgets] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [chartTheme, setChartTheme] = useState('default');

  const fetchBudgets = useCallback(async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log('No user logged in');
        return;
      }
      const userBudgetsRef = doc(db, 'userBudgets', userId);
      const docSnap = await getDoc(userBudgetsRef);

      if (docSnap.exists()) {
        const userBudgets = docSnap.data().budgets || [];
        const activeBudgets = userBudgets.filter(budget => budget.amountSpent < budget.goal);
        console.log('Fetched budgets:', activeBudgets);
        setBudgets(activeBudgets);
        processCategoryData(activeBudgets);
      } else {
        console.log('No budgets found');
        setBudgets([]);
        setCategoryData([]);
      }
    } catch (error) {
      console.error('Error fetching budgets: ', error);
    }
  }, []);

  const processCategoryData = useCallback((budgets) => {
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
      amountSaved: data.amountSpent, // Change this to amountSpent
      goalAmount: data.goalAmount
    }));
    console.log('Processed category data:', processedData);
    setCategoryData(processedData);
  }, []);

  const fetchUserPreferences = useCallback(async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userPrefsRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(userPrefsRef);

      if (docSnap.exists()) {
        const { chartTheme } = docSnap.data();
        if (chartTheme) setChartTheme(chartTheme);
      } else {
        // Create the document with a default theme if it doesn't exist
        await setDoc(userPrefsRef, { chartTheme: 'default' });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBudgets();
      fetchUserPreferences();
    });

    return unsubscribe;
  }, [navigation, fetchBudgets, fetchUserPreferences]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  }, [fetchBudgets]);

  const handleBudgetPress = (budget) => {
    navigation.navigate('BudgetDetail', { budget });
  };

  const handleThemeChange = () => {
    navigation.navigate('ChartTheme', { currentTheme: chartTheme });
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.topHeader}>
            <CustomText style={styles.dashboardText}>Dashboard</CustomText>
            <View style={styles.topIconsContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <MaterialIcons name="person-outline" size={24} color="#2C3E50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
                <Ionicons name="notifications-outline" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
          </View>
        );
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
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateBudget')}>
              <MaterialIcons name="add" size={24} color="#ECF0F1" />
            </TouchableOpacity>
          </View>
        );
      case 'budget':
        const progress = Math.min((item.amountSpent || 0) / item.goal, 1);
        const remaining = Math.max(item.goal - (item.amountSpent || 0), 0);
        return (
          <BudgetItem
            name={item.name}
            amountSpent={item.amountSpent || 0}
            amountTotal={item.goal}
            remaining={remaining}
            progress={progress}
            icon={item.icon}
            onPress={() => handleBudgetPress(item)}
          />
        );
    }
  };

  const data = [
    { type: 'header', id: 'header' },
    { type: 'chart', id: 'chart' },
    { type: 'budgetHeader', id: 'budgetHeader' },
    ...budgets.map(budget => ({ type: 'budget', id: budget.id, ...budget }))
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2C3E50']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ECF0F1',
    padding: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardText: {
    fontSize: 20,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  topIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  chartContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    borderRadius: 14,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  budgetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    height: 50,
  },
  budgetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 8,
    borderRadius: 8,
  },
  budgetList: {
    flex: 1,
    width: '100%',
  },
  budgetListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  budgetSeparator: {
    height: 10,
  },
  listContent: {
    paddingBottom: 20,
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
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default HomeScreen;
