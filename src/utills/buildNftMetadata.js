export const buildNftMetadata = ({
  name,
  description,
  video,
  image,
}) => ({
  name,
  description,
  image,
  animation_url: video,
  properties: {
    video,
  },
});
