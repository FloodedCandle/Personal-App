import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, SafeAreaView, RefreshControl } from 'react-native';
import { PieChart, StackedBarChart } from 'react-native-chart-kit';
import CustomText from '../components/CustomText';
import { db, auth } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

const StatisticsScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

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

  useEffect(() => {
    if (isFocused) {
      fetchBudgets();
    }
  }, [isFocused, fetchBudgets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  }, [fetchBudgets]);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;

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
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 10,
    }));
  };

  const getBudgetProgressData = () => {
    const sortedBudgets = [...budgets].sort((a, b) => (b.amountSpent / b.goal) - (a.amountSpent / a.goal));
    return {
      labels: sortedBudgets.map(budget => budget.name.substring(0, 8)),
      legend: ['Spent', 'Remaining'],
      data: sortedBudgets.map(budget => [
        budget.amountSpent || 0,
        Math.max(0, budget.goal - (budget.amountSpent || 0))
      ]),
      barColors: ['#3498DB', '#E74C3C']
    };
  };

  const getTotalStats = () => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.goal, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.amountSpent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, totalRemaining };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomText>Loading statistics...</CustomText>
      </SafeAreaView>
    );
  }

  const { totalBudget, totalSpent, totalRemaining } = getTotalStats();
  const sortedBudgets = [...budgets].sort((a, b) => (b.amountSpent / b.goal) - (a.amountSpent / a.goal));

  return (
    <SafeAreaView style={styles.container}>
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
          <CustomText style={styles.summaryText}>Total Budget: ${totalBudget.toFixed(2)}</CustomText>
          <CustomText style={styles.summaryText}>Total Spent: ${totalSpent.toFixed(2)}</CustomText>
          <CustomText style={styles.summaryText}>Remaining: ${totalRemaining.toFixed(2)}</CustomText>
        </View>

        <View style={styles.chartContainer}>
          <CustomText style={styles.title}>Spending by Category</CustomText>
          <PieChart
            data={getCategoryData()}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={styles.chartContainer}>
          <CustomText style={styles.title}>Budget Progress</CustomText>
          <StackedBarChart
            data={getBudgetProgressData()}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
            withHorizontalLabels={true}
            segments={4}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3498DB' }]} />
              <CustomText style={styles.legendText}>Spent</CustomText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E74C3C' }]} />
              <CustomText style={styles.legendText}>Remaining</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.budgetProgressLegend}>
          <CustomText style={styles.budgetProgressTitle}>Detailed Budget Progress</CustomText>
          {sortedBudgets.map((budget, index) => (
            <View key={index} style={styles.budgetProgressItem}>
              <CustomText style={styles.budgetName}>{budget.name}</CustomText>
              <CustomText style={styles.budgetProgress}>
                ${budget.amountSpent.toFixed(2)} / ${budget.goal.toFixed(2)}
                ({((budget.amountSpent / budget.goal) * 100).toFixed(1)}%)
              </CustomText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  summaryContainer: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  chartContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  budgetProgressLegend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  budgetProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  budgetProgressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  budgetName: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  budgetProgress: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'right',
  },
});

export default StatisticsScreen;
