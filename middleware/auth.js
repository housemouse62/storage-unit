function checkAuth(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect("/login");
}

export default checkAuth;
