import { HTTPClient } from '../core/http-client';
export interface CrossChainQuoteParams {
    [key: string]: string | undefined;
    fromChainIndex: string;
    toChainIndex: string;
    fromChainId: string;
    toChainId: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    slippagePercent: string;
    sort?: string;
    dexIds?: string;
    allowBridge?: string;
    denyBridge?: string;
    priceImpactProtectionPercentage?: string;
}
export interface CrossChainSwapParams extends CrossChainQuoteParams {
    userWalletAddress: string;
    receiveAddress?: string;
    referrerAddress?: string;
    feePercent?: string;
    onlyBridge?: string;
    memo?: string;
}
export declare class BridgeAPI {
    private readonly client;
    constructor(client: HTTPClient);
    getSupportedTokens(chainIndex: string): Promise<unknown>;
    getSupportedBridges(chainIndex: string): Promise<unknown>;
    getBridgeTokenPairs(fromChainIndex: string): Promise<unknown>;
    getCrossChainQuote(params: CrossChainQuoteParams): Promise<unknown>;
    buildCrossChainSwap(params: CrossChainSwapParams): Promise<unknown>;
}
