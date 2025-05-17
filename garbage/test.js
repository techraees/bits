// // Create Transactions for Create NFT
// const createNftTransaction = await createNewTransation({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
//     first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
//     nft_id: "6658c6badb40134913175fca",
//     amount: 10.5,
//     currency: "ETH",
//     copies_transferred: 100,
//     transaction_type: "create_nft",
//     token_id: "1",
//     chain_id: "1",
//     copies_transferred: 12,
//   },
// });

// // Used to List Any Nft
// const listAnyNft = await createNewTransation({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
//     first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
//     nft_id: "6658c6badb40134913175fca",
//     amount: 10.5,
//     currency: "ETH",
//     copies_transferred: 100,
//     transaction_type: "listing_nft",
//     token_id: "1",
//     chain_id: "1",
//     blockchain_listingID: "listing_001",
//     listingID: "67bca4a0cc7a16835231eb20",
//   },
// });

// // Used to make transaction when someone buy nft from nft market place
// const buyNftFromNftMarketPlace = await createNewTransation({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
//     first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
//     second_person_wallet_address: "0x6934b7875fEABE4FA129D4988ca6DEcD1Dca9C2B",
//     nft_id: "6658c6badb40134913175fca",
//     amount: 10.5,
//     currency: "ETH",
//     copies_transferred: 100,
//     transaction_type: "buying_nft",
//     token_id: "1",
//     chain_id: "1",
//     blockchain_listingID: "listing_001",
//     listingID: "67bca4a0cc7a16835231eb20",
//   },
// });

// // Used to make transaction when someone sell nft from nft market place
// const sellingNftFromNftMarketPlace = await createNewTransation({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
//     first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
//     second_person_wallet_address: "0x6934b7875fEABE4FA129D4988ca6DEcD1Dca9C2B",
//     nft_id: "6658c6badb40134913175fca",
//     amount: 10.5,
//     currency: "ETH",
//     copies_transferred: 100,
//     transaction_type: "selling_nft",
//     token_id: "1",
//     chain_id: "1",
//     blockchain_listingID: "listing_001",
//     listingID: "67bca4a0cc7a16835231eb20",
//   },
// });

// // Used to make bidding transaction
// const biddingTransaction = await createNewTransation({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
//     first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
//     nft_id: "6658c6badb40134913175fca",
//     amount: 10.5,
//     currency: "ETH",
//     transaction_type: "bidding_transaction",
//     token_id: "1",
//     chain_id: "1",
//     blockchain_listingID: "listing_001",
//     listingID: "67bca4a0cc7a16835231eb20",
//   },
// });

// //   ============================== New Ownership =====================
// // Used to create new ownership
// const newOwnership = await createNewNftOwnership({
//   variables: {
//     token:
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
//     total_price: "120",
//     listingIDFromBlockChain: "listing_001",
//     listingID: "listing_001",
//     copies: 23,
//     pricePerItem: "12",
//     from_user_wallet: "0x8769",
//     to_user_wallet: "0x95",
//   },
// });

<>
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
    <strong>Note:</strong> This Item Seller is Snap Boogie. Select Which NFT
    would you like to proceed with
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
</>;
