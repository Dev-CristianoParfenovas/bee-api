import { Router } from "express";
import controllerVehicles from "../controllers/controller.vehicles.js";

const routerVehicles = Router();

// 📌 Rota para criar veículo (com senha)
routerVehicles.post("/vehicles", controllerVehicles.createVehicle);

// 📌 Rota para buscar veículos de um cliente específico
routerVehicles.get(
  "/vehicles/:company_id/:client_id",
  controllerVehicles.getVehiclesByClient
);

// 📌 Rota para login de veículo (com placa e senha)
routerVehicles.post("/vehicles/login", controllerVehicles.loginVehicle);

routerVehicles.delete(
  "/vehicles/:id_vehicle",
  controllerVehicles.deleteVehicle
);

export default routerVehicles;
