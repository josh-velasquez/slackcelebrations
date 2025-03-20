import express from "express";
import { getWelcomeMessage } from "../controllers/helloWorldController";

const mainRouter = express.Router();

mainRouter.get("/", getWelcomeMessage);

export { mainRouter };