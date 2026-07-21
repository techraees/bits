import { getWalletChainId, resolveWalletProvider } from "./walletChain";
const CHAIN_CONFIG = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
    ],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  137: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: [
      `https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
    ],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
};
const getErrorCode = (error) =>
  error?.code ?? error?.data?.originalError?.code ?? error?.error?.code;
export class WalletSwitchRejectedError extends Error {
  constructor(message = "User rejected the network switch.") {
    super(message);
    this.name = "WalletSwitchRejectedError";
    this.code = 4001;
  }
}
export async function switchWalletChain(walletProvider, targetChainId) {
  const provider = resolveWalletProvider(walletProvider);
  if (!provider?.request) {
    throw new Error("Wallet provider not available.");
  }
  const chainConfig = CHAIN_CONFIG[targetChainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${targetChainId}`);
  }
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chainConfig.chainId,
        },
      ],
    });
  } catch (error) {
    if (getErrorCode(error) === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [chainConfig],
      });
      return;
    }
    if (getErrorCode(error) === 4001) {
      throw new WalletSwitchRejectedError();
    }
    throw error;
  }
}
export { getWalletChainId, resolveWalletProvider };
