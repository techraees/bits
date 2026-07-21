import { useLazyQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useDispatch, useSelector } from "react-redux";
import { GET_PROFILE } from "../../gql/queries";
import { profileToUserData } from "../../utills/hydrateUserProfile";
import { getCookieStorage } from "../../utills/cookieStorage";
import ConnectModal from "./index";
import { OPEN_CONNECT_WALLET_MODAL_EVENT } from "./openConnectWalletModal";

const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

const WalletConnectGate = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { contractData } = useSelector((state) => state.chain.contractData);
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [token, setToken] = useState(() => getCookieStorage("access_token"));

  const [fetchProfile, { data: profileData }] = useLazyQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
  });

  const isAuthPage = AUTH_PATHS.some((path) =>
    location.pathname.startsWith(path),
  );
  const isLoggedIn = Boolean(token);

  const needsWallet = useMemo(() => {
    if (!isLoggedIn) return false;
    if (!isConnected) return true;
    if (
      chainId != null &&
      contractData?.chain != null &&
      Number(chainId) !== Number(contractData.chain)
    ) {
      return true;
    }
    return false;
  }, [isLoggedIn, isConnected, chainId, contractData?.chain]);

  useEffect(() => {
    const syncToken = () => {
      const nextToken = getCookieStorage("access_token");
      setToken(nextToken || null);
      if (nextToken) {
        setDismissed(false);
        fetchProfile({});
      }
    };

    syncToken();
    window.addEventListener("storageChange", syncToken);
    return () => window.removeEventListener("storageChange", syncToken);
  }, [fetchProfile]);

  useEffect(() => {
    if (token) {
      fetchProfile({});
    }
  }, [token, fetchProfile]);

  useEffect(() => {
    if (profileData?.GetProfile) {
      dispatch({
        type: "NFT_ADDRESS",
        userData: profileToUserData(profileData.GetProfile),
      });
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    const openFromHeader = () => {
      setDismissed(false);
      setVisible(true);
    };

    window.addEventListener(OPEN_CONNECT_WALLET_MODAL_EVENT, openFromHeader);
    return () =>
      window.removeEventListener(OPEN_CONNECT_WALLET_MODAL_EVENT, openFromHeader);
  }, []);

  useEffect(() => {
    if (!needsWallet) {
      setVisible(false);
      if (!isConnected) return;
      setDismissed(false);
      return;
    }

    if (!isAuthPage && !dismissed) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [needsWallet, isAuthPage, dismissed, isConnected]);

  return (
    <ConnectModal
      visible={visible}
      onClose={() => {
        setVisible(false);
        setDismissed(true);
      }}
    />
  );
};

export default WalletConnectGate;
