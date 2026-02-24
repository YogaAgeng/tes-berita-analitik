import { Router } from "express";
import {
  createNewsHandler,
  dashboardHandler,
  deleteNewsHandler,
  lastSyncHandler,
  listNewsHandler,
  syncNewsHandler,
  updateNewsHandler,
} from "../controllers/news.controller.js";

const router = Router();

router.get("/", listNewsHandler);
router.post("/", createNewsHandler);
router.put("/:id", updateNewsHandler);
router.delete("/:id", deleteNewsHandler);
router.post("/sync", syncNewsHandler);
router.get("/dashboard", dashboardHandler);
router.get("/last-sync", lastSyncHandler);

export default router;
