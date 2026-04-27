import express from "express";
import checkAuth from "../middleware/auth.js";
import { prisma } from "../db/prismaClient.js";
import formatFileSize from "../utils/formatFileSize.js";

const folderRouter = express.Router();

folderRouter.use(checkAuth);

folderRouter.post("/create", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.redirect("/folder?error=name");
    }
    await prisma.folder.create({
      data: {
        name: name,
        ownerID: req.user.id,
      },
    });
    const folders = await prisma.folder.findMany();
    res.render("allFolders", { folders: folders, error: "" });
  } catch (err) {
    next(err);
  }
});

folderRouter.get("/:folderID", async (req, res, next) => {
  try {
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
      error: req.query.error,
    });
  } catch (err) {
    next(err);
  }
});

folderRouter.delete("/:folderID", async (req, res, next) => {
  try {
    await prisma.folder.delete({
      where: { id: parseInt(req.params.folderID) },
    });
    const folders = await prisma.folder.findMany();
    res.render("allFolders", { folders: folders, error: "" });
  } catch (err) {
    next(err);
  }
});

folderRouter.patch("/:folderID", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) {
      return res.redirect(`/folder/${req.params.folderID}?error=name`);
    }
    const folder = await prisma.folder.update({
      where: { id: parseInt(req.params.folderID) },
      data: { name: name },
    });
    console.log("req.params.folderID", req.params.folderID);
    const files = await prisma.file.findMany({
      where: { folderID: parseInt(req.params.folderID) },
    });
    console.log(folder);
    res.render("oneFolder", {
      folder: folder,
      files: files,
      formatFileSize: formatFileSize,
      error: "",
    });
  } catch (err) {
    next(err);
  }
});

folderRouter.get("/", async (req, res, next) => {
  try {
    const allFolders = await prisma.folder.findMany();

    res.render("allFolders", { folders: allFolders, error: req.query.error });
  } catch (err) {
    next(err);
  }
});

export default folderRouter;
