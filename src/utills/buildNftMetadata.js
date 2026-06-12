export const buildNftMetadata = ({
  name,
  description,
  video,
  image,
  category,
}) => ({
  name,
  description,
  image,
  animation_url: video,
  properties: {
    video,
    poster: image,
    ...(category ? { category } : {}),
  },
});
