import express from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { prisma } from "../db/prismaClient.js";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.render("index");
});

userRouter.get("/login", (req, res) => {
  res.render("loginPage");
});

userRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/folder",
    failureRedirect: "/login",
  }),
);

userRouter.get("/createUser", (req, res) => {
  res.render("createUserPage");
});

userRouter.post(
  "/createUser",
  body("confirmPassword").custom((value, { req }) => {
    const match = value === req.body.password;
    if (!match) throw new Error("Passwords do not match.");
    return true;
  }),
  async (req, res, next) => {
    const passwordErrors = validationResult(req);
    console.log(passwordErrors.array());
    if (!passwordErrors.isEmpty()) {
      const passwordErrorPayload = {
        passwordErrors: passwordErrors.array(),
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
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

userRouter.get("/loggedOut", (req, res) => {
  res.render("loggedOutPage");
});

export default userRouter;
