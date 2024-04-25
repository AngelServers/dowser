import { bold, red, yellow, blue, magenta, bgBlue } from "kleur";
import { DB, NodeInfo } from "@/types";
import { Express, Request, Response } from "express";
import multer from "multer";

import axios from "axios";

export default (
  app: Express,
  db: DB,
  upload: multer.Multer,
  nodeInfo: NodeInfo
) => {
  app.post("/bridge/subscribe", async (req, res) => {
    const { data }: { data: NodeInfo } = req.body;

    const existent = await db.nodes.get(data.nodeName).catch(() => {
      return null;
    });

    db.nodes
      .put(
        existent
          ? { ...existent, ...data }
          : {
              _id: data.nodeName,
              ...data,
            }
      )
      .then((response) => {
        console.log(magenta(" ▸ New node added"));
      });

    const nodes = await db.nodes
      .allDocs({ include_docs: true })
      .then((response) => {
        return response.rows.map((row) => row);
      });

    res.send(nodes);
  });

  const mainServer = process.env.MAIN_SERVER || null;
  const subscribeToMain = async () => {
    if (mainServer) {
      // Get and subscribe to other nodes
      console.log(bold(red(" ▸ Subscribing to main server")));
      const nodes = await axios
        .post(`${mainServer}/bridge/subscribe`, {
          data: nodeInfo,
        })
        .then((res) => {
          console.log(red(" ▸ Subscribed to main server"));
          return res.data;
        })
        .catch((error) => {
          console.log(red(" ▸ Failed to subscribe to main server"), error);
        });

      if (nodes) {
        nodes.forEach((nodeDoc: any) => {
          if (nodeDoc.doc.nodeName === nodeInfo.nodeName) return;
          presentToNode(nodeDoc.doc);
        });
      }
    }
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

  subscribeToMain();
};
