const express = require("express");
const app = express();
const port = 8000;

// const cookieParser = require("cookie-parser");
// const expressLayouts = require("express-ejs-layouts");
// const session = require("express-session");
// const passport = require("passport");
// const passportLocal = require("");


app.listen(port, function (err) {
    if (err) {
        console.log(`Error in running the server: ${err}`);
        return;
    }
    console.log(`Server is running on the port: ${port}`);
});