import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  create,
  findAll,
  topNews,
  findById,
  searchByTitle,
  byUser,
  update,
  erase,
  like,
  addComment,
  removeComment,
} from "../controllers/news.controller.js";
import { validId } from "../middlewares/global.middlewares.js";
const route = Router();

route.post("/", authMiddleware, create);
route.get("/", findAll);
route.get("/top", topNews);
route.get("/search", searchByTitle);
route.get("/byUser", authMiddleware, byUser);
route.patch("/like/:id", authMiddleware, like);
route.patch("/comment/:id", authMiddleware, addComment);
route.patch("/comment/:newsId/:commentId", authMiddleware, removeComment);
route.get("/byId/:id/", validId, authMiddleware, findById);
route.patch("/:id", authMiddleware, update);
route.delete("/:id", authMiddleware, erase);

export default route;
