import { ethers } from "ethers";
import ActionTypes from "../contants/ActionTypes";
import ethMarketContractAbi from "../../abis/ethMarketContractAbi.json";
import ethMintingContractAbi from "../../abis/ethMintingContractAbi.json";
import polygonMarketContractAbi from "../../abis/polygonMarketContractAbi.json";
import polygonMintingContractAbi from "../../abis/polygonMintingContractAbi.json";
import { numToHex } from "../../utills/numberToHex";
import { WeiToETH } from "../../utills/convertWeiAndBnb";
import { ToastMessage } from "../../components";
import UniversalProvider from "@walletconnect/universal-provider";
import { Web3Modal } from "@web3modal/standalone";

export const loadBlockchainAction =
  (chain, address, connectedAccount, provider) => async (dispatch) => {
    try {
      if (
        address?.toLowerCase() === connectedAccount?.toLowerCase() ||
        address === undefined
      ) {
        const signer = await provider.getSigner();
        const { chainId } = await provider.getNetwork();

        if (chain === chainId) {
          const web3 = provider;
          const data = {
            connectedAccount,
            web3,
            chainId,
            signer,
          };
          dispatch({ type: ActionTypes.WEB3CONNECT, payload: data });
        } else {
          ToastMessage("Error", "Please connect correct chain", "error");
        }
      } else {
        ToastMessage("Error", "Please connect correct wallet", "error");
      }
    } catch (err) {
      console.log("errr", err);
    }
  };

export const logoutWallet = () => async (dispatch) => {
  try {
    let account = null;
    account = null;
    let web3 = null;
    let chainId = null;
    const data = {
      web3,
      account,
      chainId,
    };

    dispatch({ type: ActionTypes.WEB3DISCONNECT, payload: data });
  } catch (err) {
    console.log("errr", err);
  }
};

export const updateAccount = (account) => async (dispatch) => {
  try {
    const data = {
      account,
    };
    dispatch({ type: ActionTypes.WEB3CONNECT, payload: data });
  } catch (err) {
    console.error("Failed to update account", err);
    throw err;
  }
};

export const loadContractIns = () => async (dispatch) => {
  const ethInfuraIns =
    "https://mainnet.infura.io/v3/e556d22112e34e3baab9760f1864493a";
  const polygonInfuraIns =
    "https://polygon-mainnet.infura.io/v3/e556d22112e34e3baab9760f1864493a";
  try {
    //ethereum
    const ethProvider = new ethers.providers.JsonRpcProvider(ethInfuraIns);
    const ethMarketPlaceContract = "0x3E12F9b507F51DccDc448B38d67eBfE2194b6e72";
    const ethMintingConract = "0x00Ee6dA7De5635cA6c2742682168621351e6b5B1";
    const ethMarketContractIns = new ethers.Contract(
      ethMarketPlaceContract,
      ethMarketContractAbi,
      ethProvider
    );

    const ethMintingContractIns = new ethers.Contract(
      ethMintingConract,
      ethMintingContractAbi,
      ethProvider
    );

    //polygon
    const polygonProvider = new ethers.providers.JsonRpcProvider(
      polygonInfuraIns
    );
    const polygonMarketPlaceContract =
      "0x381c730F1646f00e4Ae9Dfe9589b1E0BDE107a1e";
    const polygonMintingConract = "0x00Ee6dA7De5635cA6c2742682168621351e6b5B1";
    const polygonMarketContractIns = new ethers.Contract(
      polygonMarketPlaceContract,
      polygonMarketContractAbi,
      polygonProvider
    );
    const polygonMintingContractIns = new ethers.Contract(
      polygonMintingConract,
      polygonMintingContractAbi,
      polygonProvider
    );

    // const imguri = extractNFTImage(ethMintingContract, 0)
    // console.log(imguri);
    // const auctions = await contract.methods.auctions(0).call();

    dispatch({
      type: ActionTypes.LOAD_CONTRACT,
      payload: {
        ethMarketContractIns,
        ethMintingContractIns,
        polygonMarketContractIns,
        polygonMintingContractIns,
      },
    });
    dispatch({
      type: "MATIC_CHAIN",
      contractData: {
        marketContract: polygonMarketContractIns,
        mintContract: polygonMintingContractIns,
        chain: 137,
      },
    });

    getEmoteItems(ethMarketContractIns, polygonMarketContractIns).then(
      (result) => {
        const { maticList, ethList } = result;

        dispatch({
          type: "LOAD_FIXED_ITEMS",
          payload: { maticList, ethList },
        });
        dispatch({
          type: "MATIC_CHAIN_FIXED",
          fixedItemData: maticList,
        });
      }
    );

    getAuctions(ethMarketContractIns, polygonMarketContractIns).then(
      (result) => {
        const { maticAuctionsList } = result;
        dispatch({
          type: "MATIC_CHAIN_AUCTION",
          auctionItemData: maticAuctionsList,
        });
      }
    );
  } catch (err) {
    console.log("errr", err);
  }
};

