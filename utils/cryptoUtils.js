const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY, "hex");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex"); // Ensure this matches the format

exports.encrypt = (data) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (encrypted) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
