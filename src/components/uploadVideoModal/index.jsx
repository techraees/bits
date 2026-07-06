import React, { useState, useRef, useEffect } from "react";
import { upload, upload_file_icon, upload_red, loader } from "../../assets";
import { ButtonComponent } from "../index";
import { Modal, Row, Col, Progress, Input, Select, Tooltip } from "antd";
import { AiOutlineInfoCircle } from "react-icons/ai";
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
  // const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!fileUploaded) return;

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

        // Progress callback for DeepMotion processing
        const handleProgress = (progressData) => {
          setUploadProgress(progressData.progress);
          if (progressData.status === "UPLOADING") {
            setUploadStatus("Uploading video...");
          } else if (progressData.status === "PROGRESS") {
            setUploadStatus("Processing...");
          } else if (progressData.status === "SUCCESS") {
            setUploadStatus("Processing complete!");
          } else if (progressData.status === "DOWNLOADING") {
            setUploadStatus("Finalizing...");
          } else {
            setUploadStatus(progressData.status || "Processing...");
          }
        };

        const response = await handleDeepMotionUpload(
          fileUploaded,
          fileUploaded.name,
          handleProgress,
        );

        if (response) {
          setUploadStatus("Uploading to storage...");
          const url = await sendFileToStorj(
            { file: response.mp4, name: fileUploaded.name },
            isEmote,
            createSignedUrl,
          );
          setImageUpload(false);
          setUploadProgress(100);
          setUploadStatus("Complete!");

          await saveVideoUpload(url, fileUploaded, fileUploaded.name, {
            isEmote: true,
            download: response,
          });
        } else {
          setUploadProgress(0);
          setUploadStatus("Error");
          ToastMessage("Conversion Error", "", "error");
        }
      } else {
        setSelectedFileName(fileUploaded.name);
        setImageUpload(true);
        const url = await sendFileToStorj(
          fileUploaded,
          isEmote,
          createSignedUrl,
        );
        setImageUpload(false);

        await saveVideoUpload(url, fileUploaded, fileUploaded.name, {
          isEmote: false,
          download: {},
        });
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      setImageUpload(false);
      setUploadProgress(0);
      setUploadStatus("Error");
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

  // The Browse button stays visually disabled (see wrapper below) while no
  // style is selected, but clicks still reach this handler so the user gets
  // an inline error + toast telling them what to do, instead of the click
  // silently doing nothing.
  const handleClick = () => {
    if (!isSelected) {
      setStyleError(true);
      ToastMessage("Please select a style (Emote or Video) first", "", "error");
      return;
    }
    hiddenFileInput.current.click();
  };

  const handleSelect = (value) => {
    setStyleError(false);
    if (value === "Emote") {
      setIsEmote(true);
      setIsSelected(true);
    } else {
      setIsEmote(false);
      setIsSelected(true);
    }
  };
  const handleCategory = (value) => {
    setSelectedCategory(value);
  };

  const uploadHandle = async (event) => {
    if (!isSelected) {
      setStyleError(true);
      ToastMessage("Please select a style (Emote or Video) first", "", "error");
      return;
    }

    const fileUploaded = event.target.files?.[0];
    await processVideoFile(fileUploaded);
    // Reset so selecting the same file again still fires onChange
    event.target.value = "";
  };

  const [dragActive, setDragActive] = React.useState(false);

  // Only exists to stop the browser from navigating away / opening the
  // dropped file if it lands outside the drop zone while this modal is
  // open. Actual file handling always goes through handleDrop below - it
  // used to be duplicated here too, without cleanup, so a new pair of
  // listeners was added on every render.
  useEffect(() => {
    if (!visible) return undefined;

    const preventWindowDragover = (e) => e.preventDefault();
    const preventWindowDrop = (e) => e.preventDefault();

    window.addEventListener("dragover", preventWindowDragover);
    window.addEventListener("drop", preventWindowDrop);

    return () => {
      window.removeEventListener("dragover", preventWindowDragover);
      window.removeEventListener("drop", preventWindowDrop);
    };
  }, [visible]);

  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = async function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!isSelected) {
      setStyleError(true);
      ToastMessage("Please select a style (Emote or Video) first", "", "error");
      return;
    }

    const fileUploaded = e.dataTransfer?.files?.[0];
    await processVideoFile(fileUploaded);
  };

  useEffect(() => {
    if (userData?.full_name) {
      setFieldValue("artist_name1", userData.full_name);
    }
  }, [userData]);

  return (
    <Modal
      // wrapClassName={backgroundTheme}
      footer={null}
      className={backgroundTheme}
      bodyStyle={{ backgroundColor: "#222222" }}
      open={visible}
      onOk={onClose}
      onCancel={onClose}
    >
      <div>
        <p className={`${textColor} fs-5 text-center m-0`}>
          Upload Emote/Video{" "}
          <Tooltip title="Emote: your video is processed with AI motion extraction so it can be used as an in-game emote (takes 5-7 minutes). Video: uploads as-is, no processing.">
            <span>
              <AiOutlineInfoCircle style={{ cursor: "help" }} />
            </span>
          </Tooltip>
        </p>
        <Select
          className="text-center mt-3"
          defaultValue="Select style"
          style={{
            width: "100%",
          }}
          status={styleError ? "error" : undefined}
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
        <ErrorMessage
          message={
            styleError
              ? "Please select a style (Emote or Video) before uploading"
              : null
          }
        />
        <Row
          className="dragVideoView py-4 mt-4 mx-2 flex-column"
          gutter={{ xs: 8, sm: 16, md: 20, lg: 32 }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{ position: "relative" }}
        >
          <Col lg={10} md={10} sm={24} xs={24}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className=" d-flex flex-column align-items-start">
                <div
                  className={
                    "uploadIconView d-flex align-items-center justify-content-center"
                  }
                >
                  <img src={textColor === "white" ? upload : upload_red} />
                </div>
                <p
                  className={`${textColor2} m-0 mt-1 mb-0 text-center`}
                  style={{ fontSize: "12px" }}
                >
                  Upload Video <span className="red">*</span>
                </p>
                <p className={`${textColor2} m-0 mt-3 mb-2 text-center`}>
                  Drag and drop here <br /> or
                </p>
                <div
                  className={!isSelected ? "browse-btn-disabled" : ""}
                  title={
                    !isSelected
                      ? "Select Emote or Video style above first"
                      : undefined
                  }
                >
                  <ButtonComponent
                    onClick={handleClick}
                    text={"Browse"}
                    height={40}
                  />
                </div>
                <input
                  type="file"
                  ref={hiddenFileInput}
                  onChange={uploadHandle}
                  style={{ display: "none" }}
                  accept="video/mp4,video/x-m4v,video/*"
                />
                <ErrorMessage
                  message={touched.video && errors.video ? errors.video : null}
                />
              </div>
            </form>
          </Col>
          {dragActive && (
            // Covers the whole dashed drop zone (not just the inner form),
            // so dropping anywhere in it works, not only over the button.
            // Shows visible feedback (not just an invisible hit-target) so
            // the user can see the entire box is a valid drop target.
            <div
              id="drag-file-element"
              className="upload-drop-overlay"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <p className="upload-drop-overlay__text">Drop your video here</p>
            </div>
          )}
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
          {imageUploadLoader && (
            <Row>
              <Col span={24}>
                <img src={loader} alt="loader" style={{ width: "80px" }} />
              </Col>
            </Row>
          )}

          <Col lg={24} md={24} sm={24} xs={24}>
            {selectedFileName && imageUpload ? (
              <>
                <p className={`${textColor2} m-0 mt-3 mb-2 ms-3`}>
                  {selectedFileName}
                </p>
                <Row>
                  <Col span={4}>
                    <img src={upload_file_icon} className="me-2" />
                  </Col>
                  <Col span={20}>
                    {isEmote ? (
                      <>
                        <Progress
                          percent={uploadProgress}
                          status={uploadProgress < 100 ? "active" : "success"}
                        />
                        <p
                          className={`${textColor3} m-0 mt-2 mb-2 text-center`}
                        >
                          {uploadProgress}% - {uploadStatus}
                        </p>
                      </>
                    ) : (
                      <>
                        <Progress percent={70} status="active" />
                        <p
                          className={`${textColor3} m-0 mt-2 mb-2 text-center`}
                        >
                          Uploading...
                        </p>
                      </>
                    )}
                  </Col>
                </Row>
              </>
            ) : (
              selectedFileName && (
                <>
                  <p className={`${textColor2} m-0 mt-3 mb-2 ms-3`}>
                    {selectedFileName}
                  </p>
                  <Row>
                    <Col span={4}>
                      <img src={upload_file_icon} className="me-2" />
                    </Col>
                    <Col span={20}>
                      <Progress percent={100} />
                      <p className={`${textColor3} m-0 mt-2 mb-2 text-center`}>
                        100% Uploaded
                      </p>
                    </Col>
                  </Row>
                </>
              )
            )}
          </Col>
        </Row>
        <div className="mt-4">
          <form>
            <div className="my-4">
              <p style={{ color: "#C44040" }} className="mb-2">
                NFT Name <span className="red">*</span>
              </p>
              <Input
                placeholder="NFT Name"
                className="greyBgInput"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                message={touched.name && errors.name ? errors.name : null}
              />
            </div>
            <div className="my-4">
              <p style={{ color: "#C44040" }} className="mb-2">
                Artist
              </p>
              <Input
                placeholder="Artist"
                className="greyBgInput"
                name="artist_name1"
                // value={userData?.full_name}
                value={values.artist_name1}
                // onChange={handleChange}
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
            <div className="my-4">
              <p style={{ color: "#C44040" }} className="mb-2">
                Category
              </p>
              <Select
                className="text-center greyBgInput"
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
            <div className="my-4">
              <p style={{ color: "#C44040" }} className="mb-2">
                Description <span className="red">*</span>
              </p>
              <Input.TextArea
                rows={4}
                className="greyBgInput"
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
              />
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default UploadVideoModal;
