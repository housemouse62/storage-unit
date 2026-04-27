import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import expressSession from "express-session";
import passport from "./config/passport.js";
import { prisma } from "./db/prismaClient.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import fileRouter from "./routes/fileRouter.js";
import folderRouter from "./routes/folderRouter.js";
import userRouter from "./routes/userRouter.js";
import shareRouter from "./routes/shareRouter.js";
import formatDate from "./utils/formatDate.js";
import flash from "connect-flash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  cookieName: "x-csrf-token",
  getSessionIdentifier: (req) => req.sessionID,
  cookieOptions: { secure: false, sameSite: "strict", httpOnly: true },
  getCsrfTokenFromRequest: (req) => req.body?._csrf,
});

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(flash());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(doubleCsrfProtection);

app.use((req, res, next) => {
  res.locals.user = req.user || false;
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", userRouter);
app.use("/share", shareRouter);
app.use("/folder", folderRouter);
app.use("/file", fileRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("errorPage", {
    error: err.message,
    formatDate: formatDate,
    user: req.user || false,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}`);
});
