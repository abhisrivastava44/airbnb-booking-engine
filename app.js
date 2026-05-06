//core module
const path = require("path");
const fs = require("fs");

//external module
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const DB_PATH = process.env.MONGODB_URI;

//local module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDirectory = require("./utilities/pathUtil");
const errorsController = require("./controllers/errors");

const { error } = require("console");
const { request } = require("http");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    const dir = "uploads";

    // Check if the directory exists, if not, create it!
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (request, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (request, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = {
  storage,
  fileFilter,
};

app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single("photo"));
app.use(express.static(path.join(rootDirectory, "public")));
app.use("/uploads", express.static(path.join(rootDirectory, "uploads")));
// app.use("/host/uploads", express.static(path.join(rootDirectory, "uploads")));
// app.use("/homes/uploads", express.static(path.join(rootDirectory, "uploads")));
app.use(
  session({
    secret: "Srivast@4103a",
    resave: false,
    saveUninitialized: true,
    store: store, //due to this session values starts to get stored in the DB instead of memory
  }),
);
app.use((request, response, next) => {
  request.isLoggedIn = request.session.isLoggedIn;
  next();
});
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (request, response, next) => {
  // 1. Check if they are logged in at all
  if (!request.isLoggedIn) {
    return response.redirect("/login");
  }

  // 2. Check if the logged-in user is actually a host
  // We check if request.session.user exists, and if their type is NOT host
  if (request.session.user && request.session.user.userType !== "host") {
    return response.redirect("/homes");
  }

  // If they are logged in and are a host, allow them to proceed to the host routes
  next();
});

app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3001;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to mongoDB");

    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`server is running on address http://localhost:${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.log("Error while connecting to Mongo: ", error);
  });

module.exports = app;
