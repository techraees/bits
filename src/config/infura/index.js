import axios from "axios";

const env = process.env;

const auth =
  "Basic " +
  btoa(env.REACT_APP_INFURA_API_KEY + ":" + env.REACT_APP_INFURA_SECRET);

export const getAllNftsByAddress = async (address, networkId, contract) => {
  const infura_url = `https://nft.api.infura.io/networks/${networkId}/`;

  const request_url = infura_url + "accounts/" + address + "/assets/nfts/";

  const request = new Request(request_url);
  const response = await fetch(request, {
    headers: {
      authorization: auth,
    },
  });

  const accountDetails = (await response.json()).assets;

  let tokenIds = [];

  accountDetails.map((item) => {
    if (item.contract == contract.toLowerCase()) {
      tokenIds.push(item.tokenId);
    }
  });

  return tokenIds;
};

// alchemy
export const getAllNftsByAddressAlchemy = async (
  address,
  networkId,
  contract,
) => {
  const network = networkId == 137 ? "polygon-mainnet" : "eth-mainnet";
  const baseUrl = `https://${network}.g.alchemy.com/nft/v3/${env.REACT_APP_ALCHEMY_API_KEY}/getNFTsForOwner`;
  const params = {
    owner: address,
    "contractAddresses[]": contract,
    withMetadata: "false",
    pageSize: "100",
  };

  // Manually construct the query string
  // const queryString = new URLSearchParams(params).toString();
  // const finalUrl = `${baseUrl}?${queryString}`;

  const options = {
    method: "GET",
    url: baseUrl,
    params: params,
    headers: { accept: "application/json" },
  };

  try {
    const response = await axios.request(options);
    const nfts = response.data.ownedNfts;

    let tokenIds = [];

    nfts.map((item) => {
      if (item.tokenId) {
        tokenIds.push(item.tokenId);
      }
    });

    return tokenIds;
  } catch (error) {
    console.error("NFT error", error);
  }
};

export const getOwnersOfTokenId = async (tokenId, networkId, contract) => {
  const infura_url = `https://nft.api.infura.io/networks/${networkId}/`;

  const request_url =
    infura_url + "nfts/" + contract + "/" + tokenId + "/owners/";

  const request = new Request(request_url);
  await fetch(request, {
    headers: {
      authorization: auth,
    },
  });
};
