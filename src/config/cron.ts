import { fetchVersions } from "../api/bridge";
import cron from "node-cron";

export default () => {
  cron.schedule("*/10 * * * * *", () => {
    console.log(" ▸ Fetching versions");
    fetchVersions();
  });
};
