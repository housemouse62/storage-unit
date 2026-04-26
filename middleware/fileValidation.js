import { fileTypeFromBuffer } from "file-type";

export const fileValidation = async (req, res, next) => {
  try {
    const filePath = req.file.buffer;
    const fileInfo = await fileTypeFromBuffer(filePath);
    const disAllowedTypes = ["zip", "exe"];
    if (!fileInfo || disAllowedTypes.includes(fileInfo.ext))
      return next(new Error("Invalid file type"));

    return next();
  } catch (error) {
    return next(new Error("External server error"));
  }
};
