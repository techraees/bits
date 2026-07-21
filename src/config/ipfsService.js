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
const STORJ_PROGRESS = {
  preparing: 8,
  uploadStart: 12,
  uploadEnd: 85,
};
export const sendFileToStorj = async (
  file,
  isEmote,
  createSignedUrl,
  onProgress,
  signal,
) => {
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
  onProgress?.({
    stage: "preparing",
    percent: STORJ_PROGRESS.preparing,
  });
  const { data } = await createSignedUrl({
    variables: {
      key: finalFile.name,
    },
  });
  const presignUrl = data.CreateSignedUrlForNfts.url;
  onProgress?.({
    stage: "uploading",
    percent: STORJ_PROGRESS.uploadStart,
  });
  const uploadResp = await axios.put(presignUrl, finalFile, {
    headers: {
      "Content-Type": finalFile.type || "application/octet-stream",
    },
    signal,
    onUploadProgress: (event) => {
      if (signal?.aborted) return;
      if (!event.total) return;
      const uploadRange = STORJ_PROGRESS.uploadEnd - STORJ_PROGRESS.uploadStart;
      const percent =
        STORJ_PROGRESS.uploadStart +
        Math.round((event.loaded / event.total) * uploadRange);
      onProgress?.({
        stage: "uploading",
        percent,
      });
    },
  });
  if (uploadResp.status === 200) {
    onProgress?.({
      stage: "uploading",
      percent: STORJ_PROGRESS.uploadEnd,
    });
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
  const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.cid._baseCache.get("z")}`;
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
    const getResponse = await fetch(posterUrl, {
      method: "GET",
      mode: "cors",
    });
    if (!getResponse.ok) {
      return isIpfsGateway;
    }
    const contentType = getResponse.headers.get("content-type") || "";
    return contentType.includes("image") || isIpfsGateway;
  } catch (error) {
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
      const metaHash = `${env.REACT_APP_IPFS_PATH}/${result.path}`;
      return metaHash;
    } catch (error) {}
  }
};
export const sendMetaToIPFSPINATA = async (data) => {
  if (data) {
    try {
      const token = getCookieStorage("access_token");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      const httpLink = createHttpLink({
        uri: `${env.REACT_APP_BACKEND_BASE_URL}/graphql`,
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
      throw error;
    }
  }
};
