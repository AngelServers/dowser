import { DowserRequest } from "@/types";

module.exports = async ({ req, res, db }: DowserRequest) => {
  const { versions } = db;
  res.json(
    await versions.get(req.params.id).catch(() => {
      return { error: "Not found" };
    })
  );
};
