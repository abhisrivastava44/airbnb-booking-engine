const Home = require("../models/home");
const fs = require("fs");
exports.getAddHome = (request, response, next) => {
  response.render("host/edit-home", {
    pageTitle: "Add Home for airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: request.isLoggedIn,
    user: request.session.user,
  });
};

exports.getEditHome = (request, response, next) => {
  const homeId = request.params.homeId;
  const editing = request.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return response.redirect("/host/host-home-list");
    }
    response.render("host/edit-home", {
      home: home,
      pageTitle: "Edit Your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: request.isLoggedIn,
      user: request.session.user,
    });
  });
};

exports.getHostHomes = (request, response, next) => {
  Home.find().then((registeredHomes) => {
    response.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: request.isLoggedIn,
      user: request.session.user,
    });
  });
};

exports.postAddHome = (request, response, next) => {
  const { houseName, price, location, rating, description } = request.body;
  console.log(request.file);
  if (!request.file) {
    return response.status(422).send("No image provided");
  }

  const photo = "/" + request.file.path.replace(/\\/g, "/");

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  home.save().then(() => {
    console.log("Homes Saved Successfully");
    response.redirect("/host/host-home-list");
  });
};

exports.postEditHome = (request, response, next) => {
  const { id, houseName, price, location, rating, description } = request.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;
      if (request.file) {
        if (home.photo) {
          // We remove the first character ('/') so it looks in the local project folder again.
          const oldPath = home.photo.substring(1);
          fs.unlink(home.photo, (error) => {
            if (error) {
              console.log("error while deleting file", error);
            }
          });
        }

        // Format the new updated photo path for the web
        home.photo = "/" + request.file.path.replace(/\\/g, "/");
      }
      home
        .save()
        .then((result) => {
          console.log("Home updated ", result);
          response.redirect("/host/host-home-list");
        })
        .catch((error) => {
          console.log("Error while updating ", error);
        });
    })
    .catch((error) => {
      console.log("Error while finding home ", error);
    });
};

exports.postDeleteHome = (request, response, next) => {
  const homeId = request.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      response.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error While deleting", error);
    });
};
