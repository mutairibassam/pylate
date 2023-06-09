const express = require("express");
const bodyParser = require("body-parser");
const translate = require("google-translate-api-x");

const language = require("./languages").Language;

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
    console.info(`Node server is running on port ${port}`);
});

/**
 *
 * @param {Object} response -> the actual response from google apis
 * @returns Object
 */
function getData(response) {
    let dict = [];
    for (const e of response) {
        // translated text
        const translated = e.text;
        // translated to
        const original = e.raw[1][1];
        // replace the abbreivation with the full name
        const fullname = getFullname(original);
        // store it in a new dict
        dict.push({ key: fullname, value: translated });
    }
    return dict;
}

// replace abbreviation with country full name
function getFullname(shortcut) {
    const full_list = language.getAll();
    for (const key in full_list) {
        if (Object.hasOwnProperty.call(full_list, key)) {
            if (key === shortcut) {
                return full_list[key];
            }
        }
    }
}

// app base url
app.get("/", (req, res) => {
    res.render("index", { result: "" });
});

// translate end-point
app.post("/translate", async(req, res, next) => {
    // get value to be translated
    const txt = req.body.txt;
    const group = req.body.flag;
    let langs = {}
    // get all supported languages
    if(group === "1") {
        langs = language.group1();
    } else if (group === "2") {
        langs = language.group2();
    } else if (group === "3") {
        langs = language.group3();
    } else if (group === "4") {
        langs = language.group4();
    } else if (group === "5") {
        langs = language.group5();
    } else if (group === "6") {
        langs = language.getAll();
    } else {
        return 'invalid group id'
    }

    // a new promise to have all
    let promises = [];

    try {
        console.log("translating... ");
        for (const lang in langs) {
            if (Object.hasOwnProperty.call(langs, lang)) {
                // create a new promise for each language
                promises.push(
                    new Promise((rs, rj) => {
                        try {
                            rs(translate(txt, { to: lang }));
                        } catch (error) {
                            console.log("promise error -> " + error); 
                            rj(error);
                        }
                    })
                );
            }
        }
    } catch (error) {
        // return error to ui
        console.log("first error -> " + error);
        return res.status(401).render("index", err);
    }

    // execute all promises
    Promise.all(promises)
        .then((v) => {
            const result = getData(v);
            console.info("I finished, let me sleep now *___*");
            // return result to ui
            return res.status(200).render("index", { result: result } );
        })
        .catch((err) => {
            // return error to ui
            console.log("second error -> " + err);
            return res.status(401).render("index", err);
        });
});

// translate end-point
app.post("/translate2", async(req, res, next) => {
    // get value to be translated
    const txt = req.body.txt;
    const group = req.body.flag;
    let langs = {}
    // get all supported languages
    if(group === "1") {
        langs = language.group1();
    } else if (group === "2") {
        langs = language.group2();
    } else if (group === "3") {
        langs = language.group3();
    } else if (group === "4") {
        langs = language.group4();
    } else if (group === "5") {
        langs = language.group5();
    } else if (group === "6") {
        langs = language.getAll();
    } else {
        return 'invalid group id'
    }

    // a new promise to have all
    let promises = [];

    try {
        console.log("translating... ");
        for (const lang in langs) {
            if (Object.hasOwnProperty.call(langs, lang)) {
                // create a new promise for each language
                promises.push(
                    new Promise((rs, rj) => {
                        try {
                            rs(translate(txt, { to: lang }));
                        } catch (error) {
                            console.log("promise error -> " + error); 
                            rj(error);
                        }
                    })
                );
            }
        }
    } catch (error) {
        // return error to ui
        console.log("first error -> " + error);
        return res.status(401).send({result: err});
    }

    // execute all promises
    Promise.all(promises)
        .then((v) => {
            const result = getData(v);
            console.info("I finished, let me sleep now *___*");
            // return result to ui
            return res.status(200).send({ result: result });
        })
        .catch((err) => {
            // return error to ui
            console.log("second error -> " + err);
            return res.status(401).send({result: err});
        });
});

exports.app = app;