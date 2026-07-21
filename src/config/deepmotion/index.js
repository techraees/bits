import axios from "axios";
import { ToastMessage } from "../../components";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  CHECK_DEEPMOTION_CREDIT,
  CHECK_DEEPMOTION_STATUS,
  GET_DEEPMOTION_DOWNLOAD_LINKS,
} from "../../gql/mutations";
import { getCookieStorage } from "../../utills/cookieStorage";
const env = process.env;
const backendUrl = env.REACT_APP_BACKEND_BASE_URL;
const createApolloClient = () => {
  const token = getCookieStorage("access_token");
  const httpLink = createHttpLink({
    uri: `${backendUrl}/graphql`,
  });
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};
const checkCredit = async () => {
  try {
    const client = createApolloClient();
    const { data } = await client.mutate({
      mutation: CHECK_DEEPMOTION_CREDIT,
    });
    return data?.checkDeepMotionCredit?.credits || 0;
  } catch (error) {
    throw error;
  }
};
const uploadVideoToBackend = async (videoFile, fileName) => {
  try {
    const token = getCookieStorage("access_token");
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }
    const formData = new FormData();
    formData.append("video", videoFile, fileName);
    const response = await axios.post(
      `${backendUrl}/deepmotion/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );
    if (response.data.success) {
      return {
        rid: response.data.rid,
        credits: response.data.credits,
      };
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    throw error;
  }
};
const checkProgress = async (rid) => {
  try {
    const client = createApolloClient();
    const { data } = await client.mutate({
      mutation: CHECK_DEEPMOTION_STATUS,
      variables: {
        rid,
      },
    });
    const status = data?.checkDeepMotionStatus;
    if (status?.isComplete) {
      return {
        complete: true,
        failed: false,
        progress: 100,
      };
    } else if (status?.isFailed) {
      return {
        complete: false,
        failed: true,
        progress: 0,
      };
    } else {
      return {
        complete: false,
        failed: false,
        status: status?.status,
        progress: status?.progress || 0,
        step: status?.step || 0,
        total: status?.total || 0,
        positionInQueue: status?.positionInQueue || 0,
      };
    }
  } catch (error) {
    throw error;
  }
};
const waitForCompletion = async (rid, onProgress = null) => {
  const pollInterval = 10000;
  const maxAttempts = 180;
  let attempts = 0;
  while (attempts < maxAttempts) {
    const result = await checkProgress(rid);
    if (result.complete) {
      if (onProgress) {
        onProgress({
          progress: 100,
          status: "SUCCESS",
          step: result.total,
          total: result.total,
        });
      }
      return true;
    } else if (result.failed) {
      return false;
    }
    if (onProgress) {
      onProgress({
        progress: result.progress,
        status: result.status,
        step: result.step,
        total: result.total,
        positionInQueue: result.positionInQueue,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    attempts++;
  }
  throw new Error("Processing timed out");
};
const getDownloadLinks = async (rid) => {
  try {
    const client = createApolloClient();
    const { data } = await client.mutate({
      mutation: GET_DEEPMOTION_DOWNLOAD_LINKS,
      variables: {
        rid,
      },
    });
    const links = data?.getDeepMotionDownloadLinks;
    if (links) {
      return {
        rid: links.rid,
        bvh: links.bvh,
        mp4: links.mp4,
        fbx: links.fbx,
      };
    } else {
      throw new Error("No download links available");
    }
  } catch (error) {
    throw error;
  }
};
export const handleDeepMotionUpload = async (
  videoFile,
  fileName,
  onProgress = null,
) => {
  const main = async () => {
    try {
      if (onProgress) {
        onProgress({
          progress: 0,
          status: "CHECKING_CREDITS",
          step: 0,
          total: 0,
        });
      }
      const credit = await checkCredit();
      if (credit <= 0) {
        ToastMessage("Insufficient DeepMotion credits", "", "error");
        return false;
      }
      if (onProgress) {
        onProgress({
          progress: 0,
          status: "UPLOADING",
          step: 0,
          total: 0,
        });
      }
      const uploadResult = await uploadVideoToBackend(videoFile, fileName);
      const rid = uploadResult.rid;
      const success = await waitForCompletion(rid, onProgress);
      if (success) {
        if (onProgress) {
          onProgress({
            progress: 100,
            status: "DOWNLOADING",
            step: 0,
            total: 0,
          });
        }
        const data = await getDownloadLinks(rid);
        return data;
      } else {
        ToastMessage("Video processing failed", "", "error");
        return false;
      }
    } catch (error) {
      ToastMessage(error.message || "Error processing video", "", "error");
      return false;
    }
  };
  return main();
};
export const checkDeepMotionCredit = checkCredit;
export const uploadDeepMotionVideo = uploadVideoToBackend;
export const checkDeepMotionProgress = checkProgress;
export const waitForDeepMotionCompletion = waitForCompletion;
export const getDeepMotionDownloadLinks = getDownloadLinks;
export const getSession = async () => {
  return true;
};
export const getSessionFromFrontend = async () => {
  return true;
};
export const downloadVideo = async (rid) => {
  return await getDownloadLinks(rid);
};
