const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const dotenv = require("dotenv");
const path = require("path");
const { VALIDATION_DEMANDE_ABSENCE } = require("./app/cron/VALIDATION_DEMANDE_ABSENCE");

const app = express();

app.use(express.static('./public'))
dotenv.config({ path: path.join(__dirname, "./.env") });

// parse requests of content-type: application/json
app.use(bodyParser.json());
app.set('view engine','ejs');

// Setup server port
const port = process.env.PORT || 8080;
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
        res.json({ message: "Welcome to Activite API." });
});

require("./app/routes/activite.route")(app);

// set port, listen for requests
app.listen(port, () => {
        VALIDATION_DEMANDE_ABSENCE()
        console.log("Server is running on port 8080.");
});

