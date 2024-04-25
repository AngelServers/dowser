import { bold, red, yellow, blue, green, bgBlue } from "kleur";
import { Express, Request, Response } from "express";

const secured = [
  {
    method: "POST",
    path: "/create",
  },
  {
    method: "DELETE",
    path: "/versions",
  },
];
export default (app: Express) => {
  app.use((req: Request, res: Response, next: Function) => {
    const time = new Date().toISOString();
    console.log(`${time} ${bold(green(req.method))}: ${req.path}`);
    if (
      secured.some(
        (route) => route.method === req.method && req.path.includes(route.path)
      )
    ) {
      if (
        req.headers.authorization &&
        req.headers.authorization === `Bearer ${process.env.AUTH_KEY}`
      ) {
        return next();
      }
      return res.status(401).json({ error: "Unauthorized" });
    }
    return next();
  });
};
