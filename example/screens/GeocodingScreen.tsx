import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import {
  GeocodingModule,
  Logger,
  LatLng,
} from '@react-native/winyh-baidu-map';

interface Props {
  onGoBack: () => void;
}

const GeocodingScreen: React.FC<Props> = ({ onGoBack }) => {
  const [address, setAddress] = useState('北京市海淀区上地十街10号');
  const [city, setCity] = useState('北京');
  const [geocodeResult, setGeocodeResult] = useState<LatLng | null>(null);

  const [reverseGeoLat, setReverseGeoLat] = useState('39.915');
  const [reverseGeoLng, setReverseGeoLng] = useState('116.404');
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState<string | null>(null);

  const handleGeocode = async () => {
    try {
      Logger.info('开始地理编码', { address, city });
      const result = await GeocodingModule.geocoding(address, city);
      Logger.info('地理编码成功', result);
      setGeocodeResult(result);
      Alert.alert('地理编码成功', `纬度: ${result.latitude.toFixed(6)}
经度: ${result.longitude.toFixed(6)}`);
    } catch (error) {
      Logger.error('地理编码失败', error);
      Alert.alert('地理编码失败', error.message);
    }
  };

  const handleReverseGeocode = async () => {
    try {
      const coordinate = {
        latitude: parseFloat(reverseGeoLat),
        longitude: parseFloat(reverseGeoLng),
      };
      Logger.info('开始逆地理编码', coordinate);
      const result = await GeocodingModule.reverseGeocoding(coordinate);
      Logger.info('逆地理编码成功', result);
      setReverseGeocodeResult(result.formattedAddress);
      Alert.alert('逆地理编码成功', `地址: ${result.formattedAddress}`);
    } catch (error) {
      Logger.error('逆地理编码失败', error);
      Alert.alert('逆地理编码失败', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.backButton}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>地理编码</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>地理编码</Text>
        <TextInput
          style={styles.input}
          placeholder="输入地址"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="输入城市"
          value={city}
          onChangeText={setCity}
        />
        <TouchableOpacity style={styles.button} onPress={handleGeocode}>
          <Text style={styles.buttonText}>地址 -> 坐标</Text>
        </TouchableOpacity>
        {geocodeResult && (
          <Text style={styles.resultText}>
            结果: {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
          </Text>
        )}

        <Text style={styles.sectionTitle}>逆地理编码</Text>
        <View style={styles.latLngContainer}>
          <TextInput
            style={[styles.input, styles.latLngInput]}
            placeholder="纬度"
            value={reverseGeoLat}
            onChangeText={setReverseGeoLat}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.latLngInput]}
            placeholder="经度"
            value={reverseGeoLng}
            onChangeText={setReverseGeoLng}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleReverseGeocode}>
          <Text style={styles.buttonText}>坐标 -> 地址</Text>
        </TouchableOpacity>
        {reverseGeocodeResult && (
          <Text style={styles.resultText}>
            结果: {reverseGeocodeResult}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  latLngContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  latLngInput: {
    width: '48%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resultText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GeocodingScreen;
