export async function getWalletChainId() {
  if (typeof window === "undefined" || !window.ethereum?.request) {
    return null;
  }
  try {
    const hex = await window.ethereum.request({
      method: "eth_chainId",
    });
    return parseInt(hex, 16);
  } catch {
    return null;
  }
}
export function resolveWalletProvider(appKitProvider) {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return appKitProvider;
}
export function isWalletActive(appKitConnected) {
  if (appKitConnected) {
    return true;
  }
  return Boolean(
    typeof window !== "undefined" && window.ethereum?.selectedAddress,
  );
}
export function subscribeWalletChain(onChange) {
  if (typeof window === "undefined" || !window.ethereum?.on) {
    return () => {};
  }
  const handleChainChanged = (chainIdHex) => {
    onChange(parseInt(chainIdHex, 16));
  };
  window.ethereum.on("chainChanged", handleChainChanged);
  return () => {
    window.ethereum.removeListener("chainChanged", handleChainChanged);
  };
}
