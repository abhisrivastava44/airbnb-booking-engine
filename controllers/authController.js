const { request, response } = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (request, response, next) => {
  response.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    editing: false,
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};

exports.getSignup = (request, response, next) => {
  response.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    editing: false,
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
      user: {},
    },
  });
};

exports.postLogin = async (request, response, next) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email });
  if (!user) {
    return response.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "Login",
      isLoggedIn: false,
      errors: ["User does not exist."],
      oldInput: { email },
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return response.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid Password"],
      oldInput: { email },
      user: {},
    });
  }

  request.session.isLoggedIn = true;
  //   const plainUser = user.toObject();

  //   // Convert the complex BSON ObjectId into a simple string to avoid version crashes
  //   plainUser._id = plainUser._id.toString();

  //   // Save the safe, plain object to the session
  //   request.session.user = plainUser;
  //   // ==========================================

  //   request.session.save((err) => {
  //     if (err) {
  //       console.log("Session save error: ", err);
  //     }

  //     if (user.userType === "host") {
  //       response.redirect("/host/host-home-list");
  //     } else {
  //       response.redirect("/homes");
  //     }
  //   });
  // };
  request.session.user = {
    _id: user._id.toString(), // Convert to pure string
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
  };
  // ==========================================

  request.session.save((err) => {
    // Adding a console log here just in case!
    if (err) {
      console.error("CRITICAL Session save error: ", err);
      return response.redirect("/login");
    }

    // Now we safely redirect based on user role
    if (user.userType === "host") {
      response.redirect("/host/host-home-list");
    } else {
      response.redirect("/homes");
    }
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be atleast 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  check("lastName")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  check("email")
    .isEmail()
    .withMessage("Please Enter a valid Email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain atleast one lowercase character")
    .matches(/[A-Z]/)
    .withMessage("Password must contain atleast one uppercase character")
    .matches(/[0-9]/)
    .withMessage("Password must contain atleast one number")
    .matches(/[!@&]/)
    .withMessage("Password should must contain atleast one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user Type"),

  check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditons")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please accept the terms and conditions");
      }
      return true;
    }),

  (request, response, next) => {
    const { firstName, lastName, email, password, userType } = request.body;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((error) => error.msg),
        oldInput: { firstName, lastName, email, password, userType },
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
        });
        return user.save();
      })
      .then(() => {
        response.redirect("/login");
      })
      .catch((error) => {
        return response.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: [error.message],
          oldInput: { firstName, lastName, email, userType },
          user: {},
        });
      });
  },
];

exports.postLogout = (request, response, next) => {
  request.session.destroy(() => {
    response.redirect("/login");
  });
};
