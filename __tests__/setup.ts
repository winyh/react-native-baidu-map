import React from 'react';
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    NativeModules: {
      BaiduMapModule: {
        initSDK: jest.fn(),
        isSDKInitialized: jest.fn(() => Promise.resolve(true)),
        getSDKVersion: jest.fn(() => Promise.resolve('1.0.0')),
        convertCoordinate: jest.fn((coord) => Promise.resolve(coord)),
        convertCoordinates: jest.fn((coords) => Promise.resolve(coords)),
        clearMapCache: jest.fn(() => Promise.resolve()),
        setAgreePrivacy: jest.fn(() => Promise.resolve()),
        takeSnapshot: jest.fn(() => Promise.resolve({ uri: 'file:///snapshot.png', path: '/snapshot.png' })),
        setMapCustomStyle: jest.fn(() => Promise.resolve()),
        addHeatMap: jest.fn(() => Promise.resolve()),
        removeHeatMap: jest.fn(() => Promise.resolve()),
        animateToLocation: jest.fn(() => Promise.resolve()),
        animateToZoom: jest.fn(() => Promise.resolve()),
        downloadOfflineMap: jest.fn(() => Promise.resolve({ success: true, message: 'ok' })),
        getOfflineMapList: jest.fn(() => Promise.resolve([])),
      },
      BaiduGeocodingModule: {
        geocoding: jest.fn(() => Promise.resolve({ latitude: 0, longitude: 0, formattedAddress: 'mock address' })),
        reverseGeocoding: jest.fn(() => Promise.resolve({ formattedAddress: 'mock address' })),
        searchPOI: jest.fn(() => Promise.resolve({ poiInfoList: [] })),
        searchNearby: jest.fn(() => Promise.resolve({ poiInfoList: [] })),
        searchSuggestion: jest.fn(() => Promise.resolve([])),
      },
      BaiduRoutePlanningModule: {
        plan: jest.fn(),
      },
      LocationModule: {
        getCurrentLocation: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
        requestPermission: jest.fn(),
        checkPermission: jest.fn(),
      },
      CoordinateConverter: {
        convertCoordinate: jest.fn(),
        convertBatch: jest.fn(),
        isValidCoordinate: jest.fn(),
        getCoordinateType: jest.fn(),
      },
      PermissionManager: {
        checkLocationPermission: jest.fn(),
        requestLocationPermission: jest.fn(),
        ensureLocationPermission: jest.fn(),
      },
    },
    requireNativeComponent: jest.fn(() => {
      const React = require('react');
      const MockComponent = (props: any) => {
        return React.createElement('View', {
          ...props,
          testID: props.testID || 'mocked-native-component',
        });
      };
      MockComponent.displayName = 'MockedNativeComponent';
      return MockComponent;
    }),
    Platform: {
      OS: 'ios',
      Version: '14.0',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({
        width: 375,
        height: 812,
        scale: 2,
        fontScale: 1,
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    PermissionsAndroid: {
      PERMISSIONS: {
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again',
      },
      request: jest.fn(),
      check: jest.fn(),
      requestMultiple: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openSettings: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      openURL: jest.fn(() => Promise.resolve()),
    },
  };
});

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless explicitly needed
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.useFakeTimers();
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Mock performance.now for performance tests
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock IntersectionObserver for viewport tests
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
})) as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock localStorage for caching tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  configurable: true,
});

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeValidCoordinate(received: { latitude: number; longitude: number }) {
    const { latitude, longitude } = received;
    const pass = 
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid coordinate`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid coordinate`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidCoordinate(): R;
    }
  }
}

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillMount') ||
     args[0].includes('ReactNative.createElement'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Test environment information
console.log('Test environment setup completed');
console.log('React Native version:', require('react-native/package.json').version);
console.log('Jest version:', require('jest/package.json').version);