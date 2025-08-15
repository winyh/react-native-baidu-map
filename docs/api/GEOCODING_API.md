# 地理编码 API 文档

百度地图 React Native SDK 提供了完整的地理编码功能，包括地址解析、逆地理编码、POI搜索等功能。

## 导入模块

```typescript
import { GeocodingModule } from 'react-native-baidu-map';
```

## 地理编码（地址转坐标）

将地址转换为经纬度坐标。

```typescript
// 基本用法
const result = await GeocodingModule.geocoding('北京市朝阳区望京SOHO');

if (result.success && result.data) {
  console.log('坐标:', result.data.latitude, result.data.longitude);
  console.log('格式化地址:', result.data.formattedAddress);
}

// 指定城市
const result2 = await GeocodingModule.geocoding('天安门', '北京市');
```

## 逆地理编码（坐标转地址）

将经纬度坐标转换为地址信息。

```typescript
const coordinate = { latitude: 39.9042, longitude: 116.4074 };
const result = await GeocodingModule.reverseGeocoding(coordinate, 1000);

if (result.success && result.data) {
  console.log('地址:', result.data.formattedAddress);
  console.log('省份:', result.data.province);
  console.log('城市:', result.data.city);
  console.log('区县:', result.data.district);
  console.log('街道:', result.data.street);
}
```

## POI搜索

搜索兴趣点信息。

```typescript
// 城市内搜索
const searchOptions = {
  keyword: '星巴克',
  city: '北京市',
  pageIndex: 0,
  pageSize: 10,
  scope: 1 // 1-详细信息，0-基本信息
};

const result = await GeocodingModule.searchPOI(searchOptions);

if (result.success && result.data) {
  console.log('总结果数:', result.data.totalResultNumber);
  console.log('当前页:', result.data.currentPageNumber);
  
  result.data.poiInfoList.forEach(poi => {
    console.log('名称:', poi.name);
    console.log('地址:', poi.address);
    console.log('坐标:', poi.latitude, poi.longitude);
    console.log('电话:', poi.phone);
  });
}

// 区域内搜索
const regionSearchOptions = {
  keyword: '餐厅',
  region: {
    center: { latitude: 39.9042, longitude: 116.4074 },
    radius: 2000
  },
  pageIndex: 0,
  pageSize: 20
};

const regionResult = await GeocodingModule.searchPOI(regionSearchOptions);
```

## 周边搜索

搜索指定位置周边的POI。

```typescript
const nearbyOptions = {
  location: { latitude: 39.9042, longitude: 116.4074 },
  radius: 1000,
  keyword: '银行',
  pageIndex: 0,
  pageSize: 10,
  sortType: 'distance' // 'distance' | 'comprehensive'
};

const result = await GeocodingModule.searchNearby(nearbyOptions);

if (result.success && result.data) {
  result.data.poiInfoList.forEach(poi => {
    console.log(`${poi.name} - ${poi.address}`);
  });
}
```

## 搜索建议

获取搜索关键词的建议列表。

```typescript
const suggestionOptions = {
  keyword: '北京大学',
  city: '北京市',
  cityLimit: true
};

const result = await GeocodingModule.searchSuggestion(suggestionOptions);

if (result.success && result.data) {
  result.data.forEach(suggestion => {
    console.log('建议:', suggestion.key);
    console.log('城市:', suggestion.city);
    console.log('区域:', suggestion.district);
    if (suggestion.pt) {
      console.log('坐标:', suggestion.pt.latitude, suggestion.pt.longitude);
    }
  });
}
```

## 批量地理编码

批量将地址转换为坐标。

```typescript
const addresses = [
  '北京市天安门广场',
  '上海市外滩',
  '广州市珠江新城'
];

const results = await GeocodingModule.batchGeocoding(addresses);

if (results.success && results.data) {
  results.data.forEach((result, index) => {
    console.log(`${addresses[index]}: ${result.latitude}, ${result.longitude}`);
  });
}
```

## 批量逆地理编码

批量将坐标转换为地址。

```typescript
const coordinates = [
  { latitude: 39.9042, longitude: 116.4074 }, // 北京
  { latitude: 31.2304, longitude: 121.4737 }, // 上海
  { latitude: 23.1291, longitude: 113.2644 }  // 广州
];

const results = await GeocodingModule.batchReverseGeocoding(coordinates, 1000);

if (results.success && results.data) {
  results.data.forEach((result, index) => {
    console.log(`坐标 ${coordinates[index].latitude}, ${coordinates[index].longitude}:`);
    console.log(`地址: ${result.formattedAddress}`);
  });
}
```

## 错误处理

所有地理编码方法都返回统一的结果格式：

```typescript
interface MapMethodResult<T> {
  success: boolean;
  data?: T;
  error?: BaiduMapError;
  message?: string;
}

// 错误处理示例
const result = await GeocodingModule.geocoding('无效地址');

if (!result.success) {
  console.error('地理编码失败:', result.error?.message);
  
  switch (result.error?.code) {
    case 'INVALID_PARAMETER':
      console.log('参数无效');
      break;
    case 'NETWORK_ERROR':
      console.log('网络错误');
      break;
    case 'SDK_NOT_INITIALIZED':
      console.log('SDK未初始化');
      break;
    default:
      console.log('未知错误');
  }
}
```

## 类型定义

### GeocodingResult

```typescript
interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  adCode?: string;
  cityCode?: string;
}
```

### ReverseGeocodingResult

```typescript
interface ReverseGeocodingResult {
  formattedAddress: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  adCode?: string;
  cityCode?: string;
  business?: string;
  sematicDescription?: string;
}
```

### POIInfo

```typescript
interface POIInfo {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  uid?: string;
  phone?: string;
  postcode?: string;
  type?: string;
  tag?: string;
  detail?: number;
  price?: number;
  shopHours?: string;
  overallRating?: number;
  // ... 更多评分字段
}
```

### POISearchResult

```typescript
interface POISearchResult {
  totalPageNumber: number;
  totalResultNumber: number;
  currentPageNumber: number;
  pageSize: number;
  poiInfoList: POIInfo[];
}
```

## 注意事项

1. **SDK初始化**: 使用地理编码功能前，请确保已正确初始化百度地图SDK。

2. **网络权限**: 地理编码功能需要网络连接，请确保应用有网络访问权限。

3. **API配额**: 百度地图API有使用配额限制，请合理使用避免超出限制。

4. **坐标系**: 百度地图使用BD09坐标系，如需转换到其他坐标系，请使用坐标转换工具。

5. **错误重试**: 网络错误时建议实现重试机制，但要避免频繁请求。

6. **缓存策略**: 对于相同的地理编码请求，建议实现本地缓存以提高性能。

## 完整示例

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text, FlatList } from 'react-native';
import { GeocodingModule, POIInfo } from 'react-native-baidu-map';

const GeocodingExample = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<POIInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPOI = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    try {
      const result = await GeocodingModule.searchPOI({
        keyword: keyword.trim(),
        city: '北京市',
        pageSize: 20
      });
      
      if (result.success && result.data) {
        setResults(result.data.poiInfoList);
      } else {
        console.error('搜索失败:', result.error?.message);
      }
    } catch (error) {
      console.error('搜索异常:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="输入搜索关键词"
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title={loading ? "搜索中..." : "搜索"} onPress={searchPOI} disabled={loading} />
      
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.uid || index}`}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.address}</Text>
            <Text>坐标: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text>
            {item.phone && <Text>电话: {item.phone}</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default GeocodingExample;
```

这个地理编码API提供了完整的地址解析、POI搜索和位置服务功能，可以满足大多数地图应用的需求。