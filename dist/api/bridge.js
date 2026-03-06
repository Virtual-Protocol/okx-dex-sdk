"use strict";
// src/api/bridge.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeAPI = void 0;
class BridgeAPI {
    constructor(client) {
        this.client = client;
    }
    // Get tokens supported for cross-chain transfers
    async getSupportedTokens(chainIndex) {
        return this.client.request('GET', '/api/v5/dex/cross-chain/supported/tokens', { chainIndex });
    }
    // Get supported bridges for a chain
    async getSupportedBridges(chainIndex) {
        return this.client.request('GET', '/api/v5/dex/cross-chain/supported/bridges', { chainIndex });
    }
    // Get token pairs available for bridging
    async getBridgeTokenPairs(fromChainIndex) {
        return this.client.request('GET', '/api/v5/dex/cross-chain/supported/bridge-tokens-pairs', { fromChainIndex });
    }
    // Get quote for a cross-chain swap
    async getCrossChainQuote(params) {
        // Validate slippage
        const slippageValue = parseFloat(params.slippagePercent);
        if (isNaN(slippageValue) || slippageValue < 0.002 || slippageValue > 0.5) {
            throw new Error('Slippage must be between 0.002 (0.2%) and 0.5 (50%)');
        }
        return this.client.request('GET', '/api/v5/dex/cross-chain/quote', params);
    }
    // Build cross-chain swap transaction
    async buildCrossChainSwap(params) {
        // Validate required parameters
        if (!params.userWalletAddress) {
            throw new Error('userWalletAddress is required');
        }
        return this.client.request('GET', '/api/v5/dex/cross-chain/build-tx', params);
    }
}
exports.BridgeAPI = BridgeAPI;
