import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Linking,
  Share
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { t } = useLanguage();

  const [quantity, setQuantity] = React.useState(1);
  const totalPrice = product.price * quantity;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on AgroLanka! Price: LKR ${product.price} / ${product.unit}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleContact = () => {
    if (product.seller?.phone) {
      Linking.openURL(`tel:${product.seller.phone}`);
    } else {
      alert('Seller phone number not available');
    }
  };

  const updateQuantity = (val) => {
    if (val < 1) return;
    if (product.stock && val > product.stock) {
        alert(`Only ${product.stock} units available in stock.`);
        return;
    }
    setQuantity(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.mainImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderIcon}>📦</Text>
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* Title & Price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.unitText}>Per {product.unit}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.currencyLabel}>LKR</Text>
              <Text style={styles.priceValue}>{product.price}</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Select Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => updateQuantity(quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyText}>{quantity}</Text>
                <Text style={styles.qtyUnit}>{product.unit}</Text>
              </View>
              <TouchableOpacity 
                style={styles.qtyBtn} 
                onPress={() => updateQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              
              <View style={styles.totalCalculation}>
                <Text style={styles.totalLabel}>Total Price:</Text>
                <Text style={styles.totalAmount}>LKR {totalPrice.toLocaleString()}</Text>
              </View>
            </View>
            {product.stock > 0 ? (
                <Text style={styles.stockInfo}>Available Stock: {product.stock} {product.unit}</Text>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.avatarText}>
                  {(product.seller?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerLabel}>Seller Information</Text>
                <Text style={styles.sellerName}>{product.seller?.name || 'AgroLanka Verified Store'}</Text>
                <Text style={styles.sellerRole}>{product.sellerRole || 'Store Manager'}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>
                Available in: {product.districts?.join(', ') || 'Global'}
              </Text>
            </View>
          </View>

          {/* Buying Safety Tip */}
          <View style={styles.safetyBox}>
            <Text style={styles.safetyIcon}>🛡️</Text>
            <Text style={styles.safetyText}>
              Always inspect the items before making payment. AgroLanka recommends physical verification for all agri-products.
            </Text>
          </View>
        </View>
        
        {/* Bottom padding for ScrollView */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
          <Text style={styles.contactBtnText}>Contact Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyNowBtn} 
          onPress={() => navigation.navigate('Payment', { 
            product, 
            quantity, 
            totalAmount: totalPrice 
          })}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  shareIcon: { fontSize: 20 },
  imageSection: { width: '100%', height: 300, position: 'relative', backgroundColor: '#f9f9f9' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 80, marginBottom: 10 },
  placeholderText: { color: '#999', fontSize: 16 },
  categoryTag: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    backgroundColor: '#1b5e20', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  categoryTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  contentSection: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  unitText: { fontSize: 14, color: '#777' },
  priceContainer: { alignItems: 'flex-end' },
  currencyLabel: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32' },
  priceValue: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32' },
  quantitySection: { 
    marginBottom: 25, 
    padding: 15, 
    backgroundColor: '#f1f8e9', 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9'
  },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  qtyBtn: { 
    width: 45, 
    height: 45, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e7d32',
    elevation: 2
  },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  qtyDisplay: { marginHorizontal: 15, alignItems: 'center', minWidth: 60 },
  qtyText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  qtyUnit: { fontSize: 12, color: '#666' },
  totalCalculation: { flex: 1, alignItems: 'flex-end', marginLeft: 10 },
  totalLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  stockInfo: { fontSize: 12, color: '#e53935', marginTop: 8, fontWeight: '600' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  descriptionText: { fontSize: 15, color: '#555', lineHeight: 22 },
  sellerCard: { 
    backgroundColor: '#f8f9fa', 
    borderRadius: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#eee',
    marginBottom: 20
  },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sellerAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#e8f5e9', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#2e7d32'
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20' },
  sellerLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sellerRole: { fontSize: 12, color: '#2e7d32' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { fontSize: 14, marginRight: 8 },
  locationText: { fontSize: 13, color: '#666' },
  safetyBox: { 
    flexDirection: 'row', 
    backgroundColor: '#fffbeb', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#fef3c7' 
  },
  safetyIcon: { fontSize: 20, marginRight: 12 },
  safetyText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    padding: 20, 
    paddingBottom: 30,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12
  },
  contactBtn: { 
    flex: 1, 
    height: 55, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#2e7d32', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  contactBtnText: { color: '#2e7d32', fontSize: 16, fontWeight: 'bold' },
  buyNowBtn: { 
    flex: 1.5, 
    height: 55, 
    borderRadius: 12, 
    backgroundColor: '#2e7d32', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProductDetailsScreen;
