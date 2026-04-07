import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import apiClient from '../api/apiClient';

const PaymentScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handlePurchase = async () => {
        if (paymentMethod === 'Card') {
            if (!cardNumber || !expiry || !cvv) {
                Alert.alert('Incomplete Details', 'Please fill in all card details.');
                return;
            }
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/purchases', {
                productId: product._id,
                paymentMethod: paymentMethod === 'Card' ? 'Card' : 'Bank Transfer'
            });

            if (response.data) {
                Alert.alert(
                    'Success!',
                    `Purchase completed successfully.\n\nReceipt: ${response.data.receiptNumber}`,
                    [{ text: 'Great', onPress: () => navigation.navigate('AgriProducts') }]
                );
            }
        } catch (error) {
            console.error('Purchase Error:', error);
            const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Purchase Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Order Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{product.name}</Text>
                            <Text style={styles.summaryValue}>LKR {product.price}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>LKR {product.price}</Text>
                        </View>
                    </View>

                    {/* Method Selection */}
                    <Text style={styles.sectionTitle}>Select Payment Method</Text>
                    <View style={styles.methodContainer}>
                        <TouchableOpacity 
                            style={[styles.methodBtn, paymentMethod === 'Card' && styles.methodBtnActive]}
                            onPress={() => setPaymentMethod('Card')}
                        >
                            <Text style={[styles.methodIcon, paymentMethod === 'Card' && styles.methodIconActive]}>💳</Text>
                            <Text style={[styles.methodText, paymentMethod === 'Card' && styles.methodTextActive]}>Credit/Debit Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.methodBtn, paymentMethod === 'Bank' && styles.methodBtnActive]}
                            onPress={() => setPaymentMethod('Bank')}
                        >
                            <Text style={[styles.methodIcon, paymentMethod === 'Bank' && styles.methodIconActive]}>🏦</Text>
                            <Text style={[styles.methodText, paymentMethod === 'Bank' && styles.methodTextActive]}>Bank Transfer</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Card Form */}
                    {paymentMethod === 'Card' ? (
                        <View style={styles.cardForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Card Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0000 0000 0000 0000"
                                    keyboardType="numeric"
                                    value={cardNumber}
                                    onChangeText={setCardNumber}
                                    maxLength={16}
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="MM/YY"
                                        keyboardType="numeric"
                                        value={expiry}
                                        onChangeText={setExpiry}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123"
                                        keyboardType="numeric"
                                        secureTextEntry
                                        value={cvv}
                                        onChangeText={setCvv}
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                Instructions for bank transfer will be shown after confirmation. Please ensure you include the Receipt ID in your payment reference.
                            </Text>
                        </View>
                    )}

                    <View style={styles.safetyBox}>
                        <Text style={styles.safetyIcon}>🔒</Text>
                        <Text style={styles.safetyText}>
                            Your transaction is secured with AgroLanka's 256-bit encryption. We do not store your full card details.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.payBtn}
                        onPress={handlePurchase}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.payBtnText}>Confirm and Pay LKR {product.price}</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backBtnText: { fontSize: 24, color: '#2e7d32', fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { padding: 20 },
    summaryCard: { 
        backgroundColor: '#f8f9fa', 
        borderRadius: 16, 
        padding: 20, 
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#eee'
    },
    summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, textTransform: 'uppercase' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontSize: 16, color: '#333' },
    summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    methodContainer: { flexDirection: 'row', gap: 12, marginBottom: 25 },
    methodBtn: { 
        flex: 1, 
        paddingVertical: 15, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#ddd',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    methodBtnActive: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
    methodIcon: { fontSize: 24, marginBottom: 5 },
    methodText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
    methodTextActive: { color: '#1b5e20' },
    cardForm: { marginBottom: 20 },
    inputGroup: { marginBottom: 15 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
    input: { 
        height: 50, 
        borderWidth: 1, 
        borderColor: '#ddd', 
        borderRadius: 10, 
        paddingHorizontal: 15, 
        fontSize: 16,
        backgroundColor: '#fafafa'
    },
    row: { flexDirection: 'row' },
    infoBox: { 
        backgroundColor: '#f0f4f8', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3'
    },
    infoText: { fontSize: 14, color: '#455a64', lineHeight: 20 },
    safetyBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fffbeb', 
        padding: 15, 
        borderRadius: 12,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#fef3c7'
    },
    safetyIcon: { fontSize: 20, marginRight: 12 },
    safetyText: { flex: 1, fontSize: 12, color: '#92400e' },
    payBtn: { 
        backgroundColor: '#2e7d32', 
        height: 60, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6
    },
    payBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default PaymentScreen;
