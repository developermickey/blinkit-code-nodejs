const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadImageClodinary = async (image) => {
  try {
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blinkit" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = uploadImageClodinary;
