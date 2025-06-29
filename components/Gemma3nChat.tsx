import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gemma3nConfig, gemma3nService } from '../services/gemma3nService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Gemma3nChatProps {
    config?: Gemma3nConfig;
    onModelLoaded?: () => void;
    onError?: (error: string) => void;
}

export const Gemma3nChat: React.FC<Gemma3nChatProps> = ({
    config,
    onModelLoaded,
    onError,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const initializeModel = useCallback(async () => {
        if (isModelLoaded || isInitializing) return;

        setIsInitializing(true);
        try {
            // Configure the service if config is provided
            if (config) {
                // Reinitialize service with new config
                Object.assign(gemma3nService, new (gemma3nService.constructor as any)(config));
            }

            await gemma3nService.initializeModel();
            setIsModelLoaded(true);
            onModelLoaded?.();

            // Add welcome message
            setMessages([{
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Hello! I\'m Gemma 3n, your local AI assistant. How can I help you today?',
                timestamp: new Date(),
            }]);
        } catch (error) {
            const errorMessage = `Failed to load model: ${error}`;
            console.error(errorMessage);
            onError?.(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setIsInitializing(false);
        }
    }, [config, isModelLoaded, isInitializing, onModelLoaded, onError]);

    // Initialize the model when component mounts
    useEffect(() => {
        initializeModel();
    }, [initializeModel]);

    const sendMessage = useCallback(async () => {
        if (!inputText.trim() || isLoading || !isModelLoaded) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepare conversation history for context
            const chatHistory = messages.concat(userMessage).map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await gemma3nService.chat(chatHistory);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = `Failed to generate response: ${error}`;
            console.error(errorMessage);

            const errorResponseMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorResponseMessage]);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, isModelLoaded, messages, onError]);

    const clearChat = useCallback(() => {
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Chat cleared! How can I help you?',
            timestamp: new Date(),
        }]);
    }, []);

    const renderMessage = (message: Message) => (
        <View
            key={message.id}
            style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
        >
            <Text style={styles.messageRole}>
                {message.role === 'user' ? 'You' : 'Gemma 3n'}
            </Text>
            <Text style={styles.messageContent}>{message.content}</Text>
            <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString()}
            </Text>
        </View>
    );

    if (isInitializing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading Gemma 3n model...</Text>
                <Text style={styles.loadingSubtext}>
                    This may take a few minutes on the first run
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gemma 3n Chat</Text>
                <View style={styles.statusContainer}>
                    <View
                        style={[
                            styles.statusIndicator,
                            { backgroundColor: isModelLoaded ? '#4CAF50' : '#F44336' },
                        ]}
                    />
                    <Text style={styles.statusText}>
                        {isModelLoaded ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.messagesContainer}>
                {messages.map(renderMessage)}
                {isLoading && (
                    <View style={styles.loadingMessageContainer}>
                        <ActivityIndicator size="small" color="#0066cc" />
                        <Text style={styles.loadingMessageText}>Thinking...</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type your message..."
                    multiline
                    maxLength={500}
                    editable={isModelLoaded && !isLoading}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!isModelLoaded || isLoading || !inputText.trim()) && styles.disabledButton,
                        ]}
                        onPress={sendMessage}
                        disabled={!isModelLoaded || isLoading || !inputText.trim()}
                    >
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearChat}
                        disabled={!isModelLoaded}
                    >
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#333',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#0066cc',
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
    },
    messageRole: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#666',
    },
    messageContent: {
        fontSize: 16,
        lineHeight: 22,
        color: '#333',
    },
    messageTime: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    loadingMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
    },
    loadingMessageText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        maxHeight: 100,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sendButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    clearButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});
