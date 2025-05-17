import React from "react";
import { Outlet } from "react-router-dom";
import {
  collection,
  gallery,
  home2,
  marketplace,
  right_arrow,
  history,
  plus,
  // payment,
  setting,
  transaction_history,
  selling_history,
  purchase_history,
  account_settings,
  help_center,
  lock,
  about,
} from "./assets";
import Dashboard from "./views/public/Dashboard";
import Login from "./views/public/Login";
import NftDetailsScreen from "./views/public/NftDetailScreen";
import HelpCenter from "./views/public/HelpCenter";
import PrivacySecurity from "./views/public/PrivacySecurity";
import VideoGallery from "./views/public/VideoGallery";
import AboutUs from "./views/public/AboutUs";
import Marketplace from "./views/public/Marketplace";
import Contact from "./views/public/Contact";
import ResetPasswordSuccess from "./views/public/ResetPasswordSuccess";
import ResetPassword from "./views/public/ResetPassword";
import Collections from "./views/private/Collections";
import SellsNft from "./views/private/Collections/sell";
import TransactionHistory from "./views/private/TransactionHistory";
import SellingHistory from "./views/private/SellingHistory";
import EditProfile from "./views/private/EditProfile";
import AccountSettings from "./views/private/AccountSettings";
import PurchaseHistory from "./views/private/PurchaseHistory";
import Payment from "./views/private/Payment";
import MintNft from "./views/private/MintNft";
import ListNft from "./views/private/ListNft";
import AssetsDetails from "./views/private/AssetsDetails";
import CreateEmote from "./views/private/CreateEmote";
import NotFound from "./views/public/NotFound";

const routes = [
  {
    name: "Not Found",
    layout: "public",
    path: "/404",
    icon: null,
    component: <NotFound />,
    visible: true,
    isNav: false,
    key: 404,
  },
  {
    name: "Home",
    layout: "public",
    path: "/",
    icon: home2,
    component: <Dashboard />,
    visible: true,
    isNav: true,
    key: 1,
  },
  {
    name: "My Collection",
    layout: "private",

    path: "/collections/:userId",
    icon: collection,

    component: <Collections />,
    visible: true,
    key: 10,
    isNav: true,
  },
  {
    name: "Emote-Video Gallery",
    layout: "public",
    path: "/video-gallery",
    icon: gallery,
    component: <VideoGallery />,
    visible: true,
    isNav: true,
    key: 6,
  },
  {
    name: "Marketplace",
    layout: "public",
    path: "/marketplace",
    icon: marketplace,
    component: <Marketplace />,
    visible: true,
    isNav: true,
    key: 8,
  },
  {
    name: "Mint NFT",
    layout: "private",
    path: "/mint-nft",
    icon: right_arrow,
    component: <MintNft />,
    visible: true,
    isNav: true,
    key: 17,
  },
  {
    name: "Transaction History",
    layout: "private",
    path: "/transaction-history",
    icon: transaction_history,
    belongsTo: "Transaction History",
    belongsToIcon: history,
    component: <TransactionHistory />,
    visible: true,
    isDisabled: false,
    isNav: true,
    key: 12,
  },
  {
    name: "Selling History",
    layout: "private",
    path: "/selling-history",
    belongsTo: "Transaction History",
    belongsToIcon: history,

    icon: selling_history,
    component: <SellingHistory />,
    visible: true,
    isNav: true,

    key: 13,
  },
  {
    name: "Purchase History",
    layout: "private",
    path: "/purchase-history",
    belongsTo: "Transaction History",
    belongsToIcon: history,
    icon: purchase_history,
    component: <PurchaseHistory />,
    visible: true,
    isNav: true,

    key: 80,
  },
  {
    name: "Create Emote",
    layout: "private",
    path: "/create-emote",
    icon: plus,
    component: <CreateEmote />,
    visible: true,
    key: 100,
    isNav: false,
    isDisabled: true,
  },
  {
    name: "Account Settings",
    layout: "private",
    path: "/account-settings",
    icon: account_settings,
    component: <Outlet />,
    visible: true,

    isNav: true,
    key: 14,
    belongsTo: "Settings",
    belongsToIcon: setting,
    nested: true,
    nestedRoutes: [
      {
        name: "Edit Profile",
        layout: "private",
        path: "edit-profile",
        icon: "",
        component: <EditProfile />,
        visible: true,
        key: 15,
      },
      {
        name: "Account Settings",
        layout: "private",
        path: "",
        index: true,
        icon: account_settings,
        component: <AccountSettings />,
        visible: true,
        key: 16,
      },
    ],
  },
  {
    name: "Help Center",
    layout: "public",
    belongsTo: "Settings",
    belongsToIcon: setting,

    path: "/help-center",
    icon: help_center,
    component: <HelpCenter />,
    visible: true,
    isNav: true,
    key: 4,
  },
  {
    name: "Privacy & Security",
    layout: "public",
    path: "/privacy-security",
    belongsTo: "Settings",
    belongsToIcon: setting,

    icon: lock,
    component: <PrivacySecurity />,
    visible: true,
    isNav: true,
    key: 5,
  },
  {
    name: "About Us",
    layout: "public",
    path: "/about-us",
    belongsTo: "Settings",
    belongsToIcon: setting,
    icon: about,
    component: <AboutUs />,
    visible: true,
    isNav: true,
    key: 7,
  },

  {
    name: "Login",
    layout: "public",
    path: "/login",
    icon: "",
    component: <Login />,
    visible: true,
    key: 2,
  },
  {
    name: "Nft Detail",
    layout: "public",
    path: "/nft-detail/:id",
    icon: "",
    component: <NftDetailsScreen />,
    visible: true,
    key: 3,
  },
  {
    name: "Contact",
    layout: "public",
    path: "/contact",
    icon: "",
    component: <Contact />,
    visible: true,
    key: 9,
  },
  {
    name: "Reset Password",
    layout: "public",
    path: "reset-password",
    icon: "",
    component: <Outlet />,
    visible: true,
    nested: true,
    nestedRoutes: [
      {
        name: "Password Success",
        layout: "public",
        path: "success",
        icon: "",
        component: <ResetPasswordSuccess />,
        visible: true,
      },
      {
        name: "Reset Password",
        layout: "public",
        path: "",
        index: true,
        icon: "",
        component: <ResetPassword />,
        visible: true,
      },
    ],
  },

  {
    name: "Sell",
    layout: "private",
    path: "/sell",
    icon: "",
    component: <SellsNft />,
    visible: true,
    key: 11,
  },

  {
    name: "Assets Details",
    layout: "private",
    path: "/assets-details",
    icon: "",
    component: <AssetsDetails />,
    visible: true,

    key: 18,
  },
  {
    name: "List NFT",
    layout: "private",
    path: "/list-nft/:hash",
    icon: "",
    component: <ListNft />,
    visible: true,
    key: 19,
  },

  {
    name: "Payment",
    layout: "private",
    path: "/payment",
    icon: "",
    component: <Payment />,
    visible: true,
    key: 20,
  },
];

export default routes;
