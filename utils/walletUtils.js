const { Keypair } = require("@solana/web3.js");

exports.generateWallet = () => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString("hex"),
  };
};