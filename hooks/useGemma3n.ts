import { useCallback, useEffect, useState } from 'react';
import { Gemma3nConfig, gemma3nService } from '../services/gemma3nService';

export interface UseGemma3nOptions {
    config?: Gemma3nConfig;
    autoLoad?: boolean;
}

export interface UseGemma3nReturn {
    // State
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadModel: () => Promise<void>;
    unloadModel: () => Promise<void>;
    generateText: (prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
        topK?: number;
    }) => Promise<string>;
    chat: (messages: { role: 'user' | 'assistant' | 'system'; content: string; }[]) => Promise<string>;

    // Model info
    modelInfo: {
        isLoaded: boolean;
        modelSize: string;
        config: Gemma3nConfig;
    } | null;
}

export const useGemma3n = (options: UseGemma3nOptions = {}): UseGemma3nReturn => {
    const { config, autoLoad = true } = options;

    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modelInfo, setModelInfo] = useState<UseGemma3nReturn['modelInfo']>(null);

    const loadModel = useCallback(async () => {
        if (isLoaded || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            // Configure the service if config is provided
            if (config) {
                Object.assign(gemma3nService, new (gemma3nService.constructor as any)(config));
            }

            await gemma3nService.initializeModel();

            const info = gemma3nService.getModelInfo();
            setModelInfo(info);
            setIsLoaded(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Failed to load Gemma 3n model:', err);
        } finally {
            setIsLoading(false);
        }
    }, [config, isLoaded, isLoading]);

    const unloadModel = useCallback(async () => {
        if (!isLoaded) return;

        try {
            await gemma3nService.unloadModel();
            setIsLoaded(false);
            setModelInfo(null);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Failed to unload Gemma 3n model:', err);
        }
    }, [isLoaded]);

    const generateText = useCallback(async (
        prompt: string,
        options?: {
            maxTokens?: number;
            temperature?: number;
            topK?: number;
        }
    ): Promise<string> => {
        if (!isLoaded) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        try {
            setError(null);
            return await gemma3nService.generateText(prompt, options);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Text generation failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [isLoaded]);

    const chat = useCallback(async (
        messages: { role: 'user' | 'assistant' | 'system'; content: string; }[]
    ): Promise<string> => {
        if (!isLoaded) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        try {
            setError(null);
            return await gemma3nService.chat(messages);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Chat failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [isLoaded]);

    // Auto-load model on mount if autoLoad is true
    useEffect(() => {
        if (autoLoad && !isLoaded && !isLoading) {
            loadModel();
        }
    }, [autoLoad, isLoaded, isLoading, loadModel]);

    return {
        isLoaded,
        isLoading,
        error,
        loadModel,
        unloadModel,
        generateText,
        chat,
        modelInfo,
    };
};
