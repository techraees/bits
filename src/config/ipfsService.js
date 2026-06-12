import { create as ipfsHttpClient } from "ipfs-http-client";
import { urlSource } from "ipfs-http-client";
import axios from "axios";
import { ToastMessage } from "../components";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { UPLOAD_META_TO_IPFS } from "../gql/mutations";
import { getCookieStorage } from "../utills/cookieStorage";
import { createThumbnailFile } from "../utills/generateVideoThumbnail";

const env = process.env;

// uploading to storj
export const sendFileToStorj = async (file, isEmote, createSignedUrl) => {
  let finalFile;

  if (isEmote) {
    const response = await fetch(file.file);

    if (!response.ok) {
      ToastMessage(`HTTP error! Status: ${response.status}`, "", "error");
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();
    finalFile = new File([blob], file.name);
  } else {
    finalFile = file;
  }

  if (!finalFile) {
    throw new Error("No file available for Storj upload");
  }

  const { data } = await createSignedUrl({
    variables: { key: finalFile.name },
  });

  const presignUrl = data.CreateSignedUrlForNfts.url;

  const uploadResp = await axios.put(presignUrl, finalFile, {
    headers: {
      "Content-Type": finalFile.type || "application/octet-stream",
    },
  });

  if (uploadResp.status === 200) {
    return `${env.REACT_APP_STORJ_URL}/${finalFile.name}`;
  }

  throw new Error(`Storj upload failed with status ${uploadResp.status}`);
};

export const sendFileToIPFS = async (file, isEmote) => {
  if (!file) {
    throw new Error("No file available for IPFS upload");
  }

  const authorization =
    "Basic " +
    btoa(env.REACT_APP_PROJECT_ID + ":" + env.REACT_APP_PROJECT_SECRET);
  const ipfs = ipfsHttpClient({
    url: env.REACT_APP_INFURA,
    headers: {
      authorization,
    },
  });
  const result = await ipfs.add(isEmote ? urlSource(`${file}`) : file);

  const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.cid._baseCache.get(
    "z",
  )}`;

  if (!ImgHash) {
    throw new Error("Failed to resolve IPFS hash for uploaded file");
  }

  return ImgHash;
};

export const uploadPosterToIPFS = async (thumbFile) => {
  if (!thumbFile) {
    throw new Error("Thumbnail file is required");
  }

  return sendFileToIPFS(thumbFile, false);
};

export const uploadPosterImage = async (
  videoSource,
  fileName,
  createSignedUrl,
) => {
  const thumbFile = await createThumbnailFile(videoSource, fileName);

  try {
    return await uploadPosterToIPFS(thumbFile);
  } catch (ipfsError) {
    console.error(
      "IPFS poster upload failed, falling back to Storj:",
      ipfsError,
    );
    return sendFileToStorj(thumbFile, false, createSignedUrl);
  }
};

export const validatePosterUrl = async (posterUrl) => {
  if (!posterUrl) {
    return false;
  }

  const isIpfsGateway =
    posterUrl.includes("/ipfs/") || posterUrl.startsWith("ipfs://");

  try {
    const headResponse = await fetch(posterUrl, {
      method: "HEAD",
      mode: "cors",
    });

    if (headResponse.ok) {
      const contentType = headResponse.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        return true;
      }
    }

    const getResponse = await fetch(posterUrl, { method: "GET", mode: "cors" });

    if (!getResponse.ok) {
      return isIpfsGateway;
    }

    const contentType = getResponse.headers.get("content-type") || "";
    return contentType.includes("image") || isIpfsGateway;
  } catch (error) {
    console.error("Poster URL validation failed:", error);
    return isIpfsGateway;
  }
};

export const sendMetaToIPFS = async (data) => {
  if (data) {
    try {
      const authorization =
        "Basic " +
        btoa(env.REACT_APP_PROJECT_ID + ":" + env.REACT_APP_PROJECT_SECRET);
      const ipfs = ipfsHttpClient({
        url: env.REACT_APP_INFURA,
        headers: {
          authorization,
        },
      });

      const finalData = JSON.stringify(data);
      const result = await ipfs.add(finalData);

      // console.log("ImgHash", res)
      const metaHash = `${env.REACT_APP_IPFS_PATH}/${result.path}`;
      return metaHash;
    } catch (error) {
      // console.log(error);
    }
  }
};

export const sendMetaToIPFSPINATA = async (data) => {
  // console.log("sendMetaToIPFSPINATA data: ");
  // console.log(data);
  if (data) {
    try {
      const token = getCookieStorage("access_token");

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Create Apollo client with auth
      const httpLink = createHttpLink({
        uri: `${env.REACT_APP_BACKEND_BASE_URL}/graphql`,
        // uri: `http://localhost:3001/graphql`,
      });

      const authLink = setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          },
        };
      });

      const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
      });

      // Call GraphQL mutation
      const { data: result } = await client.mutate({
        mutation: UPLOAD_META_TO_IPFS,
        variables: {
          data: data,
        },
      });

      if (result?.uploadMetaToIPFS?.metaHash) {
        return result.uploadMetaToIPFS.metaHash;
      } else {
        throw new Error("IPFS upload failed");
      }
    } catch (error) {
      // console.log("Error sending File to IPFS: ");
      // console.log(error);
      throw error;
    }
  }
};
