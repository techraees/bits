/* eslint-disable no-irregular-whitespace */
export const mintMessage = (username, nftName) => {
  return {
    subject: "Congratulations on Minting Your NFT on BITSNFT.com",
    message: `
Dear ${username},

We are thrilled to congratulate you on the successful minting of your NFT (Non-Fungible Token) on BITSNFT.com! Your creativity has found a new digital canvas, and your NFT is now ready to be showcased to the world.

Details of your minted NFT:

NFT Title: ${nftName}
Minting Date: ${new Date()}
Your NFT, titled ${nftName}, has been minted and is now a part of your BITSNFT collection. This is a significant achievement, and we're excited to see how your creation will captivate the NFT community.

Here's what you can do next:

View your newly minted NFT in your BITSNFT account.
Consider setting a price and listing it for sale on our marketplace to share your creation with collectors and enthusiasts.
Share your NFT with friends and on social media to gain recognition for your artistic talent.
If you have any questions or need assistance related to your minted NFT, please don't hesitate to reach out to our support team at Info@beautyinthestreets.com or contact page.

Thank you for choosing BITSNFT.com as your platform for minting and sharing NFTs. We look forward to witnessing your continued success and artistic contributions to the NFT community.

Sincerely,
The BITSNFT Team
        `,
  };
};

export const boughtMessage = (username, nftName, sellersUsername, nftPrice) => {
  return {
    subject: "Congratulations on Your NFT Purchase on BITSNFT.com",
    message: `
Dear ${username},

We are thrilled to congratulate you on your recent purchase of an NFT (Non-Fungible Token) on BITSNFT.com! You are now the proud owner of a unique digital asset that showcases your support for the world of digital art and collectibles.

Details of your NFT purchase:

NFT Title: ${nftName}
Seller's Username: ${sellersUsername}
Purchase Price: ${nftPrice}
Your NFT collection has grown with the addition of ${nftName}, and your account has been updated with the details of this exciting transaction.

Here's what you can do next:

View your newly acquired NFT in your BITSNFT account.
Explore and enjoy your digital asset, and consider sharing it with your fellow collectors and enthusiasts.
If you have any questions or need assistance related to your NFT purchase, please feel free to reach out to our support team at Info@beautyinthestreets.com or contact page.

Thank you for being a part of the BITSNFT.com community and supporting the world of NFTs. We look forward to your continued engagement and participation in our platform.

Sincerely,
The BITSNFT Team
    `,
  };
};
