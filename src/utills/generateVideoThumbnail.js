const DEFAULT_FPS = 30;
const THIRD_FRAME_INDEX = 2;
const getThirdFrameTime = duration => {
  const thirdFrameTime = THIRD_FRAME_INDEX / DEFAULT_FPS;
  if (!duration || Number.isNaN(duration)) {
    return thirdFrameTime;
  }
  if (duration <= thirdFrameTime) {
    return Math.max(0, duration / 2);
  }
  return Math.min(thirdFrameTime, duration - 0.01);
};
const seekToTime = (video, time) => new Promise((resolve, reject) => {
  const onSeeked = () => {
    video.removeEventListener("seeked", onSeeked);
    video.removeEventListener("error", onError);
    resolve();
  };
  const onError = () => {
    video.removeEventListener("seeked", onSeeked);
    video.removeEventListener("error", onError);
    reject(new Error("Failed to seek video for thumbnail"));
  };
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("error", onError);
  video.currentTime = time;
});
export const generateVideoThumbnail = videoSource => new Promise((resolve, reject) => {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  let objectUrl;
  const cleanup = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  };
  video.onloadeddata = async () => {
    try {
      const thirdFrameTime = getThirdFrameTime(video.duration);
      await seekToTime(video, thirdFrameTime);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        cleanup();
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create thumbnail blob"));
        }
      }, "image/jpeg", 0.85);
    } catch (error) {
      cleanup();
      reject(error);
    }
  };
  video.onerror = () => {
    cleanup();
    reject(new Error("Failed to load video for thumbnail"));
  };
  if (videoSource instanceof Blob) {
    objectUrl = URL.createObjectURL(videoSource);
    video.src = objectUrl;
  } else if (videoSource instanceof File) {
    objectUrl = URL.createObjectURL(videoSource);
    video.src = objectUrl;
  } else if (typeof videoSource === "string") {
    video.src = videoSource;
  } else {
    reject(new Error("Invalid video source for thumbnail"));
    return;
  }
  video.load();
});
export const createThumbnailFile = async (videoSource, originalFileName) => {
  const blob = await generateVideoThumbnail(videoSource);
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const thumbName = `thumb-${baseName}.jpg`;
  return new File([blob], thumbName, {
    type: "image/jpeg"
  });
};
