import { create as ipfsHttpClient } from "ipfs-http-client";
import { urlSource } from "ipfs-http-client";
import axios from "axios";

const env = process.env;

// uploading to storj
export const sendFileToStorj = async (file, isEmote, createSignedUrl) => {
  console.log("file", file);
  let finalFile;
  if (isEmote) {
    try {
      const response = await fetch(file);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
        "z"
      )}`;
      return ImgHash;
    } catch (error) {
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
  }
};

//ipfsHttpClient alternative axios
export const sendFileToIPFSV1 = async (file, isEmote) => {
  if (file) {
    try {
      console.log({ isEmote });
      const formData = new FormData();
      formData.append("file", file);

      const authorization =
        "Basic " +
        btoa(env.REACT_APP_PROJECT_ID + ":" + env.REACT_APP_PROJECT_SECRET);
      let options = {
        headers: {
          Authorization: authorization,
          "Content-Type": "multipart/form-data",
        },
      };

      const result = await axios.post(
        `${env.REACT_APP_INFURA}/add`,
        formData,
        options
      );

      const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.cid._baseCache.get(
        "z"
      )}`;
      return ImgHash;
    } catch (error) {
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
  }
};

//ipfsHttpClient alternative nft.storage
export const sendFileToIPFSV2 = async (file, isEmote) => {
  let finalFile;
  if (isEmote) {
    try {
      const response = await fetch(file);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
      const authorization = "Bearer " + env.REACT_APP_NFTSTORAGE;
      let options = {
        headers: {
          Authorization: authorization,
          "Content-Type": "image/*",
        },
      };

      const result = await axios.post(
        "https://api.nft.storage/upload",
        finalFile,
        options
      );

      // console.log("ImgHash", res)
      const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.data.value.cid}`;

      return ImgHash;
    } catch (error) {
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
  }
};

// Infura
export const sendFileToIPFSV3 = async (file, isEmote) => {
  let finalFile;
  if (isEmote) {
    try {
      const response = await fetch(file);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();

      finalFile = new File([blob], "filename");
    } catch (error) {
      console.error("Error fetching file:", error);
      return; // Exit early if there's an error fetching the file
    }
  } else {
    finalFile = file;
  }

  if (finalFile) {
    try {
      const authorization =
        "Basic " +
        btoa(`${env.REACT_APP_PROJECT_ID}:${env.REACT_APP_PROJECT_SECRET}`);

      // // Creating a FormData object and appending the file
      // const formData = new FormData();
      // formData.append("file", finalFile);

      // const options = {
      //   headers: {
      //     Authorization: authorization,
      //     // 'Content-Type': 'multipart/form-data' // Let axios set this automatically
      //   },
      // };

      // const result = await axios.post(env.REACT_APP_INFURA, formData, options);

      const ipfs = ipfsHttpClient({
        url: env.REACT_APP_INFURA,
        headers: {
          authorization,
        },
      });
      const result = await ipfs.add(finalFile);
      const ImgHash = `${env.REACT_APP_IPFS_PATH}/${result.path}`;
      return ImgHash;
    } catch (error) {
      console.error(
        "Error sending File to IPFS: ",
        error.response ? error.response.data : error.message
      );
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
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
  }
};

// export const sendFileToIPFS = async (fileImg) => {

//     if (fileImg) {
//         try {

//             const formData = new FormData();
//             formData.append("file", fileImg);

//             const resFile = await axios({
//                 method: "post",
//                 url: `${env.BACKEND_REST_URL}/save-file`,
//                 data: formData,
//                 headers: {
//                     "Content-Type": "multipart/form-data"
//                 },
//             });

//             const ImgHash = resFile.data.ImgHash

//          return ImgHash;
// //Take a look at your Pinata Pinned section, you will see a new file added to you list.

//         } catch (error) {
//             console.log("Error sending File to IPFS: ")
//             console.log(error)
//         }
//     }
// }
