import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { upload, upload_file_icon, loader, check2, cross } from "../../assets";
import { ButtonComponent } from "../index";
import { Modal, Row, Col, Progress, Input, Select, Tooltip } from "antd";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdMovie, MdStorage, MdHighQuality, MdAccessTime } from "react-icons/md";
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

// Many .avi files report as "video/x-msvideo" rather than "video/avi", so
// the MIME type alone isn't enough to reliably catch them.
const STAGE_LABELS = {
  preparing: "Preparing upload...",
  uploading: "Uploading...",
  processing: "Processing...",
  complete: "Upload complete!",
  error: "Upload failed",
};

const getUploadStep = (uploadProgress, uploadStatus, hasVideo) => {
  if (hasVideo) return "complete";
  if (uploadStatus === STAGE_LABELS.error) return "error";

  const status = uploadStatus.toLowerCase();
  if (
    uploadProgress >= 85 ||
    status.includes("processing") ||
    status.includes("finalizing")
  ) {
    return "processing";
  }

  return "uploading";
};

const getStepItemClass = (step, uploadStep) => {
  const order = { uploading: 0, processing: 1, complete: 2 };
  const current = order[uploadStep] ?? -1;
  const classes = ["upload-video-steps__item"];

  if (uploadStep === step) {
    classes.push("upload-video-steps__item--active");
  }

  if (current > order[step]) {
    classes.push("upload-video-steps__item--done");
  }

  return classes.join(" ");
};

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
  const selectDropdownClass = `upload-video-select-dropdown ${isDark
    ? "upload-video-select-dropdown--dark"
    : "upload-video-select-dropdown--light"
    }`;

  const [createSignedUrl] = useMutation(CREATE_SIGNED_URL_FOR_NFTS);

  const [imageUpload, setImageUpload] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [isEmote, setIsEmote] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [styleError, setStyleError] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(undefined);
  const [styleChangeConfirmOpen, setStyleChangeConfirmOpen] = useState(false);
  const [pendingStyle, setPendingStyle] = useState(null);
  const [hintAttention, setHintAttention] = useState(false);
  const [selectAttention, setSelectAttention] = useState(false);
  const styleAttentionTimeoutRef = useRef(null);
  const styleSelectWrapRef = useRef(null);

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
        } catch (error) {
          console.error("Thumbnail generation failed:", error);
        }
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

      // console.log("META URI", metaUri);
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
  const fileUploadPercent = isFileUploadComplete ? 100 : uploadProgress;
  const uploadStep = getUploadStep(
    uploadProgress,
    uploadStatus,
    isFileUploadComplete,
  );
  const showUploadActivity = isUploading || Boolean(selectedFileName);

  const saveVideoUpload = async (
    videoUrl,
    videoSource,
    fileName,
    extraFields = {},
  ) => {
    setFieldValue("video", videoUrl);

    try {
      const thumbUrl = await uploadPosterImage(
        videoSource,
        fileName,
        createSignedUrl,
      );
      if (thumbUrl) {
        setFieldValue("thumbnail", thumbUrl);
      }
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
      ToastMessage(
        "Thumbnail warning",
        "Video uploaded but poster image could not be generated",
        "error",
      );
    }

    Object.entries(extraFields).forEach(([key, value]) => {
      setFieldValue(key, value);
    });
  };

  // Shared by both the "Browse" file input and drag-and-drop. Previously
  // this ~90 line block was duplicated in two places (uploadHandle and a
  // window-level "drop" listener) and had drifted out of sync - e.g. only
  // one path guarded against an undefined file and set the loader state.
  const processVideoFile = async (fileUploaded) => {
    if (!fileUploaded || imageUploadLoader || imageUpload) return;

    setImageUploadLoader(true);

    try {
      const videoElement = document.createElement("video");
      videoElement.onloadedmetadata = () => {
        setFieldValue("video_duration", Math.round(videoElement.duration));
      };
      videoElement.src = URL.createObjectURL(fileUploaded);
      await videoElement.load();

      if (isAviFile(fileUploaded)) {
        ToastMessage(
          "Uploading .avi files is not allowed. Please select another file.",
          "",
          "error",
        );
        return;
      }

      if (isEmote) {
        setSelectedFileName(fileUploaded.name);
        setImageUpload(true);
        setUploadProgress(0);
        setUploadStatus("Starting...");

        const handleProgress = (progressData) => {
          const scaledProgress = Math.round(progressData.progress * 0.8);
          setUploadProgress(scaledProgress);

          if (progressData.status === "UPLOADING") {
            setUploadStatus(STAGE_LABELS.uploading);
          } else if (progressData.status === "PROGRESS") {
            setUploadStatus(STAGE_LABELS.processing);
          } else if (progressData.status === "SUCCESS") {
            setUploadStatus("Processing complete!");
          } else if (progressData.status === "DOWNLOADING") {
            setUploadStatus("Finalizing...");
          } else {
            setUploadStatus(progressData.status || STAGE_LABELS.processing);
          }
        };

        const response = await handleDeepMotionUpload(
          fileUploaded,
          fileUploaded.name,
          handleProgress,
        );

        if (response) {
          const handleStorjProgress = ({ stage, percent }) => {
            const storjRange = 95 - 80;
            const storjOffset = percent - 12;
            const storjRatio = storjOffset / 73;
            const scaled = 80 + Math.round(storjRatio * storjRange);

            setUploadProgress(Math.min(95, Math.max(80, scaled)));
            setUploadStatus(
              stage === "preparing"
                ? STAGE_LABELS.preparing
                : STAGE_LABELS.uploading,
            );
          };

          const url = await sendFileToStorj(
            { file: response.mp4, name: fileUploaded.name },
            isEmote,
            createSignedUrl,
            handleStorjProgress,
          );

          setUploadStatus(STAGE_LABELS.processing);
          setUploadProgress(96);

          await saveVideoUpload(url, fileUploaded, fileUploaded.name, {
            isEmote: true,
            download: response,
          });

          setImageUpload(false);
          setUploadProgress(100);
          setUploadStatus(STAGE_LABELS.complete);
        } else {
          setUploadProgress(0);
          setUploadStatus(STAGE_LABELS.error);
          ToastMessage("Conversion Error", "", "error");
        }
      } else {
        setSelectedFileName(fileUploaded.name);
        setImageUpload(true);
        setUploadProgress(5);
        setUploadStatus(STAGE_LABELS.preparing);

        const handleStorjProgress = ({ stage, percent }) => {
          setUploadProgress(percent);
          setUploadStatus(STAGE_LABELS[stage] || STAGE_LABELS.uploading);
        };

        const url = await sendFileToStorj(
          fileUploaded,
          isEmote,
          createSignedUrl,
          handleStorjProgress,
        );

        setUploadStatus(STAGE_LABELS.processing);
        setUploadProgress(90);

        await saveVideoUpload(url, fileUploaded, fileUploaded.name, {
          isEmote: false,
          download: {},
        });

        setImageUpload(false);
        setUploadProgress(100);
        setUploadStatus(STAGE_LABELS.complete);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      setImageUpload(false);
      setUploadProgress(0);
      setUploadStatus(STAGE_LABELS.error);
      ToastMessage(
        "Upload Error",
        "Something went wrong while uploading your video. Please try again.",
        "error",
      );
    } finally {
      setImageUploadLoader(false);
    }
  };

  // const { createNft } = useSelector((state) => state.nft.createNft);

  const hiddenFileInput = useRef(null);

  const resetVideoUploadState = useCallback(() => {
    setSelectedFileName(null);
    setImageUpload(null);
    setImageUploadLoader(false);
    setUploadProgress(0);
    setUploadStatus("");
    setFieldValue("video", "");
    setFieldValue("thumbnail", "");
    setFieldValue("video_duration", "");
    setFieldValue("isEmote", false);
    setFieldValue("download", {});
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  }, [setFieldValue]);

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
      ToastMessage("Please select a style (Emote or Video) first", "", "error");
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
  const handleCategory = (value) => {
    setSelectedCategory(value);
  };

  const uploadHandle = async (event) => {
    if (isUploading) return;
    if (!isSelected) {
      setStyleError(true);
      triggerStyleAttention();
      ToastMessage("Please select a style (Emote or Video) first", "", "error");
      return;
    }

    const fileUploaded = event.target.files?.[0];
    await processVideoFile(fileUploaded);
    // Reset so selecting the same file again still fires onChange
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

  // Window-level drag handling while modal is open:
  // - full viewport overlay
  // - no setState on every dragover (prevents re-render storm)
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
        ToastMessage(
          "Please select a style (Emote or Video) first",
          "",
          "error",
        );
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
        style={{ padding: 0 }}
        width={790}
        open={visible}
        onOk={onClose}
        onCancel={onClose}
      >
        <div>
          <p className={`${textColor} fs-5 text-center m-0`}>
            Upload Emote/Video{" "}
            {/* <Tooltip title="Emote: your video is processed with AI motion extraction so it can be used as an in-game emote (takes 5-7 minutes). Video: uploads as-is, no processing.">
            <span>
              <AiOutlineInfoCircle style={{ cursor: "help" }} />
            </span>
          </Tooltip> */}
          </p>
          <div
            ref={styleSelectWrapRef}
            className={`upload-video-style-select-wrap${selectAttention ? " upload-video-style-select-wrap--attention" : ""
              }`}
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
              className={`upload-video-style-hint ${textColor2}${hintAttention ? " upload-video-style-hint--attention" : ""
                }`}
            >
              Select Emote or Video above to enable upload
            </p>
          )}
          <ErrorMessage
            className="upload-video-style-error"
            message={
              styleError
                ? "Please select a style (Emote or Video) before uploading"
                : null
            }
          />
          <Row
            className="dragVideoView py-4 mt-4 mx-2 flex-column"
            style={{ position: "relative" }}
          >
            <Col span={24} className="px-3">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="upload-video-drop-content">
                  <div className="upload-video-drop-content__left d-flex flex-column align-items-center">
                    <div className="uploadIconView d-flex align-items-center justify-content-center">
                      <img src={upload} alt="Upload" />
                    </div>
                    <p className={`${textColor2} upload-video-drop-content__text`}>
                      Drag and drop here <br /> or
                    </p>
                    <div
                      className={`upload-video-browse-wrap${
                        !isSelected || isUploading ? " browse-btn-disabled" : ""
                      }`}
                      title={
                        isUploading
                          ? "Please wait until upload finishes"
                          : !isSelected
                            ? "Select Emote or Video style above first"
                            : undefined
                      }
                    >
                      <ButtonComponent
                        onClick={handleClick}
                        text={"Browse"}
                        height={28}
                        radius={6}
                        disabled={isUploading}
                        className="upload-video-action-btn upload-video-browse-btn"
                      />
                    </div>
                    <input
                      type="file"
                      ref={hiddenFileInput}
                      onChange={uploadHandle}
                      style={{ display: "none" }}
                      accept="video/mp4,video/x-m4v,video/*"
                    />
                  </div>

                  <div className="upload-video-drop-content__right">
                    {imageUploadLoader && !selectedFileName && (
                      <div className="upload-video-drop-content__loader">
                        <img src={loader} alt="loader" style={{ width: "80px" }} />
                      </div>
                    )}

                    {showUploadActivity && selectedFileName && (
                      <div className="upload-video-upload-panel">
                        <div className="upload-video-file-row">
                          <div className="upload-video-file-row__icon">
                            <img src={upload_file_icon} alt="" />
                          </div>
                          <div className="upload-video-file-row__content">
                            <p
                              className={`upload-video-file-row__name ${textColor2}`}
                            >
                              {selectedFileName}
                            </p>
                            <Progress
                              className="upload-video-file-progress"
                              percent={fileUploadPercent}
                              showInfo={false}
                              strokeWidth={4}
                              strokeColor="#C44040"
                              status={
                                isFileUploadComplete
                                  ? "success"
                                  : uploadStep === "error"
                                    ? "exception"
                                    : "active"
                              }
                            />
                            {uploadStatus && (
                              <p
                                className={`upload-video-file-row__status-text ${textColor2}`}
                              >
                                {uploadStatus}
                              </p>
                            )}
                          </div>
                          <div className="upload-video-file-row__status">
                            {isFileUploadComplete ? (
                              <img
                                src={check2}
                                alt="Complete"
                                className="upload-video-file-row__check"
                              />
                            ) : uploadStep === "error" ? (
                              <img
                                src={cross}
                                alt="Failed"
                                className="upload-video-file-row__cross"
                              />
                            ) : (
                              <img
                                src={loader}
                                alt="Uploading"
                                className="upload-video-file-row__loader"
                              />
                            )}
                          </div>
                        </div>

                        <div className="upload-video-steps">
                          {["uploading", "processing", "complete"].map(
                            (step) => (
                              <span
                                key={step}
                                className={getStepItemClass(step, uploadStep)}
                              >
                                {step === "uploading"
                                  ? "Uploading"
                                  : step === "processing"
                                    ? "Processing"
                                    : "Complete"}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {!showUploadActivity && (
                      <div className="upload-video-requirements">
                        <p className={`upload-video-requirements__title mb-3 ${textColor2}`}>
                          Upload Video <span className="red">*</span>
                        </p>
                        <ul className="upload-video-requirements__list">
                          <li className="upload-video-requirements__item">
                            <span className="upload-video-requirements__icon">
                              <MdMovie />
                            </span>
                            <span className={textColor2}>
                              MP4 format (MOV/WebM accepted, AVI not supported)
                            </span>
                          </li>
                          <li className="upload-video-requirements__item">
                            <span className="upload-video-requirements__icon">
                              <MdStorage />
                            </span>
                            <span className={textColor2}>
                              Maximum file size: 100MB
                            </span>
                          </li>
                          <li className="upload-video-requirements__item">
                            <span className="upload-video-requirements__icon">
                              <MdHighQuality />
                            </span>
                            <span className={textColor2}>
                              Recommended: 1080p · 16:9 aspect ratio
                            </span>
                          </li>
                          <li className="upload-video-requirements__item">
                            <span className="upload-video-requirements__icon">
                              <MdAccessTime />
                            </span>
                            <span className={textColor2}>
                              Video upload: ~1–3 min · Emote AI processing: ~5–7
                              min (depends on file size)
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <ErrorMessage
                    className="upload-video-drop-content__error"
                    message={touched.video && errors.video ? errors.video : null}
                  />
                </div>
              </form>
            </Col>
            {isEmote && (
              <div className="px-3">
                <div
                  className="mt-3 p-3"
                  style={{
                    backgroundColor: "rgba(196, 64, 64, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(196, 64, 64, 0.2)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#C44040",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    !
                  </div>
                  <div>
                    <p
                      className={`${textColor2} m-0`}
                      style={{ fontSize: "14px", fontWeight: "600" }}
                    >
                      Processing Note
                    </p>
                    <p
                      className={textColor3}
                      style={{
                        fontSize: "12.5px",
                        margin: "4px 0 0 0",
                        lineHeight: "1.5",
                      }}
                    >
                      Creating an Emote involves advanced AI motion extraction.
                      This process usually takes about{" "}
                      <span style={{ color: "#C44040", fontWeight: "bold" }}>
                        5 to 7 minutes
                      </span>
                      . Thank you for your patience!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Row>
          <div className="mt-4">
            <form className="upload-video-form">
              <div className="upload-video-form-field">
                <p style={{ color: "#C44040" }} className="mb-2">
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
                <p style={{ color: "#C44040" }} className="mb-2">
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
                <p style={{ color: "#C44040" }} className="mb-2">
                  Category
                </p>
                <Select
                  className="text-center greyBgInput upload-video-category-select upload-video-field"
                  dropdownClassName={selectDropdownClass}
                  onChange={handleCategory}
                  defaultValue="Select Category"
                  style={{ width: "100%" }}
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
                <p style={{ color: "#C44040" }} className="mb-2">
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
        style={{ padding: 0 }}
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
