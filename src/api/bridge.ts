import { bold, blue, yellow, magenta, bgBlue } from "kleur";
import { DB, NodeInfo } from "@/types";
import { Express, Request, Response } from "express";
import axios from "axios";

import { db, nodeInfo } from "../index";

const createOrUpdateNode = (data: NodeInfo) => {
  return db.nodes
    .get(data.nodeName)
    .then(function (doc) {
      return db.nodes.put({
        _id: data.nodeName,
        _rev: doc._rev,
        ...cleanNodeInfo(data),
      });
    })
    .then(() => {
      console.log(magenta(" ▸ Node updated"));
    })
    .catch(() => {
      return db.nodes.put({
        _id: data.nodeName,
        ...cleanNodeInfo(data),
      });
    });
};

const createOrUpdateVersion = (data: any) => {
  console.log(data._id);
  return db.versions
    .get(data._id)
    .then((doc) => {
      return db.versions.put({
        _id: data._id,
        _rev: doc._rev,
        ...data,
      });
    })
    .then(() => {
      console.log(magenta(" ▸ Versions updated"));
    })
    .catch(() => {
      return db.versions.put({
        _id: data._id,
        ...data,
      });
    });
};

const cleanNodeInfo = (nodeInfo: NodeInfo) => {
  return {
    nodeName: nodeInfo.nodeName,
    url: nodeInfo.url,
    // ip: nodeInfo.ip,
    port: nodeInfo.port,
    version: nodeInfo.version,
    location: nodeInfo.location,
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
        // Save gotten versions
        res.data.forEach((version: any) => {
          createOrUpdateVersion(version.doc).then(() => {
            console.log(magenta(" ▸ Versions added to database"));
          });
        });
      })
      .catch((error) => {
        console.log(
          blue(" ▸ Failed to get versions from node: "),
          node.nodeName
        );
      });
  });
};

const startConnectionFlow = async () => {
  const mainServer = process.env.MAIN_SERVER || null;
  if (!mainServer) return;

  // Save my node information to DB

  await createOrUpdateNode(nodeInfo);

  // Ask to server for his connections
  if (mainServer === nodeInfo.url) return; // Avoid asking to myself

  console.log(bold(blue(" ▸ Asking to main server")));
  await axios
    .post(`${mainServer}/bridge/subscribe`, {
      data: nodeInfo,
    })
    .then((res) => {
      const nodes = res.data;
      if (!nodes) return;

      // Save gotten nodes to DB
      nodes.forEach(async (nodeDoc: any) => {
        createOrUpdateNode(nodeDoc.doc).then(() => {
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
      console.log(blue(" ▸ Failed to subscribe to main server"), error);
    });

  fetchVersions();
};

const presentToNode = (node: NodeInfo) => {
  console.log(blue(" ▸ Presenting to node: "), node.nodeName);
  axios
    .post(`${node.url}/bridge/subscribe`, {
      data: nodeInfo,
    })
    .then((res) => {
      console.log(blue(" ▸ Presented to node: "), node.nodeName);
    })
    .catch((error) => {
      console.log(blue(" ▸ Failed to present to node: "), node.nodeName);
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

  app.get("/bridge/sync", async (req, res) => {
    console.log(bold(blue(" ▸ Syncing")));

    startConnectionFlow();
  });

  // Subscribe to other nodes
  app.post("/bridge/subscribe", async (req, res) => {
    const { data }: { data: NodeInfo } = req.body;

    createOrUpdateNode(cleanNodeInfo(data)).then(() => {
      console.log(magenta(" ▸ New node added"));
    });

    const nodes = await db.nodes
      .allDocs({ include_docs: true })
      .then((response) => {
        return response.rows.map((row) => row);
      });

    res.send(nodes);
  });

  startConnectionFlow();
};
