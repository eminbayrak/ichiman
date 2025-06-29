import { Gemma3nConfig } from '../services/gemma3nService';

/**
 * Gemma 3n Configuration Options
 * 
 * This file contains configuration presets for different use cases.
 * You can customize these based on your app's requirements.
 */

// Performance-optimized configuration for mobile devices
export const mobileOptimizedConfig: Gemma3nConfig = {
    modelSize: 'E2B', // 2B parameters - smaller, faster
    maxTokens: 256,   // Reasonable token limit for mobile
    temperature: 0.7, // Balanced creativity vs consistency
    topK: 50,         // Good balance for diverse responses
    quantized: true,  // Essential for mobile performance
};

// Quality-focused configuration (requires more resources)
export const qualityFocusedConfig: Gemma3nConfig = {
    modelSize: 'E4B', // 4B parameters - larger, more capable
    maxTokens: 512,   // Longer responses
    temperature: 0.8, // More creative responses
    topK: 40,         // Slightly more focused
    quantized: true,  // Still use quantization for efficiency
};

// Fast response configuration (minimal resource usage)
export const fastResponseConfig: Gemma3nConfig = {
    modelSize: 'E2B', // Smaller model
    maxTokens: 128,   // Short responses
    temperature: 0.5, // More deterministic/consistent
    topK: 30,         // More focused responses
    quantized: true,  // Maximum optimization
};

// Creative writing configuration
export const creativeWritingConfig: Gemma3nConfig = {
    modelSize: 'E4B', // Larger model for better creativity
    maxTokens: 512,   // Longer form content
    temperature: 0.9, // High creativity
    topK: 60,         // More diverse vocabulary
    quantized: true,  // Balanced performance
};

// Question answering configuration
export const qaConfig: Gemma3nConfig = {
    modelSize: 'E2B', // Sufficient for factual responses
    maxTokens: 256,   // Moderate response length
    temperature: 0.3, // More factual/consistent
    topK: 30,         // Focused responses
    quantized: true,  // Performance optimized
};

/**
 * Model Performance Expectations
 * 
 * E2B Model (2B parameters):
 * - Memory usage: ~2GB
 * - Faster inference
 * - Good for: chat, Q&A, simple tasks
 * - Recommended for: Most mobile apps
 * 
 * E4B Model (4B parameters):
 * - Memory usage: ~3GB
 * - Better quality responses
 * - Good for: creative writing, complex reasoning
 * - Recommended for: High-end devices only
 * 
 * Quantization Impact:
 * - Reduces model size by ~4x
 * - Minimal quality loss
 * - Essential for mobile deployment
 * - Recommended: Always use quantized models on mobile
 */

export const defaultConfig = mobileOptimizedConfig;
