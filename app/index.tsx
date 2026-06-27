import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAF3' }}>
      <ActivityIndicator size="large" color="#7EB93C" />
    </View>
  );
}
