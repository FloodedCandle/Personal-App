import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { Picker } from '@react-native-picker/picker';

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
            console.log('Fetching exchange rates...');
            const response = await fetch(API_URL);
            const data = await response.json();
            console.log('API Response:', data);
            if (data.data) {
                setExchangeRates(data.data);
                console.log('Exchange rates set:', data.data);
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
        <ScrollView style={styles.container}>
            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>Amount</CustomText>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                />
            </View>

            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>From Currency</CustomText>
                <Picker
                    selectedValue={fromCurrency}
                    style={styles.picker}
                    onValueChange={(itemValue) => setFromCurrency(itemValue)}
                >
                    {Object.keys(exchangeRates).map((currency) => (
                        <Picker.Item key={currency} label={currency} value={currency} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <CustomText style={styles.label}>To Currency</CustomText>
                <Picker
                    selectedValue={toCurrency}
                    style={styles.picker}
                    onValueChange={(itemValue) => setToCurrency(itemValue)}
                >
                    {Object.keys(exchangeRates).map((currency) => (
                        <Picker.Item key={currency} label={currency} value={currency} />
                    ))}
                </Picker>
            </View>

            <CustomButton
                title="Convert"
                onPress={convertCurrency}
                buttonStyle={styles.convertButton}
            />

            <View style={styles.resultContainer}>
                <CustomText style={styles.resultText}>{result}</CustomText>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECF0F1',
        padding: 20,
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
    input: {
        borderWidth: 1,
        borderColor: '#3498DB',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#3498DB',
        borderRadius: 5,
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