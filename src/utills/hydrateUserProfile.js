export function profileToUserData(GetProfile) {
  return {
    address: GetProfile.user_address,
    full_name: GetProfile.full_name,
    country: GetProfile.country,
    bio: GetProfile.bio,
    profileImg: GetProfile.profileImg,
    id: GetProfile.id,
    token: GetProfile.token,
    isLogged: true,
  };
}
export const emptyUserData = {
  address: "",
  full_name: "",
  country: "",
  bio: "",
  profileImg: "",
  id: "",
  token: "",
  isLogged: false,
};
