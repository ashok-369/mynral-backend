import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// ============================================================
// UPLOAD SINGLE IMAGE TO CLOUDINARY
// ============================================================

export const uploadToCloudinary = (
  buffer,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!buffer) {
        return reject(
          new Error("Image buffer is missing")
        );
      }

      const uploadOptions = {
        resource_type: "image",
        folder: options.folder || "mynral/products",
        ...options,
      };

      console.log(
        "Cloudinary upload started:",
        {
          folder: uploadOptions.folder,
          bufferSize: buffer.length,
        }
      );

      const uploadStream =
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error(
                "Cloudinary upload error:",
                error
              );

              return reject(error);
            }

            if (!result) {
              return reject(
                new Error(
                  "Cloudinary returned an empty result"
                )
              );
            }

            console.log(
              "Cloudinary upload successful:",
              {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
              }
            );

            resolve(result);
          }
        );

      streamifier
        .createReadStream(buffer)
        .pipe(uploadStream);

    } catch (error) {
      console.error(
        "Cloudinary upload exception:",
        error
      );

      reject(error);
    }
  });
};

// ============================================================
// UPLOAD MULTIPLE IMAGES
// ============================================================

export const uploadMultipleToCloudinary = async (
  files,
  options = {}
) => {
  if (!files || !Array.isArray(files)) {
    console.log(
      "Cloudinary: No files received"
    );

    return [];
  }

  if (files.length === 0) {
    console.log(
      "Cloudinary: Files array is empty"
    );

    return [];
  }

  console.log(
    `Cloudinary: Uploading ${files.length} image(s)`
  );

  const uploadedImages = [];

  for (const [index, file] of files.entries()) {
    try {
      if (!file.buffer) {
        throw new Error(
          `File ${index + 1} does not contain a buffer`
        );
      }

      console.log(
        `Uploading image ${index + 1}/${files.length}:`,
        {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }
      );

      const result = await uploadToCloudinary(
        file.buffer,
        options
      );

      uploadedImages.push({
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });

    } catch (error) {
      console.error(
        `Failed to upload image ${index + 1}:`,
        error
      );

      // Stop the complete upload operation
      // if any image fails.
      throw error;
    }
  }

  console.log(
    "All Cloudinary uploads completed:",
    uploadedImages
  );

  return uploadedImages;
};

// ============================================================
// DELETE SINGLE IMAGE
// ============================================================

export const deleteFromCloudinary = async (
  publicId
) => {
  if (!publicId) {
    return null;
  }

  try {
    console.log(
      "Deleting Cloudinary image:",
      publicId
    );

    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
        }
      );

    console.log(
      "Cloudinary delete result:",
      result
    );

    return result;

  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    throw error;
  }
};

// ============================================================
// DELETE MULTIPLE IMAGES
// ============================================================

export const deleteMultipleFromCloudinary =
  async (publicIds) => {
    if (
      !publicIds ||
      !Array.isArray(publicIds) ||
      publicIds.length === 0
    ) {
      return [];
    }

    const results = [];

    for (const publicId of publicIds) {
      if (!publicId) {
        continue;
      }

      try {
        const result =
          await deleteFromCloudinary(
            publicId
          );

        results.push({
          publicId,
          result: result?.result,
        });

      } catch (error) {
        console.error(
          `Failed to delete Cloudinary image ${publicId}:`,
          error
        );

        results.push({
          publicId,
          result: "failed",
          error: error.message,
        });
      }
    }

    return results;
  };