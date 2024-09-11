import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, FlatList } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';
import { LineChart, PieChart } from 'react-native-chart-kit';
import BudgetItem from '../components/BudgetItem';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ChartToggle = ({ chartType, setChartType }) => (
  <View style={styles.toggleContainer}>
    <TouchableOpacity onPress={() => setChartType('pie')} style={styles.toggleButton}>
      <CustomText style={styles.toggleButtonText}>Pie Chart</CustomText>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setChartType('line')} style={styles.toggleButton}>
      <CustomText style={styles.toggleButtonText}>Line Chart</CustomText>
    </TouchableOpacity>
  </View>
);

const Chart = ({ chartType }) => (
  chartType === 'pie' ? (
    <PieChart
      data={[
        { name: 'Total A', population: 215, color: '#2ECC71', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Total B', population: 280, color: '#3498DB', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Total C', population: 527, color: '#2C3E50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
      ]}
      width={Dimensions.get('window').width - 40}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  ) : (
    <LineChart
      data={{
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{ data: [500, 1000, 1500, 1200, 2000, 2500] }],
      }}
      width={Dimensions.get('window').width - 40}
      height={220}
      yAxisLabel="$"
      chartConfig={chartConfig}
      style={styles.chart}
    />
  )
);

const chartConfig = {
  backgroundColor: '#ECF0F1',
  backgroundGradientFrom: '#ECF0F1',
  backgroundGradientTo: '#ECF0F1',
  color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#2C3E50',
  },
};

const HomeScreen = ({ navigation }) => {
  const [chartType, setChartType] = useState('pie');
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBudgets();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchBudgets = async () => {
    try {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, 'budgets'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const budgetList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgets(budgetList);
    } catch (error) {
      console.error('Error fetching budgets: ', error);
    }
  };

  const handleBudgetPress = (budgetId) => {
    navigation.navigate('BudgetDetail', { budgetId });
  };

  const renderBudgetItem = ({ item }) => (
    <BudgetItem
      name={item.name}
      amountSpent={item.amountSpent || 0}
      amountTotal={item.goal}
      icon={item.icon}
      onPress={() => handleBudgetPress(item.id)}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <View style={styles.chartContainer}>
        <CustomText style={styles.chartTitle}>Total Overview</CustomText>
        <ChartToggle chartType={chartType} setChartType={setChartType} />
        <Chart chartType={chartType} />
      </View>

      <View style={styles.budgetsContainer}>
        <CustomText style={styles.budgetsTitle}>Budgets</CustomText>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateBudget')}>
          <MaterialIcons name="add" size={24} color="#ECF0F1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
        style={styles.budgetList}
        contentContainerStyle={styles.budgetListContent}
        ItemSeparatorComponent={() => <View style={styles.budgetSeparator} />}
      />
    </ScrollView>
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toggleButton: {
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#3498DB',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
});

export default HomeScreen;
