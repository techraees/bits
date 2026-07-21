import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Modal, Input, Select } from "antd";
import { ButtonComponent } from "../index";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { uploadValidation } from "../validations";
import ErrorMessage from "../error";
import { useMutation } from "@apollo/client";
import { CREATE_SIGNED_URL_FOR_NFTS } from "../../gql/mutations";
import {
  sendFileToStorj,
  sendMetaToIPFSPINATA,
  uploadPosterImage,
  validatePosterUrl,
} from "../../config/ipfsService";
import ToastMessage from "../toastMessage";
import { handleDeepMotionUpload } from "../../config/deepmotion";
import { buildNftMetadata } from "../../utills/buildNftMetadata";
const STAGE_LABELS = {
  preparing: "Preparing upload...",
  uploading: "Uploading...",
  processing: "Processing...",
  complete: "Upload complete!",
  error: "Upload failed",
};
const getDisplayProgress = (phase, rawProgress, isComplete) => {
  if (isComplete || phase === "complete") return 100;
  if (phase === "error") return rawProgress;
  if (phase === "processing") {
    return Math.min(95, Math.max(66, rawProgress));
  }
  if (phase === "uploading") {
    if (rawProgress <= 0) return 5;
    if (rawProgress >= 85) return 65;
    return Math.max(5, Math.round((rawProgress / 85) * 65));
  }
  return rawProgress;
};
const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
};
const splitFileName = (filename) => {
  if (!filename) return { base: "", ext: "" };
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return { base: filename, ext: "" };
  return {
    base: filename.slice(0, lastDot),
    ext: filename.slice(lastDot + 1).toUpperCase(),
  };
};
const DropzoneUploadIcon = () => (
  <svg
    width="88"
    height="88"
    viewBox="0 0 88 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="upload-video-dropzone__icon"
  >
    <path
      d="M27.3553 70.9126H20.3151C9.53512 70.1426 4.69531 61.8559 4.69531 54.4859C4.69531 47.1159 9.53517 38.7926 20.1318 38.0593C21.6352 37.9126 22.9551 39.0859 23.0651 40.6259C23.1751 42.1293 22.0386 43.4493 20.4986 43.5593C13.3853 44.0726 10.1953 49.4259 10.1953 54.5226C10.1953 59.6192 13.3853 64.9726 20.4986 65.4859H27.3553C28.8586 65.4859 30.1053 66.7326 30.1053 68.2359C30.1053 69.7392 28.8586 70.9126 27.3553 70.9126Z"
      fill="currentColor"
    />
    <path
      d="M61.1252 70.915C61.0519 70.915 61.0153 70.915 60.9419 70.915C59.4386 70.915 58.0454 69.6683 58.0454 68.165C58.0454 66.5883 59.2187 65.415 60.7586 65.415C65.2687 65.415 69.302 63.8383 72.4553 61.015C78.1753 56.0283 78.542 48.8416 77.002 43.7816C75.462 38.7583 71.1719 33.0016 63.6919 32.085C62.4819 31.9383 61.5285 31.0217 61.3085 29.8117C59.8419 21.0117 55.112 14.925 47.9253 12.725C40.5187 10.415 31.8652 12.6883 26.4752 18.335C21.2319 23.7983 20.0219 31.4617 23.0652 39.895C23.5785 41.325 22.8454 42.9016 21.4154 43.415C19.9854 43.9283 18.4086 43.195 17.8953 41.765C14.192 31.425 15.8787 21.525 22.5154 14.5583C29.2987 7.44497 40.1887 4.62161 49.5387 7.48161C58.1187 10.1216 64.1685 17.1983 66.3685 27.025C73.8485 28.7116 79.8619 34.395 82.2453 42.2416C84.8486 50.785 82.502 59.585 76.0853 65.1583C72.0153 68.825 66.6986 70.915 61.1252 70.915Z"
      fill="currentColor"
    />
    <path
      d="M43.9974 81.694C36.6274 81.694 29.7341 77.7707 25.9575 71.4273C25.5541 70.804 25.1508 70.0707 24.8208 69.264C23.5741 66.6607 22.9141 63.6907 22.9141 60.6107C22.9141 48.9873 32.3741 39.5273 43.9974 39.5273C55.6207 39.5273 65.0807 48.9873 65.0807 60.6107C65.0807 63.7273 64.4208 66.6607 63.1008 69.374C62.8075 70.0707 62.4042 70.804 61.9642 71.5007C58.2608 77.7707 51.3674 81.694 43.9974 81.694ZM43.9974 45.0273C35.4174 45.0273 28.4141 52.0307 28.4141 60.6107C28.4141 62.884 28.8907 65.0107 29.8074 66.954C30.1007 67.5773 30.3573 68.0907 30.6507 68.5673C33.4373 73.2973 38.534 76.194 43.9607 76.194C49.3874 76.194 54.484 73.2974 57.234 68.6407C57.564 68.0907 57.8575 67.5773 58.0775 67.064C59.0675 65.0473 59.544 62.9207 59.544 60.6473C59.5807 52.0307 52.5774 45.0273 43.9974 45.0273Z"
      fill="currentColor"
    />
    <path
      d="M41.91 66.9898C41.2133 66.9898 40.5168 66.7331 39.9668 66.1831L36.3366 62.5531C35.2732 61.4897 35.2732 59.7297 36.3366 58.6664C37.3999 57.6031 39.1599 57.6031 40.2232 58.6664L41.9834 60.4264L47.8499 54.9997C48.9866 53.9731 50.7099 54.0464 51.7366 55.1464C52.7633 56.2464 52.69 58.0064 51.59 59.0331L43.78 66.2564C43.23 66.7331 42.57 66.9898 41.91 66.9898Z"
      fill="currentColor"
    />
  </svg>
);
const DocumentIcon = () => (
  <svg
    width="42"
    height="54"
    viewBox="0 0 42 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="upload-video-document-icon"
  >
    <path
      d="M12 2H23.5713L40.0039 18.4326V41.1221C40.0039 46.6448 35.5266 51.1218 30.0039 51.1221H12C6.47715 51.1221 2 46.6449 2 41.1221V12C2 6.47715 6.47715 2 12 2Z"
      className="upload-video-document-icon__shape"
    />
  </svg>
);
const SuccessIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="upload-video-file-card__success-icon"
  >
    <path
      d="M6.9974 1.16797C3.78323 1.16797 1.16406 3.78714 1.16406 7.0013C1.16406 10.2155 3.78323 12.8346 6.9974 12.8346C10.2116 12.8346 12.8307 10.2155 12.8307 7.0013C12.8307 3.78714 10.2116 1.16797 6.9974 1.16797ZM9.78573 5.65964L6.47823 8.96714C6.39656 9.0488 6.28573 9.09547 6.16906 9.09547C6.0524 9.09547 5.94156 9.0488 5.8599 8.96714L4.20906 7.3163C4.0399 7.14714 4.0399 6.86714 4.20906 6.69797C4.37823 6.5288 4.65823 6.5288 4.8274 6.69797L6.16906 8.03964L9.1674 5.0413C9.33656 4.87214 9.61656 4.87214 9.78573 5.0413C9.9549 5.21047 9.9549 5.48464 9.78573 5.65964Z"
      fill="#3EBF8F"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M26.2467 8.41406C26.2217 8.41406 26.1842 8.41406 26.1467 8.41406C19.5342 7.75156 12.9342 7.50156 6.39666 8.16406L3.84666 8.41406C3.32166 8.46406 2.85916 8.08906 2.80916 7.56406C2.75916 7.03906 3.13416 6.58906 3.64666 6.53906L6.19666 6.28906C12.8467 5.61406 19.5842 5.87656 26.3342 6.53906C26.8467 6.58906 27.2217 7.05156 27.1717 7.56406C27.1342 8.05156 26.7217 8.41406 26.2467 8.41406Z"
      fill="#CF3913"
    />
    <path
      d="M10.6259 7.15C10.5759 7.15 10.5259 7.15 10.4634 7.1375C9.96343 7.05 9.61343 6.5625 9.70093 6.0625L9.97593 4.425C10.1759 3.225 10.4509 1.5625 13.3634 1.5625H16.6384C19.5634 1.5625 19.8384 3.2875 20.0259 4.4375L20.3009 6.0625C20.3884 6.575 20.0384 7.0625 19.5384 7.1375C19.0259 7.225 18.5384 6.875 18.4634 6.375L18.1884 4.75C18.0134 3.6625 17.9759 3.45 16.6509 3.45H13.3759C12.0509 3.45 12.0259 3.625 11.8384 4.7375L11.5509 6.3625C11.4759 6.825 11.0759 7.15 10.6259 7.15Z"
      fill="#CF3913"
    />
    <path
      d="M19.0149 28.4394H10.9899C6.62744 28.4394 6.45244 26.0269 6.31494 24.0769L5.50244 11.4894C5.46494 10.9769 5.86494 10.5269 6.37744 10.4894C6.90244 10.4644 7.33994 10.8519 7.37744 11.3644L8.18994 23.9519C8.32744 25.8519 8.37744 26.5644 10.9899 26.5644H19.0149C21.6399 26.5644 21.6899 25.8519 21.8149 23.9519L22.6274 11.3644C22.6649 10.8519 23.1149 10.4644 23.6274 10.4894C24.1399 10.5269 24.5399 10.9644 24.5024 11.4894L23.6899 24.0769C23.5524 26.0269 23.3774 28.4394 19.0149 28.4394Z"
      fill="#CF3913"
    />
    <path
      d="M17.0766 21.5625H12.9141C12.4016 21.5625 11.9766 21.1375 11.9766 20.625C11.9766 20.1125 12.4016 19.6875 12.9141 19.6875H17.0766C17.5891 19.6875 18.0141 20.1125 18.0141 20.625C18.0141 21.1375 17.5891 21.5625 17.0766 21.5625Z"
      fill="#CF3913"
    />
    <path
      d="M18.125 16.5625H11.875C11.3625 16.5625 10.9375 16.1375 10.9375 15.625C10.9375 15.1125 11.3625 14.6875 11.875 14.6875H18.125C18.6375 14.6875 19.0625 15.1125 19.0625 15.625C19.0625 16.1375 18.6375 16.5625 18.125 16.5625Z"
      fill="#CF3913"
    />
  </svg>
);
const FileCrossIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M15 28.4375C7.5875 28.4375 1.5625 22.4125 1.5625 15C1.5625 7.5875 7.5875 1.5625 15 1.5625C22.4125 1.5625 28.4375 7.5875 28.4375 15C28.4375 22.4125 22.4125 28.4375 15 28.4375ZM15 3.4375C8.625 3.4375 3.4375 8.625 3.4375 15C3.4375 21.375 8.625 26.5625 15 26.5625C21.375 26.5625 26.5625 21.375 26.5625 15C26.5625 8.625 21.375 3.4375 15 3.4375Z"
      fill="currentColor"
    />
    <path
      d="M11.4656 19.4742C11.2281 19.4742 10.9906 19.3867 10.8031 19.1992C10.4406 18.8367 10.4406 18.2367 10.8031 17.8742L17.8781 10.7992C18.2406 10.4367 18.8406 10.4367 19.2031 10.7992C19.5656 11.1617 19.5656 11.7617 19.2031 12.1242L12.1281 19.1992C11.9531 19.3867 11.7031 19.4742 11.4656 19.4742Z"
      fill="currentColor"
    />
    <path
      d="M18.5406 19.4742C18.3031 19.4742 18.0656 19.3867 17.8781 19.1992L10.8031 12.1242C10.4406 11.7617 10.4406 11.1617 10.8031 10.7992C11.1656 10.4367 11.7656 10.4367 12.1281 10.7992L19.2031 17.8742C19.5656 18.2367 19.5656 18.8367 19.2031 19.1992C19.0156 19.3867 18.7781 19.4742 18.5406 19.4742Z"
      fill="currentColor"
    />
  </svg>
);
const UploadCloudCheckIcon = () => (
  <svg
    width="46"
    height="46"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="upload-video-header__icon-svg"
  >
    <path
      d="M14.2981 37.0665H10.618C4.98303 36.664 2.45312 32.3324 2.45312 28.4799C2.45312 24.6274 4.98305 20.2765 10.5222 19.8932C11.3081 19.8165 11.998 20.4299 12.0555 21.2349C12.113 22.0207 11.519 22.7107 10.714 22.7682C6.99562 23.0365 5.32812 25.8348 5.32812 28.499C5.32812 31.1632 6.99562 33.9615 10.714 34.2299H14.2981C15.0839 34.2299 15.7356 34.8815 15.7356 35.6674C15.7356 36.4532 15.0839 37.0665 14.2981 37.0665Z"
      fill="currentColor"
    />
    <path
      d="M31.9483 37.0668C31.9099 37.0668 31.8908 37.0668 31.8525 37.0668C31.0666 37.0668 30.3383 36.4151 30.3383 35.6293C30.3383 34.8051 30.9517 34.1918 31.7567 34.1918C34.1142 34.1918 36.2225 33.3676 37.8708 31.8918C40.8608 29.2851 41.0525 25.5285 40.2475 22.8835C39.4425 20.2576 37.2 17.2485 33.29 16.7693C32.6575 16.6926 32.1591 16.2135 32.0441 15.581C31.2774 10.981 28.805 7.79929 25.0483 6.64929C21.1767 5.44179 16.6533 6.63012 13.8358 9.58179C11.0949 12.4376 10.4624 16.4435 12.0533 20.8518C12.3216 21.5993 11.9384 22.4235 11.1909 22.6918C10.4434 22.9601 9.61915 22.5768 9.35082 21.8293C7.41499 16.4243 8.29667 11.2493 11.7658 7.60763C15.3117 3.88929 21.0042 2.41345 25.8917 3.90844C30.3767 5.28844 33.5391 8.98761 34.6891 14.1243C38.5991 15.0059 41.7425 17.9768 42.9883 22.0785C44.3491 26.5443 43.1225 31.1443 39.7683 34.0576C37.6408 35.9743 34.8616 37.0668 31.9483 37.0668Z"
      fill="currentColor"
    />
    <path
      d="M22.9974 42.7018C19.1449 42.7018 15.5416 40.651 13.5674 37.3352C13.3566 37.0093 13.1458 36.626 12.9733 36.2043C12.3216 34.8435 11.9766 33.291 11.9766 31.681C11.9766 25.6052 16.9216 20.6602 22.9974 20.6602C29.0732 20.6602 34.0182 25.6052 34.0182 31.681C34.0182 33.3102 33.6733 34.8435 32.9833 36.2618C32.8299 36.626 32.6191 37.0093 32.3891 37.3735C30.4533 40.651 26.8499 42.7018 22.9974 42.7018ZM22.9974 23.5352C18.5124 23.5352 14.8516 27.196 14.8516 31.681C14.8516 32.8693 15.1007 33.981 15.5799 34.9968C15.7332 35.3226 15.8674 35.591 16.0207 35.8402C17.4774 38.3127 20.1415 39.8268 22.9782 39.8268C25.8149 39.8268 28.479 38.3127 29.9165 35.8785C30.089 35.591 30.2424 35.3226 30.3574 35.0543C30.8749 34.0001 31.124 32.8885 31.124 31.7001C31.1432 27.196 27.4824 23.5352 22.9974 23.5352Z"
      fill="currentColor"
    />
    <path
      d="M21.9084 35.0183C21.5442 35.0183 21.1801 34.8841 20.8926 34.5966L18.995 32.6991C18.4392 32.1433 18.4392 31.2233 18.995 30.6674C19.5508 30.1116 20.4708 30.1116 21.0267 30.6674L21.9467 31.5874L25.0134 28.7508C25.6075 28.2141 26.5084 28.2524 27.045 28.8274C27.5817 29.4024 27.5434 30.3224 26.9684 30.8591L22.8859 34.6349C22.5984 34.8841 22.2534 35.0183 21.9084 35.0183Z"
      fill="currentColor"
    />
  </svg>
);
const isAviFile = (file) => {
  const type = (file?.type || "").toLowerCase();
  const name = (file?.name || "").toLowerCase();
  return (
    type === "video/avi" || type === "video/x-msvideo" || name.endsWith(".avi")
  );
};
const UploadVideoModal = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.address.userData);
  const backgroundTheme = useSelector(
    (state) => state.app.theme.backgroundTheme,
  );
  const textColor = useSelector((state) => state.app.theme.textColor);
  const textColor2 = useSelector((state) => state.app.theme.textColor2);
  const textColor3 = useSelector((state) => state.app.theme.textColor3);
  const isDark = textColor === "white";
  const selectDropdownClass = `upload-video-select-dropdown ${isDark ? "upload-video-select-dropdown--dark" : "upload-video-select-dropdown--light"}`;
  const [createSignedUrl] = useMutation(CREATE_SIGNED_URL_FOR_NFTS);
  const [imageUpload, setImageUpload] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [selectedFileSize, setSelectedFileSize] = useState(0);
  const [isEmote, setIsEmote] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [styleError, setStyleError] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadPhase, setUploadPhase] = useState("idle");
  const [selectedStyle, setSelectedStyle] = useState(undefined);
  const [styleChangeConfirmOpen, setStyleChangeConfirmOpen] = useState(false);
  const [pendingStyle, setPendingStyle] = useState(null);
  const [hintAttention, setHintAttention] = useState(false);
  const [selectAttention, setSelectAttention] = useState(false);
  const styleAttentionTimeoutRef = useRef(null);
  const styleSelectWrapRef = useRef(null);
  const uploadSessionRef = useRef(0);
  const uploadAbortControllerRef = useRef(null);
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
    values,
    touched,
    errors,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      artist_name1: userData?.full_name || "",
      description: "",
      video: "",
      thumbnail: "",
      meta: "",
    },
    validate: uploadValidation,
    onSubmit: async (values) => {
      let posterUrl = values.thumbnail;
      if (!posterUrl && values.video) {
        try {
          posterUrl = await uploadPosterImage(
            values.video,
            values.name || "nft-video",
            createSignedUrl,
          );
        } catch (error) {}
      }
      if (!posterUrl) {
        ToastMessage(
          "Error",
          "NFT poster image is required for wallet display",
          "error",
        );
        return;
      }
      const isPosterAccessible = await validatePosterUrl(posterUrl);
      if (!isPosterAccessible) {
        ToastMessage(
          "Error",
          "NFT poster image is not accessible. Please re-upload the video.",
          "error",
        );
        return;
      }
      const data = buildNftMetadata({
        name: values.name,
        description: values.description,
        video: values.video,
        image: posterUrl,
      });
      const metaUri = await sendMetaToIPFSPINATA(data);
      dispatch({
        type: "CREATE_NFT",
        createNft: {
          name: values.name,
          artist_name1: values.artist_name1,
          description: values.description,
          video: values.video,
          meta: metaUri,
          isEmote: values.isEmote,
          download: values.download,
          video_duration: values.video_duration,
          category: selectedCategory,
        },
      });
      navigate("/mint-nft");
    },
  });
  const isUploading = imageUploadLoader || Boolean(imageUpload);
  const isFileUploadComplete = Boolean(values.video);
  const activeUploadPhase = isFileUploadComplete ? "complete" : uploadPhase;
  const fileUploadPercent = getDisplayProgress(
    activeUploadPhase,
    uploadProgress,
    isFileUploadComplete,
  );
  const showUploadActivity = isUploading || Boolean(selectedFileName);
  const uploadedFileBytes = Math.round(
    (fileUploadPercent / 100) * selectedFileSize,
  );
  const getFileCardStatus = () => {
    const totalLabel = formatFileSize(selectedFileSize);
    const uploadedLabel = formatFileSize(uploadedFileBytes);
    if (isFileUploadComplete) {
      return {
        uploadedLabel: totalLabel,
        totalLabel,
        label: "Completed",
        showSuccess: true,
        showSpinner: false,
      };
    }
    if (activeUploadPhase === "error") {
      return {
        uploadedLabel,
        totalLabel,
        label: "Upload failed",
        showSuccess: false,
        showSpinner: false,
      };
    }
    if (activeUploadPhase === "processing") {
      return {
        uploadedLabel: totalLabel,
        totalLabel,
        label: "Processing...",
        showSuccess: false,
        showSpinner: true,
      };
    }
    return {
      uploadedLabel,
      totalLabel,
      label: "Uploading...",
      showSuccess: false,
      showSpinner: true,
    };
  };
  const saveVideoUpload = async (
    videoUrl,
    videoSource,
    fileName,
    extraFields = {},
    sessionId,
  ) => {
    if (uploadSessionRef.current !== sessionId) return;
    setFieldValue("video", videoUrl);
    try {
      const thumbUrl = await uploadPosterImage(
        videoSource,
        fileName,
        createSignedUrl,
      );
      if (uploadSessionRef.current !== sessionId) return;
      if (thumbUrl) {
        setFieldValue("thumbnail", thumbUrl);
      }
    } catch (error) {
      if (uploadSessionRef.current !== sessionId) return;
      ToastMessage(
        "Thumbnail warning",
        "Video uploaded but poster image could not be generated",
        "error",
      );
    }
    if (uploadSessionRef.current !== sessionId) return;
    Object.entries(extraFields).forEach(([key, value]) => {
      setFieldValue(key, value);
    });
  };
  const invalidateUploadSession = useCallback(() => {
    uploadSessionRef.current += 1;
    uploadAbortControllerRef.current?.abort();
    uploadAbortControllerRef.current = null;
  }, []);
  const beginUploadSession = useCallback(() => {
    invalidateUploadSession();
    const controller = new AbortController();
    uploadAbortControllerRef.current = controller;
    return {
      sessionId: uploadSessionRef.current,
      signal: controller.signal,
    };
  }, [invalidateUploadSession]);
  const isUploadCancelledError = (error) =>
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError" ||
    error?.message === "canceled";
  const processVideoFile = async (fileUploaded) => {
    if (!fileUploaded || imageUploadLoader || imageUpload) return;
    if (isAviFile(fileUploaded)) {
      ToastMessage(
        "Uploading .avi files is not allowed. Please select another file.",
        "",
        "error",
      );
      return;
    }
    const { sessionId, signal } = beginUploadSession();
    const isActiveSession = () => uploadSessionRef.current === sessionId;
    setSelectedFileName(fileUploaded.name);
    setSelectedFileSize(fileUploaded.size);
    setImageUploadLoader(true);
    try {
      const videoElement = document.createElement("video");
      videoElement.onloadedmetadata = () => {
        if (!isActiveSession()) return;
        setFieldValue("video_duration", Math.round(videoElement.duration));
      };
      videoElement.src = URL.createObjectURL(fileUploaded);
      await videoElement.load();
      if (!isActiveSession()) return;
      if (isEmote) {
        setImageUpload(true);
        setUploadProgress(0);
        setUploadPhase("uploading");
        setUploadStatus("Starting...");
        const handleProgress = (progressData) => {
          if (!isActiveSession()) return;
          const scaledProgress = Math.round(progressData.progress * 0.8);
          setUploadProgress(scaledProgress);
          if (progressData.status === "UPLOADING") {
            setUploadPhase("uploading");
            setUploadStatus(STAGE_LABELS.uploading);
          } else if (progressData.status === "PROGRESS") {
            setUploadPhase("processing");
            setUploadStatus(STAGE_LABELS.processing);
          } else if (progressData.status === "SUCCESS") {
            setUploadPhase("processing");
            setUploadStatus("Processing complete!");
          } else if (progressData.status === "DOWNLOADING") {
            setUploadPhase("processing");
            setUploadStatus("Finalizing...");
          } else {
            setUploadPhase("processing");
            setUploadStatus(progressData.status || STAGE_LABELS.processing);
          }
        };
        const response = await handleDeepMotionUpload(
          fileUploaded,
          fileUploaded.name,
          handleProgress,
        );
        if (!isActiveSession()) return;
        if (response) {
          const handleStorjProgress = ({ stage, percent }) => {
            if (!isActiveSession()) return;
            const storjRange = 95 - 80;
            const storjOffset = percent - 12;
            const storjRatio = storjOffset / 73;
            const scaled = 80 + Math.round(storjRatio * storjRange);
            setUploadProgress(Math.min(95, Math.max(80, scaled)));
            setUploadPhase("uploading");
            setUploadStatus(
              stage === "preparing"
                ? STAGE_LABELS.preparing
                : STAGE_LABELS.uploading,
            );
          };
          const url = await sendFileToStorj(
            {
              file: response.mp4,
              name: fileUploaded.name,
            },
            isEmote,
            createSignedUrl,
            handleStorjProgress,
            signal,
          );
          if (!isActiveSession()) return;
          setUploadPhase("processing");
          setUploadStatus(STAGE_LABELS.processing);
          setUploadProgress(90);
          await saveVideoUpload(
            url,
            fileUploaded,
            fileUploaded.name,
            {
              isEmote: true,
              download: response,
            },
            sessionId,
          );
          if (!isActiveSession()) return;
          setImageUpload(false);
          setUploadPhase("complete");
          setUploadProgress(100);
          setUploadStatus(STAGE_LABELS.complete);
        } else {
          if (!isActiveSession()) return;
          setUploadProgress(0);
          setUploadPhase("error");
          setUploadStatus(STAGE_LABELS.error);
          ToastMessage("Conversion Error", "", "error");
        }
      } else {
        setImageUpload(true);
        setUploadPhase("uploading");
        setUploadProgress(5);
        setUploadStatus(STAGE_LABELS.preparing);
        const handleStorjProgress = ({ stage, percent }) => {
          if (!isActiveSession()) return;
          setUploadProgress(percent);
          setUploadPhase("uploading");
          setUploadStatus(STAGE_LABELS[stage] || STAGE_LABELS.uploading);
        };
        const url = await sendFileToStorj(
          fileUploaded,
          isEmote,
          createSignedUrl,
          handleStorjProgress,
          signal,
        );
        if (!isActiveSession()) return;
        setUploadPhase("processing");
        setUploadStatus(STAGE_LABELS.processing);
        setUploadProgress(90);
        await saveVideoUpload(
          url,
          fileUploaded,
          fileUploaded.name,
          {
            isEmote: false,
            download: {},
          },
          sessionId,
        );
        if (!isActiveSession()) return;
        setImageUpload(false);
        setUploadPhase("complete");
        setUploadProgress(100);
        setUploadStatus(STAGE_LABELS.complete);
      }
    } catch (error) {
      if (!isActiveSession() || isUploadCancelledError(error)) return;
      setImageUpload(false);
      setUploadProgress(0);
      setUploadPhase("error");
      setUploadStatus(STAGE_LABELS.error);
      ToastMessage(
        "Upload Error",
        "Something went wrong while uploading your video. Please try again.",
        "error",
      );
    } finally {
      if (isActiveSession()) {
        setImageUploadLoader(false);
      }
    }
  };
  const hiddenFileInput = useRef(null);
  const resetVideoUploadState = useCallback(() => {
    invalidateUploadSession();
    setSelectedFileName(null);
    setSelectedFileSize(0);
    setImageUpload(null);
    setImageUploadLoader(false);
    setUploadProgress(0);
    setUploadStatus("");
    setUploadPhase("idle");
    setFieldValue("video", "");
    setFieldValue("thumbnail", "");
    setFieldValue("video_duration", "");
    setFieldValue("isEmote", false);
    setFieldValue("download", {});
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  }, [invalidateUploadSession, setFieldValue]);
  const applyStyleSelection = useCallback((value) => {
    setStyleError(false);
    setHintAttention(false);
    setSelectAttention(false);
    setIsEmote(value === "Emote");
    setIsSelected(true);
    setSelectedStyle(value);
  }, []);
  const triggerStyleAttention = useCallback(() => {
    setHintAttention(true);
    setSelectAttention(true);
    styleSelectWrapRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    if (styleAttentionTimeoutRef.current) {
      clearTimeout(styleAttentionTimeoutRef.current);
    }
    styleAttentionTimeoutRef.current = setTimeout(() => {
      setHintAttention(false);
      setSelectAttention(false);
      styleAttentionTimeoutRef.current = null;
    }, 1000);
  }, []);
  const handleClick = () => {
    if (isUploading) return;
    if (!isSelected) {
      setStyleError(true);
      triggerStyleAttention();
      return;
    }
    hiddenFileInput.current.click();
  };
  const handleSelect = (value) => {
    if (isUploading) return;
    if (value === selectedStyle) return;
    if (values.video) {
      setPendingStyle(value);
      setStyleChangeConfirmOpen(true);
      return;
    }
    applyStyleSelection(value);
  };
  const handleCancelStyleChange = () => {
    setStyleChangeConfirmOpen(false);
    setPendingStyle(null);
  };
  const handleConfirmStyleChange = () => {
    if (pendingStyle) {
      resetVideoUploadState();
      applyStyleSelection(pendingStyle);
    }
    setStyleChangeConfirmOpen(false);
    setPendingStyle(null);
  };
  const handleRemoveFile = () => {
    resetVideoUploadState();
  };
  const handleCategory = (value) => {
    setSelectedCategory(value);
  };
  const uploadHandle = async (event) => {
    if (isUploading) return;
    if (!isSelected) {
      setStyleError(true);
      triggerStyleAttention();
      return;
    }
    const fileUploaded = event.target.files?.[0];
    await processVideoFile(fileUploaded);
    event.target.value = "";
  };
  const [dragActive, setDragActive] = useState(false);
  const dragCounterRef = useRef(0);
  const dragActiveRef = useRef(false);
  const isSelectedRef = useRef(isSelected);
  const processVideoFileRef = useRef(null);
  const isUploadingRef = useRef(isUploading);
  const triggerStyleAttentionRef = useRef(triggerStyleAttention);
  isSelectedRef.current = isSelected;
  processVideoFileRef.current = processVideoFile;
  isUploadingRef.current = isUploading;
  triggerStyleAttentionRef.current = triggerStyleAttention;
  const setDragActiveSafe = useCallback((nextValue) => {
    if (dragActiveRef.current === nextValue) return;
    dragActiveRef.current = nextValue;
    setDragActive(nextValue);
  }, []);
  const resetDragState = useCallback(() => {
    dragCounterRef.current = 0;
    setDragActiveSafe(false);
  }, [setDragActiveSafe]);
  useEffect(() => {
    if (!visible) {
      setHintAttention(false);
      setSelectAttention(false);
      if (styleAttentionTimeoutRef.current) {
        clearTimeout(styleAttentionTimeoutRef.current);
        styleAttentionTimeoutRef.current = null;
      }
      resetDragState();
      return undefined;
    }
    const hasFiles = (event) =>
      Array.from(event.dataTransfer?.types || []).includes("Files");
    const onDragEnter = (event) => {
      event.preventDefault();
      if (!hasFiles(event)) return;
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setDragActiveSafe(true);
      }
    };
    const onDragOver = (event) => {
      event.preventDefault();
    };
    const onDragLeave = (event) => {
      event.preventDefault();
      if (!hasFiles(event)) return;
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setDragActiveSafe(false);
      }
    };
    const onDrop = async (event) => {
      event.preventDefault();
      resetDragState();
      if (isUploadingRef.current) return;
      if (!isSelectedRef.current) {
        setStyleError(true);
        triggerStyleAttentionRef.current?.();
        return;
      }
      const fileUploaded = event.dataTransfer?.files?.[0];
      await processVideoFileRef.current?.(fileUploaded);
    };
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      resetDragState();
    };
  }, [visible, resetDragState, setDragActiveSafe]);
  useEffect(() => {
    if (userData?.full_name) {
      setFieldValue("artist_name1", userData.full_name);
    }
  }, [userData]);
  return (
    <>
      <Modal
        footer={null}
        className={`upload-video-modal ${backgroundTheme}`}
        style={{
          padding: 0,
        }}
        width={790}
        open={visible}
        onOk={onClose}
        onCancel={onClose}
      >
        <div className="upload-video-header">
          <div className="upload-video-header__icon-wrap">
            <UploadCloudCheckIcon />
          </div>
          <div className="upload-video-header__text">
            <p className="upload-video-header__title">Upload files</p>
            <p className="upload-video-header__subtitle">
              Select and upload the files of your choice
            </p>
          </div>
        </div>
        <div className="upload-video-modal__body">
          <div
            ref={styleSelectWrapRef}
            className={`upload-video-style-select-wrap${selectAttention ? " upload-video-style-select-wrap--attention" : ""}`}
          >
            <Select
              className="text-center mt-3 upload-video-style-select upload-video-field"
              dropdownClassName={selectDropdownClass}
              value={selectedStyle}
              placeholder="Select style"
              style={{
                width: "100%",
              }}
              status={styleError ? "error" : undefined}
              disabled={isUploading}
              onChange={handleSelect}
              options={[
                {
                  value: "Emote",
                  label: "Emote",
                },
                {
                  value: "Video",
                  label: "Video",
                },
              ]}
            />
          </div>
          {!isSelected && !isUploading && (
            <p
              className={`upload-video-style-hint ${textColor2}${hintAttention ? " upload-video-style-hint--attention" : ""}`}
            >
              Select Emote or Video above to enable upload
            </p>
          )}
          <div className="upload-video-upload-section mt-4">
            <div
              className={`upload-video-dropzone${dragActive ? " upload-video-dropzone--active" : ""}${!isSelected ? " upload-video-dropzone--disabled" : ""}`}
            >
              <DropzoneUploadIcon />
              <div className="upload-video-dropzone__copy">
                <p className="upload-video-dropzone__title">
                  Choose a file or drag &amp; drop it here
                </p>
                <p className="upload-video-dropzone__hint">
                  MP4, MOV and WebM formats, up to 100MB
                </p>
              </div>
              <button
                type="button"
                className={`upload-video-dropzone__browse${!isSelected || isUploading ? " upload-video-dropzone__browse--disabled" : ""}`}
                onClick={handleClick}
                disabled={isUploading}
                title={
                  isUploading
                    ? "Please wait until upload finishes"
                    : undefined
                }
              >
                Browse File
              </button>
              <input
                type="file"
                ref={hiddenFileInput}
                onChange={uploadHandle}
                style={{ display: "none" }}
                accept="video/mp4,video/x-m4v,video/*"
              />
            </div>

            {showUploadActivity && selectedFileName && (() => {
              const { base, ext } = splitFileName(selectedFileName);
              const fileStatus = getFileCardStatus();
              return (
                <div className="upload-video-file-card">
                  <div className="upload-video-file-card__main">
                    <div className="upload-video-file-card__doc">
                      <DocumentIcon />
                    </div>
                    <div className="upload-video-file-card__info">
                      <p className="upload-video-file-card__name">
                        <span className="upload-video-file-card__name-base">
                          {base}
                        </span>
                        {ext ? (
                          <span className="upload-video-file-card__ext">
                            .{ext}
                          </span>
                        ) : null}
                      </p>
                      <p className="upload-video-file-card__status">
                        <span className="upload-video-file-card__status-size">
                          {fileStatus.uploadedLabel} of {fileStatus.totalLabel}
                        </span>
                        <span className="upload-video-file-card__status-sep">
                          •
                        </span>
                        {fileStatus.showSpinner ? (
                          <span
                            className="upload-video-file-card__spinner"
                            aria-hidden="true"
                          />
                        ) : null}
                        {fileStatus.showSuccess ? <SuccessIcon /> : null}
                        <span className="upload-video-file-card__status-label">
                          {fileStatus.label}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="upload-video-file-card__action"
                      onClick={handleRemoveFile}
                      aria-label={
                        isFileUploadComplete
                          ? "Remove file"
                          : "Cancel upload"
                      }
                    >
                      {isFileUploadComplete ? <TrashIcon /> : <FileCrossIcon />}
                    </button>
                  </div>
                  {!isFileUploadComplete && activeUploadPhase !== "error" ? (
                    <div className="upload-video-file-card__progress">
                      <div
                        className="upload-video-file-card__progress-bar"
                        style={{ width: `${fileUploadPercent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })()}

            <ErrorMessage
              className="upload-video-upload-section__error"
              message={touched.video && errors.video ? errors.video : null}
            />

            {isEmote ? (
              <div className="upload-video-emote-note">
                <div className="upload-video-emote-note__badge">!</div>
                <div>
                  <p className="upload-video-emote-note__title">
                    Processing Note
                  </p>
                  <p className="upload-video-emote-note__text">
                    Creating an Emote involves advanced AI motion extraction.
                    This process usually takes about{" "}
                    <span className="upload-video-emote-note__highlight">
                      5 to 7 minutes
                    </span>
                    . Thank you for your patience!
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-4">
            <form className="upload-video-form">
              <div className="upload-video-form-field">
                <p
                  style={{
                    color: "#C44040",
                  }}
                  className="mb-2"
                >
                  NFT Name <span className="red">*</span>
                </p>
                <Input
                  placeholder="NFT Name"
                  className="greyBgInput upload-video-field"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  message={touched.name && errors.name ? errors.name : null}
                />
              </div>
              <div className="upload-video-form-field">
                <p
                  style={{
                    color: "#C44040",
                  }}
                  className="mb-2"
                >
                  Artist
                </p>
                <Input
                  placeholder="Artist"
                  className="greyBgInput upload-video-field"
                  name="artist_name1"
                  value={values.artist_name1}
                  disabled
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  message={
                    touched.artist_name1 && errors.artist_name1
                      ? errors.artist_name1
                      : null
                  }
                />
              </div>
              <div className="upload-video-form-field">
                <p
                  style={{
                    color: "#C44040",
                  }}
                  className="mb-2"
                >
                  Category
                </p>
                <Select
                  className="text-center greyBgInput upload-video-category-select upload-video-field"
                  dropdownClassName={selectDropdownClass}
                  onChange={handleCategory}
                  defaultValue="Select Category"
                  style={{
                    width: "100%",
                  }}
                  options={[
                    {
                      value: "Dance",
                      label: "Dance",
                    },
                    {
                      value: "Emote",
                      label: "Emote",
                    },
                    {
                      value: "Moments",
                      label: "Moments",
                    },
                    {
                      value: "Other",
                      label: "Other",
                    },
                  ]}
                />
              </div>
              <div className="upload-video-form-field">
                <p
                  style={{
                    color: "#C44040",
                  }}
                  className="mb-2"
                >
                  Description <span className="red">*</span>
                </p>
                <Input.TextArea
                  rows={6}
                  className="greyBgInput upload-video-textarea"
                  placeholder="Description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  message={
                    touched.description && errors.description
                      ? errors.description
                      : null
                  }
                />
              </div>
              <div className="d-flex justify-content-center">
                <ButtonComponent
                  onClick={handleSubmit}
                  text={"Create NFT"}
                  height={40}
                  width={170}
                  radius={6}
                  className="upload-video-action-btn"
                />
              </div>
            </form>
          </div>
        </div>
        {dragActive &&
          visible &&
          createPortal(
            <div id="drag-file-element" className="upload-drop-overlay">
              <p className="upload-drop-overlay__text">Drop your video here</p>
            </div>,
            document.body,
          )}
      </Modal>

      <Modal
        open={styleChangeConfirmOpen}
        onCancel={handleCancelStyleChange}
        footer={null}
        centered
        width={400}
        zIndex={1200}
        closable={false}
        maskClosable
        className={`upload-video-confirm-modal ${backgroundTheme}`}
        style={{
          padding: 0,
        }}
      >
        <div className="upload-video-confirm">
          <p className={`upload-video-confirm__title ${textColor}`}>
            Change style?
          </p>
          <p className={`upload-video-confirm__text ${textColor2}`}>
            Changing between Emote and Video will remove your uploaded file. You
            will need to upload again.
          </p>
          <div className="upload-video-confirm__actions">
            <button
              type="button"
              className="upload-video-confirm__cancel"
              onClick={handleCancelStyleChange}
            >
              Cancel
            </button>
            <ButtonComponent
              onClick={handleConfirmStyleChange}
              text="Yes, change"
              height={40}
              width={130}
              radius={6}
              className="upload-video-confirm__confirm"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
export default UploadVideoModal;
