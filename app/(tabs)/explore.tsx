import { Gemma3nChat } from '@/components/Gemma3nChat';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIScreen() {
  const handleModelLoaded = () => {
    console.log('Gemma 3n model loaded successfully!');
  };

  const handleError = (error: string) => {
    console.error('Gemma 3n error:', error);
    Alert.alert('AI Error', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Gemma3nChat
          config={{
            modelSize: 'E2B', // Use smaller model for better mobile performance
            maxTokens: 256,
            temperature: 0.7,
            topK: 50,
            quantized: true,
          }}
          onModelLoaded={handleModelLoaded}
          onError={handleError}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
