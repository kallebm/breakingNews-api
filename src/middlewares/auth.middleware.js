import dotenv from "dotenv";
import userServices from "../services/user.service.js";
import jwt from "jsonwebtoken";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).send("sem auth");
    }

    const parts = authorization.split(" ");
    const [schema, token] = parts;

    if (parts.length !== 2) {
      return res.status(401).send("parts.length !== 2");
    }

    if (schema !== "Bearer") {
      return res.status(401).send("schema !== 'Bearer'");
    }

    jwt.verify(token, process.env.SECRET_JWT, async (error, decoded) => {
      if (error) {
        return res.status(401).send({ message: "Token Invalid" });
      }
      const user = await userServices.findByIdService(decoded.id);

      if (!user || !user.id) {
        return res.status(401).send({ message: "Token Invalid" });
      }

      req.userId = user.id;

      return next();
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
