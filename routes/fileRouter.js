import express from "express";
import { prisma } from "../db/prismaClient.js";
import checkAuth from "../middleware/auth.js";
import { check } from "express-validator";
import multer from "multer";
const upload = multer({ dest: "./public/uploads" });

const fileRouter = express.Router();

fileRouter.use(checkAuth);

fileRouter.get("/", async (req, res) => {
  const files = await prisma.file.findMany();
  res.render("allFiles", { files: files });
});

fileRouter.get("/:fileID", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.fileID) },
  });
  res.render("fileDetails", { file: file });
});

fileRouter.patch("/:fileID", async (req, res) => {
  const file = await prisma.file.update({
    where: { id: parseInt(req.params.fileID) },
    data: { folderID: req.body.folderID },
  });
  res.render("fileDetails", { file: file });
});

fileRouter.post("/upload", upload.single("uploaded_file"), function (req, res) {
  console.log(req.file, req.body);
  res.render("/folder");
});

export default fileRouter;
