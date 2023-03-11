const express = require("express");
const mysql = require("mysql");
const util = require("util");
const cors = require("cors");
const bodyParser = require("body-parser");
const {check, validationResult} = require("express-validator");
const app = express();
app.use(cors());
let urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const connection = mysql.createConnection({
    host: "localhost",
    user: "username",
    password: "password",
    database: "diary"
});

connection.connect(function (error) {
    if (error) throw error;
    console.log("Connected to MySQL!");
});

const query = util.promisify(connection.query).bind(connection);

/**
 * Hakee kaikki merkinnät tietokannasta ja palauttaa nämä käytettäväksi
 */
app.get("/api/entries", function (req, res) {
    let sql = "SELECT * FROM entries";

    (async () => {
        try {
            let response = await query(sql);
            res.send(response);
        } catch (error) {
            console.log(error);
        }
    })();
});

/**
 * Lisää uuden validoidun merkinnän tietokantaan
 */
app.post("/api/new-entry", urlencodedParser, [
        check("Title").isLength({min: 1, max: 50}).withMessage("Min 1 character, max 50 characters."),
        check("Date").isDate().withMessage("Correct date"),
        check("Content").isLength({min: 1, max: 5000}).withMessage("Min 1 character, max 5000 characters.")
    ],
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let sql = "INSERT INTO entries (Title, Date, Content) VALUES (?,?,?)";

        (async () => {
            try {
                await query(sql, [req.body.Title, req.body.Date, req.body.Content]);
            } catch (error) {
                console.log(error);
            }
        })();
    });

/**
 * Poistaa halutun merkinnän tietokannasta
 */
app.post("/api/delete-entry", urlencodedParser, [
        check("Title").isLength({min: 1, max: 50}).withMessage("Min 1 character, max 50 characters."),
        check("Date").isDate().withMessage("Correct date"),
        check("Content").isLength({min: 1, max: 5000}).withMessage("Min 1 character, max 5000 characters.")
    ],
    function (req, res) {
        let sql = "DELETE FROM entries WHERE id=?";

        (async () => {
            try {
                await query(sql, [req.body.id]);
            } catch (error) {
                console.log(error);
            }
        })();
    });

/**
 * Päivittää haluttua merkintää validoiduilla tiedoilla tietokannassa
 */
app.post("/api/edit-entry", urlencodedParser, [
        check("Title").isLength({min: 1, max: 50}).withMessage("Min 1 character, max 50 characters."),
        check("Date").isDate().withMessage("Correct date"),
        check("Content").isLength({min: 1, max: 5000}).withMessage("Min 1 character, max 5000 characters.")
    ],
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let sql = "UPDATE entries SET Title = ?, Date = ?, Content = ? WHERE id = ?";

        (async () => {
            try {
                await query(sql, [req.body.Title, req.body.Date, req.body.Content, req.body.id]);
                res.status(200).send("ok");
            } catch (error) {
                console.log(error);
            }
        })();
    });

app.listen(8081, () => {
    console.log("Listening at http://localhost:8081/");
});