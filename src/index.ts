// Logs
import { bold, red, yellow, blue, green, bgBlue } from "kleur";
import "dotenv/config";

// Check folders
if (!require("fs").existsSync("uploads")) {
  console.log(yellow(" ▸ Creating uploads directory..."));
  require("fs").mkdirSync("uploads");
}
if (!require("fs").existsSync("database")) {
  console.log(yellow(" ▸ Creating database directory..."));
  require("fs").mkdirSync("database");
}

// Database
import PouchDB from "pouchdb";
const db = {
  versions: new PouchDB("database/versions"),
  nodes: new PouchDB("database/nodes"),
};

// Storage
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Server
import express, { Express, Request, Response } from "express";
const app = express();

const nodeInfo = {
  nodeName: process.env.NODE_NAME || "",
  url: process.env.URL || "http://localhost/",
  ip: process.env.IP || "",
  port: process.env.PORT || 3000,
  version: require("../package.json").version,
};

console.log(green(" ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"));
console.log(green(" ┃                                        ┃"));
console.log(green(bold(" ┃         Starting Dowser Server         ┃")));
console.log(green(" ┃                                        ┃"));
console.log(green(" ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"));
console.log();
console.log("   " + green(` ▸ Node Name: `) + "   " + nodeInfo.nodeName);
console.log("   " + green(` ▸ Url:       `) + "   " + nodeInfo.url);
console.log("   " + green(` ▸ Ip:        `) + "   " + nodeInfo.ip);
console.log("   " + green(` ▸ Port:      `) + "   " + nodeInfo.port);
console.log("   " + green(` ▸ Version:   `) + "   " + nodeInfo.version);
console.log();

// --- Middleware ---
import middleware from "./config/middleware";
middleware(app);

// UI
app.get("/", (req, res) => {
  res.send("Dowser Server");
});

app.use(express.json());

// Bridge
import bridge from "./api/bridge";
bridge(app, db, upload, nodeInfo);

// --- Controllers ----
import controllers from "./api/controllers";
controllers(app, db, upload, nodeInfo);

// Not found
app.use(function (req, res) {
  res.status(404);
  res.send({ error: "Not found..." });
});

// Listen to port
app.listen(nodeInfo.port, () => {
  console.log(
    green(`  Server is running at ${blue(`http://localhost:${nodeInfo.port}`)}`)
  );
  console.log(
    green(`  Server is running at ${blue(`${nodeInfo.url}:${nodeInfo.port}`)}`)
  );
  console.log();
});
