import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGemma3n } from '../hooks/useGemma3n';

export const SimpleGemmaExample: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const {
        isLoaded,
        isLoading: isModelLoading,
        error,
        loadModel,
        generateText,
        modelInfo,
    } = useGemma3n({
        config: {
            modelSize: 'E2B',
            maxTokens: 256,
            temperature: 0.7,
            quantized: true,
        },
        autoLoad: false, // Don't auto-load for this example
    });

    const handleGenerateText = async () => {
        if (!prompt.trim() || !isLoaded) return;

        setIsGenerating(true);
        try {
            const result = await generateText(prompt, {
                maxTokens: 100,
                temperature: 0.7,
            });
            setResponse(result);
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLoadModel = async () => {
        try {
            await loadModel();
            Alert.alert('Success', 'Gemma 3n model loaded successfully!');
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load model');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gemma 3n Text Generation</Text>

            {/* Model Status */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Model Status:</Text>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isLoaded ? '#4CAF50' : '#F44336' }
                ]} />
                <Text style={styles.statusText}>
                    {isModelLoading ? 'Loading...' : isLoaded ? 'Loaded' : 'Not Loaded'}
                </Text>
            </View>

            {modelInfo && (
                <Text style={styles.modelInfo}>
                    Model: {modelInfo.modelSize} | Quantized: {modelInfo.config.quantized ? 'Yes' : 'No'}
                </Text>
            )}

            {/* Load Model Button */}
            {!isLoaded && (
                <TouchableOpacity
                    style={[styles.button, isModelLoading && styles.disabledButton]}
                    onPress={handleLoadModel}
                    disabled={isModelLoading}
                >
                    {isModelLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Load Model</Text>
                    )}
                </TouchableOpacity>
            )}

            {/* Error Display */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Text Generation */}
            {isLoaded && (
                <>
                    <TextInput
                        style={styles.input}
                        value={prompt}
                        onChangeText={setPrompt}
                        placeholder="Enter your prompt..."
                        multiline
                        maxLength={200}
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!prompt.trim() || isGenerating) && styles.disabledButton
                        ]}
                        onPress={handleGenerateText}
                        disabled={!prompt.trim() || isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Generate Text</Text>
                        )}
                    </TouchableOpacity>

                    {response && (
                        <View style={styles.responseContainer}>
                            <Text style={styles.responseLabel}>Generated Text:</Text>
                            <Text style={styles.responseText}>{response}</Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusLabel: {
        fontSize: 16,
        marginRight: 8,
        color: '#666',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        color: '#333',
    },
    modelInfo: {
        fontSize: 12,
        color: '#888',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#0066cc',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        minHeight: 80,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    responseContainer: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    responseLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    responseText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
    },
});
