import { DowserRequest } from "@/types";

module.exports = async ({ res, db }: DowserRequest) => {
  const { versions } = db;

  const allVersions = await versions.allDocs({ include_docs: true });

  res.json(allVersions.rows);
};
