// Create Transactions for Create NFT
const createNftTransaction = await createNewTransation({
  variables: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDQxNjExOSwiZXhwIjoxNzQwNTAyNTE5fQ.nQw7eeMRIMJmj6zGWjmP-8l0RV8jApDg0WsaKpuP6tQ",
    first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
    nft_id: "6658c6badb40134913175fca",
    amount: 10.5,
    currency: "ETH",
    copies_transferred: 100,
    transaction_type: "create_nft",
    token_id: "1",
    chain_id: "1",
    copies_transferred: 12,
  },
});

// Used to List Any Nft
const listAnyNft = await createNewTransation({
  variables: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
    first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
    nft_id: "6658c6badb40134913175fca",
    amount: 10.5,
    currency: "ETH",
    copies_transferred: 100,
    transaction_type: "listing_nft",
    token_id: "1",
    chain_id: "1",
    blockchain_listingID: "listing_001",
    listingID: "67bca4a0cc7a16835231eb20",
  },
});

// Used to make transaction when someone buy nft from nft market place
const buyNftFromNftMarketPlace = await createNewTransation({
  variables: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
    first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
    second_person_wallet_address: "0x6934b7875fEABE4FA129D4988ca6DEcD1Dca9C2B",
    nft_id: "6658c6badb40134913175fca",
    amount: 10.5,
    currency: "ETH",
    copies_transferred: 100,
    transaction_type: "buying_nft",
    token_id: "1",
    chain_id: "1",
    blockchain_listingID: "listing_001",
    listingID: "67bca4a0cc7a16835231eb20",
  },
});

// Used to make transaction when someone sell nft from nft market place
const sellingNftFromNftMarketPlace = await createNewTransation({
  variables: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
    first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
    second_person_wallet_address: "0x6934b7875fEABE4FA129D4988ca6DEcD1Dca9C2B",
    nft_id: "6658c6badb40134913175fca",
    amount: 10.5,
    currency: "ETH",
    copies_transferred: 100,
    transaction_type: "selling_nft",
    token_id: "1",
    chain_id: "1",
    blockchain_listingID: "listing_001",
    listingID: "67bca4a0cc7a16835231eb20",
  },
});



// Used to make bidding transaction
const biddingTransaction = await createNewTransation({
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
      first_person_wallet_address: "0x6588110c61280f68275bf852fC2C12CED740e8d9",
      nft_id: "6658c6badb40134913175fca",
      amount: 10.5,
      currency: "ETH",
      transaction_type: "bidding_transaction",
      token_id: "1",
      chain_id: "1",
      blockchain_listingID: "listing_001",
      listingID: "67bca4a0cc7a16835231eb20"
    },
  });




//   ============================== New Ownership =====================
// Used to create new ownership
const newOwnership = await createNewNftOwnership({
    variables: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWU1ODAyYzBiNGJmN2E5ZjNhMDI1YSIsImlhdCI6MTc0MDg5NzE0NCwiZXhwIjoxNzQwOTgzNTQ0fQ.qbkY31xW-g8dW5fhjrISObz1EGvJjUMPUOZuB6TTZuA",
      total_price: "120",
      listingIDFromBlockChain: "listing_001",
      listingID: "listing_001",
      copies: 23,
      pricePerItem: "12",
      from_user_wallet: "0x8769",
      to_user_wallet: "0x95",
    },
  });