import axios from "axios";
export const USDTOETH = async amount => {
  try {
    const response = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
    const price = await response.data.data.rates.USD;
    return amount / price;
  } catch (error) {}
};
export const USDTOMATIC = async amount => {
  try {
    const response = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=MATIC");
    const price = await response.data.data.rates.USD;
    return amount / price;
  } catch (error) {}
};
export const ETHTOUSD = async amount => {
  try {
    const response = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
    const price = await response.data.data.rates.USD;
    const finalAmount = amount * price;
    return finalAmount;
  } catch (error) {}
};
export const MATICTOUSD = async amount => {
  try {
    const response = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=MATIC");
    const price = await response.data.data.rates.USD;
    return amount * price;
  } catch (error) {}
};
