import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const API_KEY = 'fca_live_i1ilCHFINItgdeCu1vLi0YTl5NK1HMHNYhOgPxNV'; // Replace with your actual API key
const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;

const CurrencyScreen = () => {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState('');
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExchangeRates();
    }, []);

    const fetchExchangeRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.data) {
                setExchangeRates(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch exchange rates');
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const convertCurrency = () => {
        if (amount === '') {
            setResult('Please enter an amount');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setResult('Please enter a valid number');
            return;
        }

        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        const convertedAmount = (numAmount / fromRate) * toRate;

        setResult(`${numAmount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
    };

    const CurrencyPicker = ({ selectedValue, onValueChange, label }) => (
        <View style={styles.pickerContainer}>
            <CustomText style={styles.label}>{label}</CustomText>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedValue}
                    style={styles.picker}
                    onValueChange={onValueChange}
                >
                    {Object.keys(exchangeRates).map((currency) => (
                        <Picker.Item key={currency} label={currency} value={currency} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
                <CustomText style={styles.loadingText}>Loading exchange rates...</CustomText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <CustomText style={styles.errorText}>Error: {error}</CustomText>
                <CustomButton
                    title="Retry"
                    onPress={fetchExchangeRates}
                    buttonStyle={styles.retryButton}
                />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#2C3E50', '#3498DB']} style={styles.header}>
                <CustomText style={styles.headerText}>Currency Converter</CustomText>
            </LinearGradient>
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <CustomText style={styles.label}>Amount</CustomText>
                        <View style={styles.amountInputWrapper}>
                            <MaterialIcons name="attach-money" size={24} color="#3498DB" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="Enter amount"
                                placeholderTextColor="#95A5A6"
                            />
                        </View>
                    </View>

                    <CurrencyPicker
                        selectedValue={fromCurrency}
                        onValueChange={(itemValue) => setFromCurrency(itemValue)}
                        label="From Currency"
                    />

                    <CurrencyPicker
                        selectedValue={toCurrency}
                        onValueChange={(itemValue) => setToCurrency(itemValue)}
                        label="To Currency"
                    />

                    <CustomButton
                        title="Convert"
                        onPress={convertCurrency}
                        buttonStyle={styles.convertButton}
                    />

                    <View style={styles.resultContainer}>
                        <CustomText style={styles.resultText}>{result}</CustomText>
                    </View>
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
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ECF0F1',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECF0F1',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#2C3E50',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#2C3E50',
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#3498DB',
        borderWidth: 1,
        borderRadius: 5,
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#2C3E50',
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerWrapper: {
        borderColor: '#3498DB',
        borderWidth: 1,
        borderRadius: 5,
    },
    picker: {
        height: 50,
    },
    convertButton: {
        backgroundColor: '#2ECC71',
        marginTop: 20,
    },
    resultContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    resultText: {
        fontSize: 18,
        color: '#2C3E50',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECF0F1',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3498DB',
    },
});

export default CurrencyScreen;