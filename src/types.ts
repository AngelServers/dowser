import { Request, Response } from "express";

// Types
export interface DowserRequest {
  req: Request;
  res: Response;
  db: DB;
}

export interface DB {
  [key: string]: PouchDB.Database;
}

export interface NodeInfo {
  nodeName: string;
  url: string;
  // ip: string;
  port: string | number;
  version: any;
  location: string;
}

export type FileObject = {
  name: string;
  path: string;
  urL: string;
  filename: string;
  mimetype: string;
  encoding: string;
  size: number;
};
