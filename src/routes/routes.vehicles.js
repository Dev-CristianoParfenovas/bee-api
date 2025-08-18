import { Router } from "express";
import controllerVehicles from "../controllers/controller.vehicles.js";
import jwt from "../jwt/token.js";

const routerVehicles = Router();

// 📌 Rota para criar veículo (com senha)
routerVehicles.post("/", jwt.validateJWT, controllerVehicles.createVehicle);

// 📌 Rota para buscar veículos de um cliente específico
routerVehicles.get(
  "/:client_id",
  jwt.validateJWT,
  controllerVehicles.getVehiclesByClient
);

// 📌 Rota para login de veículo (com placa e senha)
routerVehicles.post("/login", jwt.validateJWT, controllerVehicles.loginVehicle);

routerVehicles.delete(
  "/:id_vehicle",
  jwt.validateJWT,
  controllerVehicles.deleteVehicle
);

export default routerVehicles;
