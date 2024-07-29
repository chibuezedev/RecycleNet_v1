const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { upload } = cloudinary.uploader;

const getMB = (size) => Math.round(size / (1024 * 1024));

const cloudinaryUploader = async (document, rules) => {
  if (
    rules.allowedMimetypes &&
    !rules.allowedMimetypes.includes(document.mimetype)
  )
    throw new Error(`Invalid mimetype: ${document.mimetype}`);

  if (document.size > rules.maxSize)
    throw new Error(`File must not exceed ${getMB(rules.maxSize)} MB`);

  const uploadedFile = await upload(document.path, {
    folder: rules.folder,
    public_id: rules.publicId,
    overwrite: rules.overwrite,
    ...(rules.resourceType && { resource_type: rules.resourceType }),
  });

  return uploadedFile;
};

module.exports = cloudinaryUploader;
