require("dotenv").config()
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const client = new MongoClient(`mongodb+srv://admin:${process.env.MONGO_PASS}@cluster.bp7gi.mongodb.net/`);
const users = client.db("database").collection("users");
const docs = client.db("database").collection("documents");

const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use("/images/favicon.png", express.static(path.join(__dirname, "public", "images", "favicon.png")))
app.use(express.static("public"))
app.set("view engine", "pug");

async function middleware(req, res, next) {
    if (req.cookies.userId) {
        const user = await users.findOne({ _id: ObjectId.createFromHexString(req.cookies.userId) });
        if (user) {
            res.locals.user = user;
        } else {
            res.clearCookie("userId");
        }
    }
    next();
}

app.get("/", middleware, (req, res) => {
    res.render("home", {
        title: "Home",
    });
});

app.get("/about", middleware, (req, res) => {
    res.render("about", {
        title: "More Information",
    });
});

app.get("/login", middleware, async (req, res) => {
    if (res.locals.user) {
        res.redirect("/dashboard");
        return;
    }

    res.render("login", {
        title: "Login",
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("userId");

    res.render("logout", {
        title: "Logout",
    });
})

app.get("/create-document", middleware, (req, res) => {
    if (!res.locals.user || res.locals.user.type != "School") {
        res.redirect("/");
        return;
    }

    res.render("createDocument", {
        title: "Create Document",
    });
})

app.post("/create-document", middleware, async (req, res) => {
    if (!res.locals.user || res.locals.user.type != "School") {
        res.redirect("/");
        return;
    }

    await docs.insertOne({
        student: req.body.student,
        school: res.locals.user.username,
        image: req.body.image,
        name: req.body.name,
    });

    res.sendStatus(200);
})

app.post("/authorize", async (req, res) => {
    const user = await users.findOne({ username: req.body.username, password: req.body.password });
    if (!user) {
        res.sendStatus(401);
    } else {
        res.statusCode = 200;
        res.cookie("userId", user._id);
        res.end();
    }
});

app.get("/dashboard", middleware, async (req, res) => {
    if (!res.locals.user) {
        res.redirect("/");
        return;
    }
    var documents;
    if (res.locals.user.type == "School") {
        documents = docs.find({ school: res.locals.user.username });
    } else {
        documents = docs.find({ student: res.locals.user.username });
    }

    const fetched = [];
    for await (const doc of documents) {
        fetched.push(doc);
    }

    res.render("dashboard", {
        title: "Dashboard",
        documents: fetched,
    });
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Server online on port", PORT);
});