import express from "express";
import checkAuth from "../middleware/auth.js";
import { prisma } from "../db/prismaClient.js";
import formatFileSize from "../utils/formatFileSize.js";

const shareRouter = express.Router();

shareRouter.get("/folder/:folderID", checkAuth, async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: parseInt(req.params.folderID) },
  });
  const files = await prisma.file.findMany({
    where: { folderID: parseInt(req.params.folderID) },
  });
  res.render("shareFolder", {
    folder: folder,
    files: files,
    formatFileSize: formatFileSize,
  });
});

shareRouter.post("/folder/:folderID", checkAuth, async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: parseInt(req.params.folderID) },
  });
  const files = await prisma.file.findMany({
    where: { folderID: parseInt(req.params.folderID) },
  });
  const shareLink = await prisma.shareLink.create({
    data: {
      folderID: parseInt(req.params.folderID),
      availableFor: parseInt(req.body.availableFor),
    },
  });
  res.render("shared", {
    folder: folder,
    files: files,
    formatFileSize: formatFileSize,
    shareLink: shareLink,
    shareURL: `${process.env.BASE_URL}/share/${shareLink.id}`,
  });
});

shareRouter.get("/:shareID", async (req, res) => {
  const shareInfo = await prisma.shareLink.findUnique({
    where: { id: req.params.shareID },
  });
  if (!shareInfo) {
    res.render("errorPage", {
      error: "Share link not found",
    });
    return;
  }
  // time now in ms
  const now = new Date().getTime();
  // length of time available in in ms
  const avail_ms = shareInfo.availableFor * 24 * 60 * 60 * 1000;
  // time since shareLink created
  const diff = now - shareInfo.createdAt;
  // time shareLink expired
  const expiredAt = new Date(shareInfo.createdAt.getTime() + avail_ms);

  const folder = await prisma.folder.findUnique({
    where: { id: shareInfo.folderID },
  });
  const files = await prisma.file.findMany({
    where: { folderID: shareInfo.folderID },
  });

  if (diff > avail_ms) {
    res.render("errorPage", {
      expired: expiredAt,
    });
  } else {
    res.render("sharedFolder", {
      folder: folder,
      files: files,
      formatFileSize: formatFileSize,
    });
  }
});

export default shareRouter;
