import axios from "axios";

const env = process.env;

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
