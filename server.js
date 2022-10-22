const express = require("express");
const bodyParser = require("body-parser");
const translate = require("google-translate-api-x");

const all = require("./languages").Language;

// Initialzie Express
const app = express();
let port = process.env.PORT || 3016;

// View Engine
app.set("view engine", "ejs");
app.set("views", "restAPI/views");

// Response Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

// parse application/json
app.use(bodyParser.json({ limit: "500mb", extended: true }));

// For CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.listen(port, async() => {
    console.info("Node server is running.");
});

function getData(response) {
    let dict = [];
    for (const e of response) {
        const translated = e.text;
        const original = e.raw[1][1];
        const fullname = getFullname(original);
        dict.push({ key: fullname, value: translated });
    }
    return dict;
}

function getFullname(shortcut) {
    const full_list = all.getAll();
    for (const key in full_list) {
        if (Object.hasOwnProperty.call(full_list, key)) {
            if (key === shortcut) {
                return full_list[key];
            }
        }
    }
}
app.get("/", (req, res) => {
    res.render("index", { result: "" });
});

app.post("/translate", async(req, res, next) => {
    const txt = req.body.txt;
    // testing
    //const langs = ["en", "ln"];
    const langs = all.getAll();
    let promises = [];

    try {
        console.log("translating... ");
        for (const lang in langs) {
            if (Object.hasOwnProperty.call(langs, lang)) {
                promises.push(
                    new Promise((rs, rj) => {
                        try {
                            rs(translate(txt, { to: lang }));
                            console.log(lang, " is completed");
                        } catch (error) {
                            rj(error);
                        }
                    })
                );
            }
        }
    } catch (error) {
        return res.status(401).render("index", err);
        //return res.status(401).send(error);
    }
    Promise.all(promises)
        .then((v) => {
            const result = getData(v);
            console.log(result);
            console.info("I finished, let me sleep now *___*");
            return res.status(200).render("index", { result: result });
        })
        .catch((err) => {
            return res.status(401).render("index", err);
            //return res.status(401).send(err);
        });
});

exports.app = app;