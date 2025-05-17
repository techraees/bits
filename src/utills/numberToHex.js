import { ethers } from "ethers";

export const numToHex = (number) => {
  const hex = ethers.utils.hexValue(number);
  return hex;
};
