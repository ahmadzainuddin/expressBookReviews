const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  // Authenticate requests to protected customer routes using session access token
  if (req.session && req.session.authorization) {
    const accessToken = req.session.authorization["accessToken"];
    if (!accessToken) {
      return res.status(403).json({ message: "No access token provided" });
    }
    jwt.verify(accessToken, "access", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "User not authenticated" });
      }
      req.user = user;
      return next();
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});
 
const PORT = process.env.PORT || 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