// getting fixed prices
const getEmoteItems = async (
  ethMarketContractIns,
  polygonMarketContractIns
) => {
  const maticcombined = {};
  const ethcombined = {};

  const maticArray = Number(await polygonMarketContractIns.getAllFixedPrices());
  let tokenID = "tokenid";

  //polygon
  for (let i = 0; i < maticArray; i++) {
    const obj = await polygonMarketContractIns.Fixedprices(i);
    const id = Number(obj[tokenID]);

    if (obj.isSold == false) {
      if (maticcombined[id]) {
        maticcombined[id].owners.push({
          owner: obj.owner,
          copies: Number(obj.copiesForSale),
          newOwner: obj.newowner,
          price: WeiToETH(obj.price),
          fixedid: Number(obj.fixedid),
        });
      } else {
        maticcombined[id] = {
          tokenid: id,
          isSold: obj.isSold,
          owners: [
            {
              owner: obj.owner,
              copies: Number(obj.copiesForSale),
              newOwner: obj.newowner,
              price: WeiToETH(obj.price),
              fixedid: Number(obj.fixedid),
            },
          ],
        };
      }
    }
  }

  const maticList = Object.values(maticcombined);

  //ethereum

  const ethArray = Number(await polygonMarketContractIns.getAllFixedPrices());

  for (let i = 0; i < ethArray; i++) {
    const ethobj = await polygonMarketContractIns.Fixedprices(i);
    const ethid = Number(ethobj[tokenID]);

    if (ethcombined[ethid]) {
      ethcombined[ethid].owners.push({
        owner: ethobj.owner,
        copies: Number(ethobj.copiesForSale),
        newOwner: ethobj.newowner,
        price: WeiToETH(ethobj.price),
        fixedid: Number(ethobj.fixedid),
      });
    } else {
      ethcombined[ethid] = {
        tokenid: ethid,
        isSold: ethobj.isSold,
        owners: [
          {
            owner: ethobj.owner,
            copies: Number(ethobj.copiesForSale),
            newOwner: ethobj.newowner,
            price: WeiToETH(ethobj.price),
            fixedid: Number(ethobj.fixedid),
          },
        ],
      };
    }
  }

  const ethList = Object.values(ethcombined);

  return { maticList, ethList };
};

//getting auctions
const getAuctions = async (ethMarketContractIns, polygonMarketContractIns) => {
  const maticAuctionsList = [];
  const maticArray = Number(await polygonMarketContractIns.getAllAuctions());

  for (let i = 0; i < maticArray; i++) {
    const obj = await polygonMarketContractIns.auctions(i);
    maticAuctionsList.push(obj);
  }

  const ethAuctionsList = [];
  const ethArray = Number(await polygonMarketContractIns.getAllAuctions());

  for (let i = 0; i < ethArray; i++) {
    const obj = await polygonMarketContractIns.auctions(i);
    ethAuctionsList.push(obj);
  }

  return { maticAuctionsList, ethAuctionsList };
};
