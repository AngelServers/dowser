import { bold, red, yellow, blue, magenta, bgBlue } from "kleur";
import { DB, NodeInfo } from "@/types";
import { Express, Request, Response } from "express";
import axios from "axios";

import { db, nodeInfo } from "../index";

const cleanNodeInfo = (nodeInfo: NodeInfo) => {
  return {
    nodeName: nodeInfo.nodeName,
    url: nodeInfo.url,
    // ip: nodeInfo.ip,
    port: nodeInfo.port,
    version: nodeInfo.version,
  };
};

export const fetchVersions = async () => {
  // Ask to all nodes for their versions
  const nodes = await db.nodes
    .allDocs({ include_docs: true })
    .then((response) => {
      return response.rows.map((row) => row.doc);
    });

  nodes.forEach((node: any) => {
    if (node.url === nodeInfo.url) return;

    axios
      .get(`${node.url}/versions`)
      .then((res) => {
        console.log(
          magenta(" ▸ Versions from node: "),
          node.nodeName,
          res.data
        );
      })
      .catch((error) => {
        console.log(
          red(" ▸ Failed to get versions from node: "),
          node.nodeName
        );
      });
  });
};

export default (app: Express) => {
  app.get("/bridge/nodes", async (req, res) => {
    const nodes = await db.nodes
      .allDocs({ include_docs: true })
      .then((response) => {
        return response.rows.map((row) => row);
      });

    res.send(nodes);
  });

  // Subscribe to other nodes
  app.post("/bridge/subscribe", async (req, res) => {
    const { data }: { data: NodeInfo } = req.body;

    const existent = await db.nodes.get(data.nodeName).catch(() => {
      return null;
    });

    createOrUpdate(cleanNodeInfo(data)).then(() => {
      console.log(magenta(" ▸ New node added"));
    });

    const nodes = await db.nodes
      .allDocs({ include_docs: true })
      .then((response) => {
        return response.rows.map((row) => row);
      });

    res.send(nodes);
  });

  const createOrUpdate = (data: NodeInfo) => {
    return db.nodes
      .get(data.nodeName)
      .then(function (doc) {
        return db.nodes.put({
          _id: data.nodeName,
          _rev: doc._rev,
          ...cleanNodeInfo(data),
        });
      })
      .then(function (response) {
        console.log(magenta(" ▸ Node updated"));
      })
      .catch(function (err) {
        return db.nodes.put({
          _id: data.nodeName,
          ...cleanNodeInfo(data),
        });
      });
  };

  const startConnectionFlow = async () => {
    const mainServer = process.env.MAIN_SERVER || null;
    if (!mainServer) return;

    // Save my node information to DB

    await createOrUpdate(nodeInfo);

    // Ask to server for his connections
    if (mainServer === nodeInfo.url) return; // Avoid asking to myself

    console.log(bold(red(" ▸ Asking to main server")));
    axios
      .post(`${mainServer}/bridge/subscribe`, {
        data: nodeInfo,
      })
      .then((res) => {
        const nodes = res.data;
        if (!nodes) return;

        // Save getted nodes to DB
        nodes.forEach(async (nodeDoc: any) => {
          console.log(nodeDoc.doc);
          createOrUpdate(nodeDoc.doc).then(() => {
            console.log(
              magenta(` ▸ Node ${nodeDoc.doc.nodeName} added to database`)
            );
          });
        });

        nodes.forEach((nodeDoc: any) => {
          if (nodeDoc.doc.url === nodeInfo.url) return;
          presentToNode(nodeDoc.doc);
        });
      })
      .catch((error) => {
        console.log(red(" ▸ Failed to subscribe to main server"), error);
      });

    fetchVersions();
  };

  const presentToNode = (node: NodeInfo) => {
    console.log(red(" ▸ Presenting to node: "), node.nodeName);
    axios
      .post(`${node.url}/bridge/subscribe`, {
        data: nodeInfo,
      })
      .then((res) => {
        console.log(red(" ▸ Presented to node: "), node.nodeName);
      })
      .catch((error) => {
        console.log(red(" ▸ Failed to present to node: "), node.nodeName);
      });
  };

  startConnectionFlow();
};
