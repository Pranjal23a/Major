const express = require("express");
const app = express();
const port = 8000;   //Port number at which server is running.


// Here basically we are using routes index file after coming in this file
app.use('/', require('./routes/index'));

// Setting up our view Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// This is to run the server
app.listen(port, function (err) {
    if (err) {
        console.log(`Error in running the server: ${err}`);
        return;
    }
    console.log(`Server is running on the port: ${port}`);
});