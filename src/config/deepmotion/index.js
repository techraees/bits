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

  const uploadVideos = async (signedurl, videoFile) => {
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
          params: [
            "model=video2anim", // Add model as a param string
            // "config=configDefault",
            "formats=bvh,fbx,mp4",
          ],
        };

        // const config = {
        //   url: signedurl,
        //   model: "video2anim",
        //   params: [
        //     "config=configDefault",
        //     "formats=bvh,fbx,mp4"
        //   ],
        // };

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

  const uploadModelFromBrowser = async (modelFile) => {
    try {
      const fileExtension = modelFile.name.split(".").pop(); // fbx, glb, etc.

      // Step 1: Get upload URL
      const uploadUrlResponse = await axios.get(
        `${apiURI}/character/getModelUploadUrl`,
        {
          params: {
            name: modelFile.name.replace(`.${fileExtension}`, ""),
            modelExt: fileExtension,
            resumable: 1,
          },

          withCredentials: true,
        },
      );

      const modelUrl = uploadUrlResponse.data.modelUrl;

      // Step 2: Resumable upload
      const initiateResponse = await axios.post(modelUrl, null, {
        headers: {
          "x-goog-resumable": "start",
        },
      });

      const resumableUrl = initiateResponse.headers["location"];

      await axios.put(resumableUrl, modelFile, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      console.log("Model uploaded");

      // Step 3: Store model
      const storeResponse = await axios.post(
        `${apiURI}/character/storeModel`,
        {
          modelUrl: modelUrl,
          modelName: modelFile.name,
          createThumb: 1,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const modelId = storeResponse.data.modelId;
      console.log("✅ Model ID:", modelId);

      return modelId;
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return null;
    }
  };

  // Usage in React component:
  const handleModelUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const modelId = await uploadModelFromBrowser(file);
      // Save modelId to state or localStorage for future use
      localStorage.setItem("defaultModelId", modelId);
    }
  };

  const uploadVideo = async (signedurl, videoFile) => {
    // await uploadModelFromBrowser(videoFile)
    // return
    try {
      // Fetch available models from your account
      try {
        const modelsResponse = await axios.get(
          `${apiURI}/character/listModels`,
          {
            params: {
              stockModel: true, // This returns stock models
            },
            withCredentials: true,
            //   params: [
            //   "config=configDefault",
            //   "formats=bvh,fbx,mp4",
            //   // To use a custom model, add: "model=YOUR_MODEL_ID_HERE"
            // ],
          },
          {
            withCredentials: true,
          },
        );
        console.log("Available models:", modelsResponse.data);

        const processedVideoResponse = await axios.get(
          `${apiURI}/list/SUCCESS`,
          {
            withCredentials: true,
          },
        );

        console.log("processed video response:", processedVideoResponse.data);

        // Log model IDs for easy reference
        if (modelsResponse.data && modelsResponse.data.length > 0) {
          console.log("Model IDs:");
          modelsResponse.data.forEach((model) => {
            console.log(`- ${model.name}: ${model.Id}`);
          });
        }
      } catch (modelError) {
        console.log("Could not fetch models:", modelError.message);
      }

      const res = await axios.put(signedurl, videoFile, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": videoFile.length,
        },
      });

      if (res.status == 200) {
        // Option 1: Process without a custom model (uses DeepMotion default character)
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
            // To use a custom model, add: "model=YOUR_MODEL_ID_HERE"h2JvXxjGybDFq4pBFd2A9F
            //{"modelId":"h2JvXxjGybDFq4pBFd2A9F","faceDataType":0,"handDataType":1}
            //{"modelId":"3ThAMpuy26bc8iBNqsjUmW","faceDataType":0,"handDataType":1}
            //{"modelId":"eUCcDzNPrir8zF1y4jSV6v","faceDataType":0,"handDataType":1}
          ],
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

  const uploadVideoss = async (signedurl, videoFile) => {
    try {
      try {
        const modelsResponse = await axios.get(
          `${apiURI}/character/listModels`,
          {
            withCredentials: true,
          },
        );
        console.log("Available models:", modelsResponse.data);

        const processedVideoResponse = await axios.get(
          `${apiURI}/list/SUCCESS`,
          {
            withCredentials: true,
          },
        );

        console.log("processed video response:", processedVideoResponse.data);

        // Log model IDs for easy reference
        if (modelsResponse.data && modelsResponse.data.length > 0) {
          console.log("Model IDs:");
          modelsResponse.data.forEach((model) => {
            console.log(`- ${model.name}: ${model.Id}`);
          });
        }
      } catch (modelError) {
        console.log("Could not fetch models:", modelError.message);
      }

      const res = await axios.put(signedurl, videoFile, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": videoFile.length,
        },
      });

      if (res.status == 200) {
        const config = {
          url: signedurl,
          processor: "standard",
          params: [
            "modelId=standard", // Add model as a param string
            "config=configDefault",
            "formats=bvh,fbx,mp4,mov",
          ],
        };

        // const config = {
        //   url: signedurl,
        //   model: "video2anim",
        //   params: [
        //     "config=configDefault",
        //     "formats=bvh,fbx,mp4"
        //   ],
        // };

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

  const uploadVideosss = async (signedurl, videoFile) => {
    try {
      try {
        const response = await axios.get(`${apiURI}/character/listModels`, {
          params: {
            stockModel: true, // This returns stock models
          },
          withCredentials: true,
        });
        console.log("Available models:", response.data);
      } catch (error) {}
      const uploadRes = await axios.put(signedurl, videoFile, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": videoFile.length,
        },
      });

      if (uploadRes.status === 200) {
        // Step 2: Process the video
        const config = {
          url: signedurl, // Use the ORIGINAL signed URL, not the resumable URL
          processor: "video2anim",
          params: [
            "formats=bvh,fbx,mp4",
            // Optional parameters you can add:
            // "model=<modelId>", // Only if you have a custom model ID
            // "config=configDefault",
            // "trackFace=0",
            // "trackHand=0",
            // "footLockingMode=auto",
            // "sim=0",
            // "videoSpeedMultiplier=1.0",
            // "poseFilteringStrength=0.0",
          ],
        };

        const processRes = await axios.post(`${apiURI}/process`, config, {
          withCredentials: true,
        });

        if (processRes.data.rid) {
          return processRes.data.rid;
        } else {
          console.log("No rid returned from process API");
          return null;
        }
      } else {
        console.log("Video not uploaded successfully");
        return null;
      }
    } catch (error) {
      console.log("Video Upload Error:", error.response?.data || error.message);
      return null;
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

    // Use browser's built-in btoa() for base64 encoding instead of Buffer
    const base64Credentials = btoa(`${clientId}:${clientSecret}`);

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
