import { DowserRequest, FileObject } from "@/types";

import { Express } from "express";

import { nodeInfo } from "@/index";

module.exports = async ({ req, res, db }: DowserRequest) => {
  const { versions } = db;
  const files = req.files;
  const { version } = req.body;
  const createdAt = new Date().toISOString();

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!version) {
    return res.status(400).json({ error: "No version provided" });
  }

  const parsedFiles: { [key: string]: FileObject } | undefined = {};
  const filesArr = Array.isArray(files) ? files : Object.keys(files);

  filesArr.forEach((file) => {
    if (!file || typeof file === "string") return;
    parsedFiles[file.fieldname] = {
      name: file.originalname,
      path: file.path,
      urL: `${nodeInfo.url}${file.path}`,
      filename: file.filename,
      mimetype: file.mimetype,
      encoding: file.encoding,
      size: file.size,
    };
  });

  const createdFile = await versions.post({
    _id: version,
    files: parsedFiles,
  });

  res.json({ ...createdFile });
};
