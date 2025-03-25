import React, { useState, useRef } from "react";
import { upload, upload_file_icon, upload_red, loader } from "../../assets";
import { ButtonComponent } from "../index";
import { Modal, Row, Col, Progress, Input, Select } from "antd";
import "./css/index.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { uploadValidation } from "../validations";
import ErrorMessage from "../error";
import { useMutation } from "@apollo/client";
import { CREATE_SIGNED_URL_FOR_NFTS } from "../../gql/mutations";
import { sendMetaToIPFS, sendFileToStorj } from "../../config/ipfsService";
import ToastMessage from "../toastMessage";
import { handleDeepMotionUpload } from "../../config/deepmotion";

const UploadVideoModal = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
    values,
    touched,
    errors,
  } = useFormik({
    initialValues: {
      name: "",
      artist_name1: "",
      description: "",
      video: "",
      meta: "",
    },
    validate: uploadValidation,
    onSubmit: async (values) => {
      const data = {
        name: values.name,
        description: values.description,
        image: values.video,
        properties: {
          video: values.video,
        },
      };
      const metaUri = await sendMetaToIPFS(data);

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

  // const { createNft } = useSelector((state) => state.nft.createNft);

  const hiddenFileInput = useRef(null);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleSelect = (value) => {
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
    if (isSelected) {
      setImageUploadLoader(true);
      const fileUploaded = event.target.files[0];

      if (fileUploaded) {
        const videoElement = document.createElement("video");

        videoElement.onloadedmetadata = () => {
          setFieldValue("video_duration", Math.round(videoElement.duration));
        };

        videoElement.src = URL.createObjectURL(fileUploaded);
        await videoElement.load();
      }

      // Check if file type is .avi
      if (fileUploaded.type === "video/avi") {
        ToastMessage(
          "Uploading .avi files is not allowed. Please select another file.",
          "",
          "error",
        );
      } else {
        if (isEmote) {
          setSelectedFileName(fileUploaded.name);
          setImageUpload(true);
          const response = await handleDeepMotionUpload(
            fileUploaded,
            fileUploaded.name,
          );
          if (response) {
            const url = await sendFileToStorj(
              response.mp4,
              isEmote,
              createSignedUrl,
            );
            setImageUpload(false);

            setFieldValue("video", url);
            setFieldValue("isEmote", true);
            setFieldValue("download", response);
          } else {
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

          setFieldValue("video", url);
          setFieldValue("isEmote", false);
          setFieldValue("download", {});
        }
      }
    } else {
      ToastMessage("Please Select a style", "", "error");
    }
    setImageUploadLoader(false);
  };

  const [dragActive, setDragActive] = React.useState(false);

  window.addEventListener(
    "dragover",
    function (e) {
      e.preventDefault();
    },
    false,
  );
  window.addEventListener("drop", async (e) => {
    if (isSelected) {
      e.preventDefault();

      if (e.dataTransfer.files[0]) {
        const fileUploaded = e.dataTransfer.files[0];

        if (fileUploaded.type === "video/avi") {
          ToastMessage(
            "Uploading .avi files is not allowed. Please select another file.",
            "",
            "error",
          );
        } else {
          if (isEmote) {
            setSelectedFileName(fileUploaded.name);
            setImageUpload(true);
            const response = await handleDeepMotionUpload(
              fileUploaded,
              fileUploaded.name,
            );
            if (response) {
              const url = await sendFileToStorj(
                response.mp4,
                isEmote,
                createSignedUrl,
              );
              setImageUpload(false);

              setFieldValue("video", url);
              setFieldValue("isEmote", true);
              setFieldValue("download", response);
            } else {
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

            setFieldValue("video", url);
            setFieldValue("isEmote", false);
            setFieldValue("download", {});
          }
        }
      }
    } else {
      ToastMessage("Please Select a style", "", "error");
    }
  });

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
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // handleFiles(e.dataTransfer.files);
    }
  };

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
          Upload Emote/Video
        </p>
        <Select
          className="text-center mt-3"
          defaultValue="Select style"
          style={{
            width: "100%",
          }}
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
        <Row
          className="dragVideoView py-4 mt-4 mx-2 flex-column"
          gutter={{ xs: 8, sm: 16, md: 20, lg: 32 }}
        >
          <Col lg={10} md={10} sm={24} xs={24}>
            <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
              <div className=" d-flex flex-column align-items-center">
                <div
                  className={
                    "uploadIconView d-flex align-items-center justify-content-center"
                  }
                >
                  <img src={textColor === "white" ? upload : upload_red} />
                </div>
                <p className={`${textColor2} m-0 mt-3 mb-2 text-center`}>
                  Drag and drop here <br /> or
                </p>
                <ButtonComponent
                  onClick={handleClick}
                  text={"Browse"}
                  height={40}
                />
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
                {dragActive && (
                  <div
                    id="drag-file-element"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  ></div>
                )}
              </div>
            </form>
          </Col>
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
                    <Progress percent={70} status="exception" />
                    <p className={`${textColor3} m-0 mt-2 mb-2 text-center`}>
                      70% Uploaded
                    </p>
                  </Col>
                </Row>

                {/* <div className="">
                  <img src={upload_file_icon} className="me-2" />
                  <Progress percent={70} status="exception" />
                  <p className={`${textColor3} m-0 mt-2 mb-2 text-center`}>70% Uploaded</p>
                </div> */}
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
                Dance Moment Name
              </p>
              <Input
                placeholder="Dance Moment Name"
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
                value={values.artist_name1}
                onChange={handleChange}
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
                Description
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
