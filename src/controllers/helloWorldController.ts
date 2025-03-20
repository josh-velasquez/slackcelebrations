import { Request, Response } from "express";

export const getWelcomeMessage = (req: Request, res: Response) => {
  res.send("Welcome to Slack Celebrations!");
}