const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (request, response, next) => {
  Home.find().then((registeredHomes) => {
    response.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: request.isLoggedIn,
      user: request.session.user,
    });
  });
};

exports.getHomes = (request, response, next) => {
  Home.find().then((registeredHomes) => {
    response.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "homes",
      isLoggedIn: request.isLoggedIn,
      user: request.session.user,
    });
  });
};

exports.getBookings = (request, response, next) => {
  {
    response.render("store/bookings", {
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: request.isLoggedIn,
      user: request.session.user,
    });
  }
};

exports.getFavouriteList = async (request, response, next) => {
  const userId = request.session.user._id;
  const user = await User.findById(userId).populate("favourites");

  response.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: request.isLoggedIn,
    user: request.session.user,
  });
};

exports.postAddToFavourite = async (request, response, next) => {
  const homeId = request.body.id;
  const userId = request.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }

  response.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (request, response, next) => {
  const homeId = request.params.homeId;
  const userId = request.session.user._id;
  const user = await User.findById(userId);

  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(
      (fav) => fav.toString() != homeId.toString(),
    );
    await user.save();
  }
  response.redirect("/favourites");
};

exports.getHomeDetails = (request, response, next) => {
  const homeId = request.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      response.redirect("/homes");
    } else {
      response.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: request.isLoggedIn,
        user: request.session.user,
      });
    }
  });
};
