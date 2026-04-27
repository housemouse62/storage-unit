import express from "express";
import checkAuth from "../middleware/auth.js";
import { prisma } from "../db/prismaClient.js";
import formatFileSize from "../utils/formatFileSize.js";
import formatDate from "../utils/formatDate.js";

const shareRouter = express.Router();

shareRouter.get("/folder/:folderID", checkAuth, async (req, res, next) => {
  try {
    const folderID = parseInt(req.params.folderID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const folder = await prisma.folder.findUnique({
      where: { id: folderID },
    });
    const files = await prisma.file.findMany({
      where: { folderID: folderID },
    });
    res.render("shareFolder", {
      folder: folder,
      files: files,
      formatFileSize: formatFileSize,
    });
  } catch (err) {
    next(err);
  }
});

shareRouter.post("/folder/:folderID", checkAuth, async (req, res, next) => {
  try {
    const folderID = parseInt(req.params.folderID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const folder = await prisma.folder.findUnique({
      where: { id: folderID },
    });
    const files = await prisma.file.findMany({
      where: { folderID: folderID },
    });
    const days = parseInt(req.body.availableFor);
    if (isNaN(days) || days < 1 || days > 365) {
      return res.render("shareFolder", {
        folder: folder,
        files: files,
        error: "Duration must be between 1 and 365 days",
      });
    }
    const folderID = parseInt(req.params.folderID);
    if (isNaN(fileID)) return next(new Error("Invalid ID"));

    const shareLink = await prisma.shareLink.create({
      data: {
        folderID: folderID,
        availableFor: days,
      },
    });

    res.render("shared", {
      folder: folder,
      files: files,
      formatFileSize: formatFileSize,
      shareLink: shareLink,
      shareURL: `${process.env.BASE_URL}/share/${shareLink.id}`,
    });
  } catch (err) {
    next(err);
  }
});

shareRouter.get("/:shareID", async (req, res, next) => {
  try {
    const shareInfo = await prisma.shareLink.findUnique({
      where: { id: req.params.shareID },
    });
    if (!shareInfo) {
      res.render("errorPage", {
        error: "Share link not found",
        formatDate: formatDate,
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
        formatDate: formatDate,
      });
    } else {
      res.render("sharedFolder", {
        folder: folder,
        files: files,
        formatFileSize: formatFileSize,
        formatDate: formatDate,
        expiredAt: expiredAt,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default shareRouter;
