import React from "react";
import Modal from "react-modal";
import { motion } from "framer-motion";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: "none",
    borderRadius: "1rem",
    background: "transparent",
  },
};

const nftData = [
  {
    title: "Redbull",
    price: "1.3 ETH",
    address: "0xbb1...8b903",
    note: "27 NFTs Available",
  },
  {
    title: "Fire NFT",
    price: "0.4 ETH",
    address: "0xbb1...8b903",
    note: "27 NFTs Available",
  },
  {
    title: "Speedy walkover",
    price: "1.3 ETH",
    address: "0xbb1...8b903",
    note: "27 NFTs Available",
  },
  {
    title: "Redbull",
    price: "1.3 ETH",
    address: "0xbb1...8b903",
    note: "1 NFT Available",
  },
];

const ListingModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-6 w-[600px] rounded-2xl shadow-xl text-gray-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-white bg-red-600 rounded-full w-6 h-6 flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl font-semibold">Listing</h2>
          </div>
          <div className="text-gray-400 text-xl">2 Auction</div>
        </div>

        <p className="text-gray-700 mb-4">
          <strong>Note:</strong> This Item Seller is Snap Boogie. Select Which
          NFT would you like to proceed with
        </p>

        <div className="flex space-x-2 mb-4">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm">
            Fixed Price NFTs
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm">
            Auctioned NFTs
          </button>
        </div>

        <div className="space-y-4">
          {nftData.map((nft, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="/nft-placeholder.png"
                  alt="NFT"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-red-600 font-semibold">{nft.title}</h3>
                  <p className="text-xs text-gray-500">
                    ("Bid on this batch" {nft.note})
                  </p>
                  <p className="text-sm text-gray-600">({nft.address})</p>
                </div>
              </div>
              <div className="text-blue-600 font-bold text-lg">{nft.price}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-2 mt-6 text-sm">
          <button className="text-gray-400">&#171;</button>
          <button className="text-gray-400">&#8249;</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded">1</button>
          <button className="text-gray-500">2</button>
          <button className="text-gray-500">3</button>
          <button className="text-gray-500">4</button>
          <button className="text-gray-500">5</button>
          <button className="text-gray-400">&#8250;</button>
          <button className="text-gray-400">&#187;</button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onRequestClose}
            className="bg-red-600 text-white px-6 py-2 rounded-full"
          >
            Close ✕
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ListingModal;
