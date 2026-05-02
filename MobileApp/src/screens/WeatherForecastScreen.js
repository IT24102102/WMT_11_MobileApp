import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  FlatList,
  ImageBackground
} from 'react-native';

const WeatherForecastScreen = ({ route, navigation }) => {
  const { district, ascName } = route.params;
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
        // Forecast API gives data in 3-hour intervals for 5 days
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${district},LK&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        
        if (data.list) {
          // Filter to get one forecast per day (approx at noon)
          const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
          setForecast(dailyData);
        }
      } catch (err) {
        console.error('Forecast Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [district]);

  const getWeatherIcon = (condition) => {
    const map = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
    };
    return map[condition] || '☀️';
  };

  const renderForecastItem = ({ item }) => {
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <View style={styles.forecastCard}>
        <View style={styles.dateCol}>
          <Text style={styles.dayText}>{dayName}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.iconText}>{getWeatherIcon(item.weather[0].main)}</Text>
        <View style={styles.tempCol}>
          <Text style={styles.tempText}>{Math.round(item.main.temp)}°C</Text>
          <Text style={styles.condText}>{item.weather[0].main}</Text>
        </View>
        <View style={styles.extraCol}>
          <Text style={styles.extraText}>💧 {item.main.humidity}%</Text>
          <Text style={styles.extraText}>💨 {Math.round(item.wind.speed)}m/s</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/hero.png')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>5-Day Forecast</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.ascLabel}>Agrarian Service Center:</Text>
          <Text style={styles.ascName}>{ascName || 'General Area'}</Text>
          <Text style={styles.districtText}>📍 {district}, Sri Lanka</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loadingText}>Fetching 5-day forecast...</Text>
          </View>
        ) : (
          <FlatList
            data={forecast}
            keyExtractor={item => item.dt.toString()}
            renderItem={renderForecastItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<Text style={styles.listTitle}>Upcoming Weather</Text>}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2
  },
  backBtnText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20' },
  locationInfo: { padding: 25, backgroundColor: '#2e7d32', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  ascLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 },
  ascName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  districtText: { color: '#fff', fontSize: 14, opacity: 0.9 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#666' },
  listContent: { padding: 20 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  forecastCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  dateCol: { flex: 1.5 },
  dayText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 12, color: '#888' },
  iconText: { fontSize: 35, flex: 1, textAlign: 'center' },
  tempCol: { flex: 1, alignItems: 'center' },
  tempText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
  condText: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  extraCol: { flex: 1, alignItems: 'flex-end' },
  extraText: { fontSize: 11, color: '#777', marginBottom: 2 }
});

export default WeatherForecastScreen;
