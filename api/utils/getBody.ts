import { Request, Response } from "express";

export default function getBody(req: Request, res: Response) {
  return res.status(200).json(req.body)
}