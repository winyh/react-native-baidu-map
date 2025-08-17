import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface Example {
  id: string;
  name: string;
  description: string;
}

const EXAMPLES: Example[] = [
  { id: 'basic', name: '基础地图', description: '展示地图基本功能、标记、覆盖物' },
  { id: 'location', name: '定位功能', description: '获取当前位置、持续定位' },
  { id: 'geocoding', name: '地理编码', description: '地理编码与逆地理编码' },
  { id: 'route_planning', name: '路线规划', description: '驾车、步行、骑行路线规划' },
  { id: 'heatmap', name: '热力图', description: '展示热力图效果' },
  { id: 'custom_style', name: '自定义地图', description: '应用自定义地图样式' },
];

interface Props {
  onSelect: (screenId: string) => void;
}

const HomeScreen: React.FC<Props> = ({ onSelect }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>百度地图示例</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {EXAMPLES.map((example) => (
          <TouchableOpacity
            key={example.id}
            style={styles.itemContainer}
            onPress={() => onSelect(example.id)}
          >
            <Text style={styles.itemName}>{example.name}</Text>
            <Text style={styles.itemDescription}>{example.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen;