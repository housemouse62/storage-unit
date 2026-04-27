import express from "express";
import { prisma } from "../db/prismaClient.js";
import checkAuth from "../middleware/auth.js";
import { check } from "express-validator";
import multer from "multer";
import formatFileSize from "../utils/formatFileSize.js";
import formatDate from "../utils/formatDate.js";
import cloudinary from "../config/cloudinary.js";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import uploadToCloudinary from "../config/upload.js";
import { fileValidation } from "../middleware/fileValidation.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 },
});

const fileRouter = express.Router();

fileRouter.use(checkAuth);

fileRouter.get("/:fileID", async (req, res, next) => {
  try {
    const fileID = parseInt(req.params.fileID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const file = await prisma.file.findUnique({
      where: { id: fileID },
    });
    res.render("fileDetails", {
      file: file,
      formatFileSize: formatFileSize,
      formatDate: formatDate,
      from: req.query.from || "/file",
    });
  } catch (err) {
    next(err);
  }
});

fileRouter.patch("/:fileID", async (req, res, next) => {
  try {
    const fileID = parseInt(req.params.fileID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const file = await prisma.file.update({
      where: { id: fileID },
      data: { folderID: req.body.folderID },
    });
    res.render("fileDetails", { file: file });
  } catch (err) {
    next(err);
  }
});

fileRouter.delete("/:fileID", async (req, res, next) => {
  try {
    const fileID = parseInt(req.params.fileID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    await prisma.file.delete({
      where: { id: fileID },
    });
    res.redirect(req.body.from || "/file");
  } catch (err) {
    next(err);
  }
});

fileRouter.get("/:fileID/download", async (req, res, next) => {
  try {
    const fileID = parseInt(req.params.fileID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const file = await prisma.file.findUnique({
      where: { id: fileID },
    });
    res.download(file.url, file.name);
  } catch (err) {
    next(err);
  }
});

fileRouter.post("/upload", async function (req, res, next) {
  try {
    upload.single("uploaded_file")(req, res, async (err) => {
      if (err) {
        res.redirect(`/folder/${req.body.folderID}?error=size`);
        return;
      }
      fileValidation(req, res, async (validationErr) => {
        if (validationErr) {
          res.redirect(`/folder/${req.body.folderID}?error=filetype`);
          // handle errors
          return;
        }
        try {
          // Upload the image
          const file_info = await fileTypeFromBuffer(req.file.buffer);
          const file_type = file_info.ext;
          const new_file = await uploadToCloudinary(req.file.buffer);
          const file = await prisma.file.create({
            data: {
              name: req.file.originalname,
              size: req.file.size,
              url: new_file.secure_url,
              ownerID: req.user.id,
              folderID: parseInt(req.body.folderID),
              filetype: file_type,
            },
          });

          res.redirect(`/folder/${req.body.folderID}`);
        } catch (error) {
          console.error(error);
        }
      });
    });
  } catch (err) {
    next(err);
  }
});

fileRouter.get("/", async (req, res, next) => {
  try {
    const files = await prisma.file.findMany();
    res.render("allFiles", {
      files: files,
      formatFileSize: formatFileSize,
    });
  } catch (err) {
    next(err);
  }
});

export default fileRouter;
