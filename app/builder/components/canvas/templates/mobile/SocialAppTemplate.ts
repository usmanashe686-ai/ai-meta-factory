import { Template } from '../TemplateLibrary';

export const socialAppTemplate: Template = {
  id: 'mobile-social-app',
  name: 'Social App (React Native)',
  description: 'A basic social media app with feed, profile, and post creation.',
  category: 'mobile',
  stack: ['React Native', 'Expo', 'Firebase'],
  files: {
    'App.js': `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from './screens/FeedScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`,
    'screens/FeedScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts([
      { id: '1', user: 'Alice', content: 'Hello world!' },
      { id: '2', user: 'Bob', content: 'React Native is awesome!' },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.user}>{item.user}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  post: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  user: { fontWeight: 'bold', marginBottom: 8 },
});`,
    'screens/ProfileScreen.js': `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>User profile will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});`,
    'package.json': `{
  "name": "SocialApp",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": { "start": "expo start" },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.5",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17"
  }
}`,
  },
};
