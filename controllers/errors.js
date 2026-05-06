exports.pageNotFound = (request, response, next) => {
  response.status(400).render("404", {
    pageTitle: "Page Not Found",
    currentPage: "",
    isLoggedIn: request.isLoggedIn,
    user: request.session.user,
  });
};
