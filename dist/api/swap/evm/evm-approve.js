"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMApproveExecutor = void 0;
// src/api/swap/evm/evm-approve.ts
const ethers_1 = require("ethers");
const http_client_1 = require("../../../core/http-client");
// ERC20 ABI for approval
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [
            { "name": "_owner", "type": "address" },
            { "name": "_spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_spender", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];
class EVMApproveExecutor {
    constructor(config, networkConfig) {
        var _a;
        this.config = config;
        this.networkConfig = networkConfig;
        this.DEFAULT_GAS_MULTIPLIER = BigInt(150); // 1.5x
        if (!((_a = this.config.evm) === null || _a === void 0 ? void 0 : _a.wallet)) {
            throw new Error("EVM configuration required");
        }
        this.provider = this.config.evm.wallet.provider;
        this.httpClient = new http_client_1.HTTPClient(this.config);
    }
    async executeSwap(swapData, params) {
        throw new Error("Swap execution not supported in approval executor");
    }
    async getAllowance(tokenAddress, ownerAddress, spenderAddress) {
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const allowanceResult = await tokenContract.allowance(ownerAddress, spenderAddress);
        return allowanceResult;
    }
    async handleTokenApproval(chainIndex, tokenAddress, amount, nonce) {
        var _a;
        if (!((_a = this.config.evm) === null || _a === void 0 ? void 0 : _a.wallet)) {
            throw new Error("EVM wallet required");
        }
        const dexContractAddress = await this.getDexContractAddress(chainIndex, tokenAddress, amount);
        try {
            // Execute the approval transaction
            const result = await this.executeApprovalTransaction(tokenAddress, dexContractAddress, amount, nonce);
            return { transactionHash: result.hash };
        }
        catch (error) {
            console.error("Approval execution failed:", error);
            throw error;
        }
    }
    async getDexContractAddress(chainIndex, tokenAddress, amount) {
        var _a, _b;
        try {
            const response = await this.httpClient.request('GET', '/api/v6/dex/aggregator/approve-transaction', {
                chainIndex: chainIndex,
                tokenContractAddress: tokenAddress,
                approveAmount: amount
            });
            if (!((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.dexContractAddress)) {
                throw new Error(`No dex contract address found for chain ${chainIndex}`);
            }
            return response.data[0].dexContractAddress;
        }
        catch (error) {
            console.error('Error getting dex contract address:', error);
            throw error;
        }
    }
    async executeApprovalTransaction(tokenAddress, spenderAddress, amount, nonce) {
        var _a;
        if (!((_a = this.config.evm) === null || _a === void 0 ? void 0 : _a.wallet)) {
            throw new Error("EVM wallet required");
        }
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, this.config.evm.wallet);
        let retryCount = 0;
        while (retryCount < (this.networkConfig.maxRetries || 3)) {
            try {
                console.log("Sending approval transaction...");
                const feeData = await this.provider.getFeeData();
                const overrides = {
                    gasLimit: BigInt(100000), // Safe default for approvals
                    maxFeePerGas: feeData.maxFeePerGas * this.DEFAULT_GAS_MULTIPLIER / BigInt(100),
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * this.DEFAULT_GAS_MULTIPLIER / BigInt(100)
                };
                if (nonce !== undefined) {
                    overrides.nonce = nonce + retryCount;
                }
                const tx = await tokenContract.approve(spenderAddress, amount, overrides);
                console.log("Waiting for transaction confirmation...");
                return await tx.wait();
            }
            catch (error) {
                retryCount++;
                console.warn(`Approval attempt ${retryCount} failed, retrying in ${2000 * retryCount}ms...`);
                if (retryCount === this.networkConfig.maxRetries)
                    throw error;
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
            }
        }
        throw new Error('Max retries exceeded for approval transaction');
    }
}
exports.EVMApproveExecutor = EVMApproveExecutor;
