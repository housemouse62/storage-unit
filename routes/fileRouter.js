import express from "express";
import { prisma } from "../db/prismaClient.js";
import checkAuth from "../middleware/auth.js";
import { check } from "express-validator";
import multer from "multer";
import formatFileSize from "../utils/formatFileSize.js";
import formatDate from "../utils/formatDate.js";
import cloudinary from "../config/cloudinary.js";

cloudinary.config({
  cloud_name: "dhslickhz",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  dest: "./public/uploads",
  limits: { fileSize: 4 * 1024 * 1024 },
});

const fileRouter = express.Router();

fileRouter.use(checkAuth);

fileRouter.get("/:fileID", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.fileID) },
  });
  res.render("fileDetails", {
    file: file,
    formatFileSize: formatFileSize,
    formatDate: formatDate,
    from: req.query.from || "/file",
  });
});

fileRouter.patch("/:fileID", async (req, res) => {
  const file = await prisma.file.update({
    where: { id: parseInt(req.params.fileID) },
    data: { folderID: req.body.folderID },
  });
  res.render("fileDetails", { file: file });
});

fileRouter.delete("/:fileID", async (req, res) => {
  await prisma.file.delete({
    where: { id: parseInt(req.params.fileID) },
  });
  res.redirect(req.body.from || "/file");
});

fileRouter.get("/:fileID/download", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.fileID) },
  });
  res.download(file.url, file.name);
});

fileRouter.post("/upload", async function (req, res) {
  upload.single("uploaded_file")(req, res, async (err) => {
    if (err) {
      res.redirect(`/folder/${req.body.folderID}?error=size`);
      return;
    }
    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log(result);
      const file = await prisma.file.create({
        data: {
          name: req.file.originalname,
          size: req.file.size,
          url: result.secure_url,
          ownerID: req.user.id,
          folderID: parseInt(req.body.folderID),
        },
      });
      console.log(result);

      res.redirect(`/folder/${req.body.folderID}`);
    } catch (error) {
      console.error(error);
    }
  });
});

fileRouter.get("/", async (req, res) => {
  const files = await prisma.file.findMany();
  res.render("allFiles", {
    files: files,
    formatFileSize: formatFileSize,
  });
});

export default fileRouter;
