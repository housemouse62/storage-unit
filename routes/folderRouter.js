import express from "express";
import checkAuth from "../middleware/auth.js";
import { prisma } from "../db/prismaClient.js";
import formatFileSize from "../utils/formatFileSize.js";

const folderRouter = express.Router();

folderRouter.use(checkAuth);

folderRouter.get("/", async (req, res) => {
  const allFolders = await prisma.folder.findMany();

  res.render("allFolders", { folders: allFolders });
});

folderRouter.get("/:folderID", async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: parseInt(req.params.folderID) },
  });
  const files = await prisma.file.findMany({
    where: { folderID: parseInt(req.params.folderID) },
  });
  res.render("oneFolder", {
    folder: folder,
    files: files,
    formatFileSize: formatFileSize,
  });
});

folderRouter.post("/create", async (req, res) => {
  console.log(req.body);
  await prisma.folder.create({
    data: {
      name: req.body.name,
      ownerID: req.user.id,
    },
  });
  const folders = await prisma.folder.findMany();
  res.render("allFolders", { folders: folders });
});

folderRouter.delete("/:folderID", async (req, res) => {
  await prisma.folder.delete({
    where: { id: parseInt(req.params.folderID) },
  });
  const folders = await prisma.folder.findMany();
  res.render("allFolders", { folders: folders });
});

folderRouter.patch("/:folderID", async (req, res) => {
  const folder = await prisma.folder.update({
    where: { id: parseInt(req.params.folderID) },
    data: { name: req.body.name },
  });
  res.render("oneFolder", { folder: folder });
});

export default folderRouter;
