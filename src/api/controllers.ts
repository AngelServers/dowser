import { DB, NodeInfo } from "@/types";
import { Express } from "express";
import multer from "multer";

export default (
  app: Express,
  db: DB,
  upload: multer.Multer,
  nodeInfo: NodeInfo
) => {
  // Get node information
  app.get("/node", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(nodeInfo);
  });

  // Get all versions
  app.get("/versions", (req, res) => {
    require("./versions/findMany")({
      req,
      res,
      db,
    });
  });
  // Get a version by id
  app.get("/versions/:id", (req, res) => {
    require("./versions/find")({
      req,
      res,
      db,
    });
  });

  // Create a version
  app.post("/create", upload.any(), (req, res) => {
    require("./versions/create")({
      req,
      res,
      db,
    });
  });

  // Remove a version
  app.delete("/versions/:id", (req, res) => {
    require("./versions/remove")({
      req,
      res,
      db,
    });
  });
};
