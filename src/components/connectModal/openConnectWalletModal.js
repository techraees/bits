export const OPEN_CONNECT_WALLET_MODAL_EVENT = "bits:open-connect-wallet-modal";

export function openConnectWalletModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_CONNECT_WALLET_MODAL_EVENT));
  }
}
