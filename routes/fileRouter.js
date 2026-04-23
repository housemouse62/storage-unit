import express from "express";
import { prisma } from "../db/prismaClient.js";
import checkAuth from "../middleware/auth.js";
import { check } from "express-validator";
import multer from "multer";
import formatFileSize from "../utils/formatFileSize.js";
const upload = multer({ dest: "./public/uploads" });

const fileRouter = express.Router();

fileRouter.use(checkAuth);

fileRouter.get("/:fileID", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.fileID) },
  });
  res.render("fileDetails", { file: file, formatFileSize: formatFileSize });
});

fileRouter.patch("/:fileID", async (req, res) => {
  const file = await prisma.file.update({
    where: { id: parseInt(req.params.fileID) },
    data: { folderID: req.body.folderID },
  });
  res.render("fileDetails", { file: file });
});

fileRouter.get("/:fileID/download", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.fileID) },
  });
  res.download(file.url, file.name);
});

fileRouter.post(
  "/upload",
  upload.single("uploaded_file"),
  async function (req, res) {
    console.log("body body body", req.body);
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        ownerID: req.user.id,
        folderID: parseInt(req.body.folderID),
      },
    });
    res.redirect(`/folder/${req.body.folderID}`);
  },
);

fileRouter.get("/", async (req, res) => {
  const files = await prisma.file.findMany();
  res.render("allFiles", {
    files: files,
    formatFileSize: formatFileSize,
  });
});

export default fileRouter;
