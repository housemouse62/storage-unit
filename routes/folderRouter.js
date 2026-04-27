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
    const folderID = parseInt(req.params.folderID);
    if (isNaN(folderID)) return next(new Error("Invalid ID"));

    const folder = await prisma.folder.findUnique({
      where: { id: folderID },
    });
    const files = await prisma.file.findMany({
      where: { folderID: folderID },
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
    const folderID = parseInt(req.params.folderID);
    if (isNaN(folderID)) return next(new Error("Invalid ID"));

    await prisma.folder.delete({
      where: { id: folderID },
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
    const folderID = parseInt(req.params.folderID);
    if (isNaN(folderID)) return next(new Error("Invalid ID"));

    const folder = await prisma.folder.update({
      where: { id: folderID },
      data: { name: name },
    });
    const files = await prisma.file.findMany({
      where: { folderID: folderID },
    });
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
