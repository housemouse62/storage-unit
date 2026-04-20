import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import methodOverride from "method-override";
import expressSession from "express-session";
import passport from "./config/passport.js";
import { prisma } from "./db/prismaClient.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import fileRouter from "./routes/fileRouter.js";
import folderRouter from "./routes/folderRouter.js";
import userRouter from "./routes/userRouter.js";
import shareRouter from "./routes/shareRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || false;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use("/", userRouter);
app.use("/share", shareRouter);
app.use("/folder", folderRouter);
app.use("/file", fileRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}`);
});
