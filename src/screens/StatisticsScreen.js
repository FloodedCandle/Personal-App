import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, SafeAreaView, RefreshControl } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import CustomText from '../components/CustomText';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemeColors } from '../config/chartThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [chartTheme, setChartTheme] = useState('default');

  const fetchBudgets = useCallback(async () => {
    try {
      const userId = auth.currentUser.uid;
      const userBudgetsRef = doc(db, 'userBudgets', userId);
      const docSnap = await getDoc(userBudgetsRef);
      if (docSnap.exists()) {
        const budgetData = docSnap.data().budgets || [];
        setBudgets(budgetData);
      } else {
        setBudgets([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  }, []);

  const loadChartTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('chartTheme');
      if (savedTheme) {
        setChartTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading chart theme:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchBudgets();
      loadChartTheme();
    }
  }, [isFocused, fetchBudgets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBudgets();
    await loadChartTheme();
    setRefreshing(false);
  }, [fetchBudgets]);

  const chartWidth = width - 40;
  const chartHeight = height * 0.25; // Adjust the height to be proportional to the screen
  const colors = getThemeColors(chartTheme);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const getCategoryData = () => {
    const categoryTotals = budgets.reduce((acc, budget) => {
      if (!acc[budget.category.name]) {
        acc[budget.category.name] = 0;
      }
      acc[budget.category.name] += budget.amountSpent || 0;
      return acc;
    }, {});

    return Object.keys(categoryTotals).map((category, index) => ({
      name: category,
      population: categoryTotals[category],
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const getTotalStats = () => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.goal, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.amountSpent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const completedBudgets = budgets.filter(budget => budget.amountSpent >= budget.goal).length;
    const activeBudgets = budgets.length - completedBudgets;
    return { totalBudget, totalSpent, totalRemaining, completedBudgets, activeBudgets };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomText>Loading statistics...</CustomText>
      </SafeAreaView>
    );
  }

  const { totalBudget, totalSpent, totalRemaining, completedBudgets, activeBudgets } = getTotalStats();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
        <CustomText style={styles.headerText}>Statistics</CustomText>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
          />
        }
      >
        <View style={styles.summaryContainer}>
          <CustomText style={styles.summaryTitle}>Budget Summary</CustomText>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Total Budget</CustomText>
              <CustomText style={styles.summaryValue}>${totalBudget.toFixed(2)}</CustomText>
            </View>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Total Spent</CustomText>
              <CustomText style={styles.summaryValue}>${totalSpent.toFixed(2)}</CustomText>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Remaining</CustomText>
              <CustomText style={styles.summaryValue}>${totalRemaining.toFixed(2)}</CustomText>
            </View>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Spent %</CustomText>
              <CustomText style={styles.summaryValue}>{((totalSpent / totalBudget) * 100).toFixed(1)}%</CustomText>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Active Budgets</CustomText>
              <CustomText style={styles.summaryValue}>{activeBudgets}</CustomText>
            </View>
            <View style={styles.summaryItem}>
              <CustomText style={styles.summaryLabel}>Completed</CustomText>
              <CustomText style={styles.summaryValue}>{completedBudgets}</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <CustomText style={styles.chartTitle}>Spending by Category</CustomText>
          <PieChart
            data={getCategoryData()}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ECF0F1',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 15,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
});

export default StatisticsScreen;
