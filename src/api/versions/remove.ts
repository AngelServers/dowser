import { DowserRequest } from "@/types";

module.exports = async ({ res, req, db }: DowserRequest) => {
  const { versions } = db;

  try {
    const founded = await versions.get(req.params.id);
    res.send(await versions.remove(founded));
  } catch (error) {
    res.status(404).send({ error: "Not found" });
  }
};
