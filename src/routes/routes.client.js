import { Router } from "express";
import clientController from "../controllers/controller.client.js";
import jwt from "../jwt/token.js";

const routerclient = Router();

// Rota para login do cliente (POST)
routerclient.post("/login", clientController.login);

routerclient.post("/", jwt.validateJWT, clientController.createOrUpdateClient);

// Rota para buscar clientes por company_id
routerclient.get("/", jwt.validateJWT, clientController.getClientsByCompany);

export default routerclient;
