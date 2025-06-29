const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve platform-specific modules
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Exclude problematic native modules from web bundles
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add resolver to exclude ONNX runtime bindings from web builds
config.resolver.alias = {
    ...(config.resolver.alias || {}),
};

// Block native modules on web
if (process.env.EXPO_PLATFORM === 'web') {
    config.resolver.blockList = [
        /node_modules\/onnxruntime-node\/.*\.node$/,
        /node_modules\/.*\.node$/,
    ];
}

module.exports = config;
