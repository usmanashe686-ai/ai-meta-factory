import { Component } from '@/lib/types/builder'

export interface ReactNativeComponent {
  name: string
  code: string
  imports: string[]
  dependencies: string[]
}

export class ReactNativeTransformer {
  static convertComponent(component: Component): ReactNativeComponent {
    const transformers: Record<string, Function> = {
      'button': this.convertButton,
      'input': this.convertInput,
      'text': this.convertText,
      'card': this.convertCard,
      'container': this.convertContainer
    }
    
    const transformer = transformers[component.type] || this.convertGeneric
    return transformer(component)
  }

  private static convertButton(component: Component): ReactNativeComponent {
    return {
      name: `${component.props.text || 'Button'}Component`,
      code: `
import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

export const ${component.props.text || 'Button'}Component = ({ onPress, title }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <Text style={styles.text}>{title || "${component.props.text || 'Button'}"}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '${component.props.color || '#3B82F6'}',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
`,
      imports: ['TouchableOpacity', 'Text', 'StyleSheet'],
      dependencies: []
    }
  }

  private static convertInput(component: Component): ReactNativeComponent {
    return {
      name: `${component.props.label || 'Input'}Component`,
      code: `
import React, { useState } from 'react'
import { TextInput, View, Text, StyleSheet } from 'react-native'

export const ${component.props.label || 'Input'}Component = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>${component.props.label || 'Input'}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="${component.props.placeholder || 'Enter text...'}"
        placeholderTextColor="#999"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
})
`,
      imports: ['TextInput', 'View', 'Text', 'StyleSheet'],
      dependencies: []
    }
  }

  private static convertGeneric(component: Component): ReactNativeComponent {
    return {
      name: `Generic${component.type.charAt(0).toUpperCase() + component.type.slice(1)}Component`,
      code: `
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export const Generic${component.type.charAt(0).toUpperCase() + component.type.slice(1)}Component = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${component.type} Component</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    color: '#374151',
  },
})
`,
      imports: ['View', 'Text', 'StyleSheet'],
      dependencies: []
    }
  }
}
