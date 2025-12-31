import { create as ipfsHttpClient } from "ipfs-http-client";
import { urlSource } from "ipfs-http-client";
import axios from "axios";
import { ToastMessage } from "../components";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { UPLOAD_META_TO_IPFS } from "../gql/mutations";
import { getCookieStorage } from "../utills/cookieStorage";

const env = process.env;

// uploading to storj
export const sendFileToStorj = async (file, isEmote, createSignedUrl) => {
  console.log("file", file);
  let finalFile;
  if (isEmote) {
    try {
      const response = await fetch(file);

      if (!response.ok) {
        ToastMessage(`HTTP error! Status: ${response.status}`, "", "error");
      }

      const blob = await response.blob();

      finalFile = new File([blob], "filename");
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  } else {
    finalFile = file;
  }

  if (finalFile) {
    try {
      // const url = `${env.REACT_APP_BACKEND_BASE_URL}/presign`;

      // Step 1: Get the pre-signed URL
      const { data } = await createSignedUrl({
        variables: { key: finalFile.name },
      });

      const presignUrl = data.CreateSignedUrlForNfts.url;

      // Step 2: Upload the file using the pre-signed URL
      const uploadResp = await axios.put(presignUrl, finalFile, {
        headers: {
          "Content-Type": finalFile.type,
        },
      });

      if (uploadResp.status == 200) {
        const videiLink = `${env.REACT_APP_STORJ_URL}/${file.name}`;
        return videiLink;
      } else {
        console.log("Storj Upload Error");
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const sendFileToIPFS = async (file, isEmote) => {
  if (file) {
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
      const result = await ipfs.add(isEmote ? urlSource(`${file}`) : file);

      // console.log("ImgHash", res)
      const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.cid._baseCache.get(
        "z",
      )}`;
      return ImgHash;
    } catch (error) {
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
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
      console.log(error);
    }
  }
};

export const sendMetaToIPFSPINATA = async (data) => {
  console.log("sendMetaToIPFSPINATA data: ");
  console.log(data);
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
      console.log("Error sending File to IPFS: ");
      console.log(error);
      throw error;
    }
  }
};
