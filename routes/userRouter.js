import express from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prismaClient.js";
import rateLimit from "express-rate-limit";
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const userRouter = express.Router();

userRouter.get("/", (req, res, next) => {
  try {
    res.render("index");
  } catch (err) {
    next(err);
  }
});

userRouter.get("/login", (req, res, next) => {
  try {
    res.render("loginPage");
  } catch (err) {
    next(err);
  }
});

userRouter.post(
  "/login",
  authLimiter,
  passport.authenticate("local", {
    successRedirect: "/folder",
    failureRedirect: "/login",
  }),
);

userRouter.get("/createUser", (req, res, next) => {
  try {
    res.render("createUserPage");
  } catch (err) {
    next(err);
  }
});

userRouter.post(
  "/createUser",
  authLimiter,
  body("confirmEmail").custom((value, { req }) => {
    if (value !== req.body.email) throw new Error("Email addresses do not match.");
    return true;
  }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
  async (req, res, next) => {
    const formErrors = validationResult(req);
    if (!formErrors.isEmpty()) {
      const passwordErrorPayload = {
        passwordErrors: formErrors.array(),
        formData: req.body,
      };

      return res.status(400).render("createUserPage", {
        ...passwordErrorPayload,
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          password: hashedPassword,
          name: req.body.name,
        },
      });
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/folder");
      });
    } catch (err) {
      return next(err);
    }
  },
);

userRouter.post("/logOut", (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
});

userRouter.get("/loggedOut", (req, res, next) => {
  try {
    res.render("loggedOutPage");
  } catch (err) {
    next(err);
  }
});

export default userRouter;
