import axios from "axios";
import { ToastMessage } from "../../components";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GET_DEEPMOTION_SESSION } from "../../gql/mutations";
import { getCookieStorage } from "../../utills/cookieStorage";

const env = process.env;

const apiURI = env.REACT_APP_DEEPMOTION_API_URL;

export const handleDeepMotionUpload = async (videofile, fileName) => {
  // Function to perform other API calls using the session cookie
  const checkCredit = async () => {
    try {
      const response = await axios.get(`${apiURI}/account/creditBalance`, {
        withCredentials: true, // Include cookies in the request
      });

      return response.data.credits;
    } catch (error) {
      console.log("Error in API call:", error);
    }
  };

  const uploadVideos = async (signedurl, videoFile) => {
    try {
      const res = await axios.put(signedurl, videoFile, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (res.status === 200) {
        const config = {
          url: signedurl,
          processor: "video2anim",
          params: [
            "config=configDefault",
            "trackFace=0",
            "trackHand=0",
            "footLockingMode=auto",
            "sim=0",
            "videoSpeedMultiplier=1.0",
            "poseFilteringStrength=0.0",
            "config=configDefault",
            "formats=bvh,fbx,mp4",
            "model=eUCcDzNPrir8zF1y4jSV6v",
          ],
        };

        const res = await axios.post(`${apiURI}/process`, config, {
          withCredentials: true, // Included cookies in the request
        });

        if (res.data.rid) {
          return res.data.rid;
        } else {
          console.log("Error in Conversion", res);
        }
      }
    } catch (error) {
      console.log("Video Model Upload Error", error);
    }
  };

  const checkProgress = async (rid) => {
    const uri = `${apiURI}/status/${rid}`;

    try {
      const response = await axios.get(uri, {
        withCredentials: true, // Included cookies in the request
      });

      if (response.data.status[0].status === "SUCCESS") {
        return true;
      } else if (
        response.data.status[0].status === "FAILURE" ||
        response.data.status[0].status === "RETRY"
      ) {
        return false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return await checkProgress(rid);
      }
    } catch (error) {
      console.log("Check Progress Error", error);
    }
  };

  const downloadVideo = async (rid) => {
    const uri = `${apiURI}/download/${rid}`;
    try {
      const response = await axios.get(uri, {
        withCredentials: true, // Included cookies in the request
      });

      if (response.data.links) {
        const bvh = response.data.links[0].urls[0].files[0].bvh;
        const mp4 = response.data.links[0].urls[0].files[1].mp4;
        const fbx = response.data.links[0].urls[0].files[2].fbx;
        const obj = {
          rid,
          mp4,
          bvh,
          fbx,
        };

        return obj;
      }
    } catch (error) {
      console.log("Download Error", error);
    }
  };

  const handleUpload = async (filename) => {
    const uploadUri = `${apiURI}/upload?name=${filename}&resumable=0`;
    try {
      const response = await axios.get(uploadUri, {
        withCredentials: true, // Include cookies in the request
      });

      const signedURI = response.data.url;

      const rid = await uploadVideos(signedURI, videofile);

      // const rid = "pg3hR5sLcyYraR2L2g94Kp";
      const progress = await checkProgress(rid);

      if (progress) {
        // alert("Conversion Successful");
        console.log(rid, "______rid");
        const data = await downloadVideo(rid);
        return data;
      } else {
        // ToastMessage("Conversion Error", "", "error");
        return false;
      }
    } catch (error) {
      console.log("Upload Error", error);
    }
  };

  // Example usage
  const main = async () => {
    try {
      // Perform the login and get the session cookie
      await getSession();
      // await getSessionFromFrontend();

      // Use the session cookie in other API calls
      const credit = await checkCredit();

      if (credit > 0) {
        const data = await handleUpload(fileName);
        return data;
      } else {
        console.log("No credit");
        ToastMessage("Error", "", "error");
      }
    } catch (error) {
      console.error("Main error:", error);
    }
  };

  // Call the main function
  return main();
};

export const getSession = async () => {
  try {
    const token = getCookieStorage("access_token");

    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Create Apollo client with auth
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

    // Call GraphQL mutation to get session from backend
    const { data: result } = await client.mutate({
      mutation: GET_DEEPMOTION_SESSION,
    });

    if (result?.getDeepMotionSession?.sessionCookie) {
      const sessionCookie = result.getDeepMotionSession.sessionCookie;
      console.log("DeepMotion session cookie:", sessionCookie);

      // Parse the session cookie and set it in the browser
      // The cookie comes in format: "name=value; Path=/; ..."
      // We need to extract the name=value part and set it
      const cookieParts = sessionCookie.split(";")[0]; // Get the "name=value" part

      // Set the cookie in the browser
      document.cookie = sessionCookie
        .split(";")
        .map((part) => part.trim())
        .join("; ");

      return true;
    } else {
      throw new Error("Failed to get DeepMotion session");
    }
  } catch (error) {
    console.error("Error in session API call:", error);
    throw error;
  }
};

export const getSessionFromFrontend = async () => {
  const uri = `${apiURI}/session/auth`;
  try {
    const clientId = env.REACT_APP_DEEPMOTION_CLIENT_ID;
    const clientSecret = env.REACT_APP_DEEPMOTION_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("DeepMotion credentials not configured in frontend");
    }

    // Use browser's built-in btoa() for base64 encoding instead of Buffer
    const base64Credentials = btoa(`${clientId}:${clientSecret}`);

    await axios.get(uri, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
      withCredentials: true, // Include cookies in the request
    });

    console.log("DeepMotion session established from frontend");
    console.log(document.cookie);
    return true;
  } catch (error) {
    console.error("Error in frontend session API call:", error);
    throw error;
  }
};

export const downloadVideo = async (rid) => {
  const uri = `${apiURI}/download/${rid}`;
  try {
    const response = await axios.get(uri, {
      withCredentials: true, // Included cookies in the request
    });

    if (response.data.links) {
      const bvh = response.data.links[0].urls[0].files[0].bvh;
      const mp4 = response.data.links[0].urls[0].files[1].mp4;
      const fbx = response.data.links[0].urls[0].files[2].fbx;
      const obj = {
        rid,
        mp4,
        bvh,
        fbx,
      };

      return obj;
    }
  } catch (error) {
    console.log("Download Error", error);
  }
};
