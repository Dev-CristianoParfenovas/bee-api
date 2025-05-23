import { Router } from "express";
import clientController from "../controllers/controller.client.js";

const routerclient = Router();

// Rota para login do cliente (POST)
routerclient.post("/client/login", clientController.login);

routerclient.post("/client", clientController.createOrUpdateClient);

// Rota para buscar clientes por company_id
routerclient.get("/clients/:company_id", clientController.getClientsByCompany);

export default routerclient;
