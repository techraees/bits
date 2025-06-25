import axios from "axios";
import { ToastMessage } from "../../components";
// import videofile from "../../assets/images/video.mp4";

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

  const uploadVideo = async (signedurl, videoFile) => {
    try {
      const res = await axios.put(signedurl, videoFile, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": videoFile.length,
        },
      });

      if (res.status == 200) {
        const config = {
          url: signedurl,
          processor: "video2anim",
          params: ["config=configDefault", "formats = bvh,fbx,mp4"],
        };

        const processRes = await axios.post(`${apiURI}/process`, config, {
          withCredentials: true,
        });

        if (processRes.data.rid) {
          return processRes.data.rid;
        } else {
          console.log("No rid");
        }
      } else {
        console.log("Video not uploaded");
      }
    } catch (error) {
      console.log("video Upload Error", error);
    }
  };

  const checkProgress = async (rid) => {
    const uri = `${apiURI}/status/${rid}`;

    try {
      const response = await axios.get(uri, {
        withCredentials: true, // Include cookies in the request
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
      console.log(error);
    }
  };

  const handleUpload = async (filename) => {
    const uploadUri = `${apiURI}/upload?name=${filename}&resumable=0`;
    try {
      const response = await axios.get(uploadUri, {
        withCredentials: true, // Include cookies in the request
      });

      const signedURI = response.data.url;

      const rid = await uploadVideo(signedURI, videofile);

      // const rid = "pg3hR5sLcyYraR2L2g94Kp";
      const progress = await checkProgress(rid);

      if (progress) {
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
  const uri = `${apiURI}/session/auth`;
  try {
    const clientId = env.REACT_APP_DEEPMOTION_CLIENT_ID;
    const clientSecret = env.REACT_APP_DEEPMOTION_CLIENT_SECRET;

    // Combine clientId and clientSecret, and base64 encode them
    const base64Credentials = Buffer.from(
      `${clientId}:${clientSecret}`,
    ).toString("base64");
    await axios.get(uri, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64Credentials}`,
      },
      withCredentials: true, // Include cookies in the request
    });

    return true;
  } catch (error) {
    console.error("Error in session API call:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
};

export const downloadVideo = async (rid) => {
  const uri = `${apiURI}/download/${rid}`;
  try {
    const response = await axios.get(uri, {
      withCredentials: true, // Included cookies in the request
    });

    if (response.data.links) {
      const bvh = response.data.links[0].urls[13].files[0].bvh;
      const fbx = response.data.links[0].urls[13].files[1].fbx;
      const mp4 = response.data.links[0].urls[13].files[2].mp4;
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
