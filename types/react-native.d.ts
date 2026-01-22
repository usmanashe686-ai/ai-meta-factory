// Type declarations to fix React Native conflicts
import 'react-native'

// Override conflicting types
declare module 'react-native' {
  export interface ViewStyle {
    transform?: any; // Relax transform type
  }
}

// Fix global type conflicts
declare global {
  var __BUNDLE_START_TIME__: number;
  var HermesInternal: null | {};
  var ErrorUtils: any;
  var originalXMLHttpRequest: any;
}
