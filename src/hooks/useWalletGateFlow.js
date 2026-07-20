import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { mainnet, polygon } from "@reown/appkit/networks";
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { useDispatch, useSelector } from "react-redux";
import ActionTypes from "../store/contants/ActionTypes";
import ToastMessage from "../components/toastMessage/index.jsx";
import { switchWalletChain, WalletSwitchRejectedError } from "../utills/switchWalletChain";
import { getWalletChainId } from "../utills/walletChain";
const POLL_MS = 400;
const CONNECT_TIMEOUT_MS = 120000;
const SWITCH_TIMEOUT_MS = 60000;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const getTargetNetwork = targetChainId => Number(targetChainId) === 1 ? mainnet : polygon;
export function useWalletGateFlow() {
  const dispatch = useDispatch();
  const {
    open
  } = useAppKit();
  const {
    address,
    isConnected
  } = useAppKitAccount();
  const {
    chainId,
    switchNetwork
  } = useAppKitNetwork();
  const {
    walletProvider
  } = useAppKitProvider("eip155");
  const {
    userData
  } = useSelector(state => state.address.userData);
  const [pendingTargetChain, setPendingTargetChain] = useState(null);
  const isConnectedRef = useRef(isConnected);
  const walletProviderRef = useRef(walletProvider);
  const addressRef = useRef(address);
  const chainIdRef = useRef(chainId);
  useEffect(() => {
    isConnectedRef.current = isConnected;
    walletProviderRef.current = walletProvider;
    addressRef.current = address;
    chainIdRef.current = chainId;
  }, [isConnected, walletProvider, address, chainId]);
  const waitUntilConnected = useCallback(async () => {
    const started = Date.now();
    while (Date.now() - started < CONNECT_TIMEOUT_MS) {
      if (isConnectedRef.current && walletProviderRef.current) {
        return true;
      }
      await delay(POLL_MS);
    }
    return false;
  }, []);
  const readEffectiveChainId = useCallback(async () => {
    const liveChain = await getWalletChainId();
    if (liveChain != null) {
      return liveChain;
    }
    if (chainIdRef.current != null) {
      return Number(chainIdRef.current);
    }
    if (walletProviderRef.current) {
      try {
        const provider = new ethers.providers.Web3Provider(walletProviderRef.current);
        const {
          chainId: providerChainId
        } = await provider.getNetwork();
        return providerChainId;
      } catch {
        return null;
      }
    }
    return null;
  }, []);
  const waitForTargetChain = useCallback(async targetChainId => {
    const started = Date.now();
    while (Date.now() - started < SWITCH_TIMEOUT_MS) {
      const currentChain = await readEffectiveChainId();
      if (currentChain != null && Number(currentChain) === Number(targetChainId)) {
        return true;
      }
      await delay(POLL_MS);
    }
    return false;
  }, [readEffectiveChainId]);
  const syncWalletToRedux = useCallback(async targetChainId => {
    const provider = walletProviderRef.current;
    const walletAddress = addressRef.current;
    if (!provider || !walletAddress) {
      return false;
    }
    try {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const {
        chainId: providerChainId
      } = await web3Provider.getNetwork();
      if (userData?.address) {
        if (userData.address.toLowerCase() !== walletAddress.toLowerCase()) {
          ToastMessage("Error", "Please connect correct wallet", "error");
          return false;
        }
      }
      if (Number(providerChainId) !== Number(targetChainId)) {
        return false;
      }
      dispatch({
        type: ActionTypes.WEB3CONNECT,
        payload: {
          address: walletAddress,
          web3: web3Provider,
          chainId: providerChainId,
          signer
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }, [dispatch, userData]);
  const switchToChain = useCallback(async targetChainId => {
    const currentChain = await readEffectiveChainId();
    if (currentChain != null && Number(currentChain) === Number(targetChainId)) {
      return true;
    }
    try {
      switchNetwork(getTargetNetwork(targetChainId));
    } catch (error) {}
    const switchedViaAppKit = await waitForTargetChain(targetChainId);
    if (switchedViaAppKit) {
      return true;
    }
    try {
      await switchWalletChain(walletProviderRef.current, targetChainId);
      return waitForTargetChain(targetChainId);
    } catch (error) {
      if (error instanceof WalletSwitchRejectedError) {
        ToastMessage("Switch cancelled", "Network switch was declined in your wallet.", "info");
        return false;
      }
      ToastMessage("Error", "Could not switch network automatically. Please switch it manually in your wallet.", "error");
      return false;
    }
  }, [readEffectiveChainId, switchNetwork, waitForTargetChain]);
  const openAppKitConnect = useCallback(async () => {
    await open({
      view: "Connect"
    });
  }, [open]);
  const isTargetChainMismatched = useCallback(async targetChainId => {
    if (targetChainId == null) {
      return false;
    }
    const live = await readEffectiveChainId();
    return live != null && Number(live) !== Number(targetChainId);
  }, [readEffectiveChainId]);
  const ensureWalletOnChain = useCallback(async targetChainId => {
    if (!targetChainId) {
      return false;
    }
    if (!isConnectedRef.current || !walletProviderRef.current) {
      await openAppKitConnect();
      const connected = await waitUntilConnected();
      if (!connected) {
        return false;
      }
    }
    const switched = await switchToChain(targetChainId);
    if (!switched) {
      return false;
    }
    return syncWalletToRedux(targetChainId);
  }, [openAppKitConnect, waitUntilConnected, switchToChain, syncWalletToRedux]);
  return {
    openAppKitConnect,
    ensureWalletOnChain,
    readEffectiveChainId,
    isTargetChainMismatched,
    pendingTargetChain,
    setPendingTargetChain,
    isConnected,
    walletProvider,
    chainId
  };
}
