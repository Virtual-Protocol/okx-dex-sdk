"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const web3_js_1 = require("@solana/web3.js");
require("dotenv/config");
const wallet_1 = require("../../core/wallet");
async function main() {
    var _a, _b, _c, _d, _e, _f;
    if (!process.env.SOLANA_RPC_URL)
        throw new Error('Missing SOLANA_RPC_URL');
    if (!process.env.SOLANA_PRIVATE_KEY)
        throw new Error('Missing SOLANA_PRIVATE_KEY');
    const connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL);
    const wallet = (0, wallet_1.createWallet)(process.env.SOLANA_PRIVATE_KEY, connection);
    const client = new index_1.OKXDexClient({
        apiKey: process.env.OKX_API_KEY,
        secretKey: process.env.OKX_SECRET_KEY,
        apiPassphrase: process.env.OKX_API_PASSPHRASE,
        projectId: process.env.OKX_PROJECT_ID,
        solana: { wallet },
    });
    const chainIndex = '501';
    const fromTokenAddress = '11111111111111111111111111111111'; // SOL
    const toTokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // BONK
    const resp = await client.dex.getSolanaSwapInstruction({
        chainIndex,
        fromTokenAddress,
        toTokenAddress,
        amount: '10000000', // 0.01 SOL
        userWalletAddress: wallet.publicKey.toString(),
        slippagePercent: '0.1',
    });
    console.log('swap-instruction response :', resp);
    if (!resp.data) {
        console.error('swap-instruction empty');
        console.error(JSON.stringify(resp, null, 2));
        return;
    }
    const instr = resp.data;
    console.log('routerResult:', (_d = (_c = (_b = (_a = instr === null || instr === void 0 ? void 0 : instr.routerResult) === null || _a === void 0 ? void 0 : _a.dexRouterList) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.dexProtocol) === null || _d === void 0 ? void 0 : _d.dexName);
    console.log('instruction count:', (_f = (_e = instr === null || instr === void 0 ? void 0 : instr.instructionLists) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0);
    const result = await client.dex.executeSolanaSwapInstructions({
        chainIndex,
        fromTokenAddress,
        toTokenAddress,
        amount: '10000000',
        userWalletAddress: wallet.publicKey.toString(),
        slippagePercent: '0.01',
    });
    console.log('Tx Result:', result);
}
main().catch((e) => {
    console.error('Error:', e);
    process.exit(1);
});
