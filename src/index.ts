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

import express, { Express, Request, Response } from "express";
import multer from "multer";
import PouchDB from "pouchdb";

import middleware from "./config/middleware";
import bridge from "./api/bridge";
import controllers from "./api/controllers";

import Cron from "./config/cron";
Cron();

// Database
export const db = {
  versions: new PouchDB("./database/versions"),
  nodes: new PouchDB("./database/nodes"),
};

// Storage
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
const app = express();

require("os").hostname();

export const nodeInfo = {
  nodeName: process.env.NODE_NAME || "",
  url: process.env.URL || `http://${require("os").hostname()}/`,
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
// console.log("   " + green(` ▸ Ip:        `) + "   " + nodeInfo.ip);
console.log("   " + green(` ▸ Port:      `) + "   " + nodeInfo.port);
console.log("   " + green(` ▸ Version:   `) + "   " + nodeInfo.version);
console.log();

// --- Middleware ---
middleware(app);

// UI
app.use(express.static(process.cwd() + "/dashboard/dist/"));
app.get("/", (req, res) => {
  // Load html from /dashboard/dist/index.html
  res.sendFile(process.cwd() + "/dashboard/dist/index.html");
});

app.use(express.json());

// Bridge
bridge(app);

// --- Controllers ----
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
  console.log(green(`  Server is running at ${blue(nodeInfo.url)}`));
  console.log();
});
