import { Router } from "express";
import clientController from "../controllers/controller.client.js";

const routerclient = Router();

// Rota para login do cliente (POST)
routerclient.post("/login", clientController.login);

routerclient.post("/", clientController.createOrUpdateClient);

// Rota para buscar clientes por company_id
routerclient.get("/:company_id", clientController.getClientsByCompany);

export default routerclient;
