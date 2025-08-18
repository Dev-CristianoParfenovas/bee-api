import { Router } from "express";
import vehicleServices from "../controllers/controller.vehicle_services.js";
import jwt from "../jwt/token.js";

const routerVehicleservices = Router();

// Criar serviço de veículo (requer transação externa)
routerVehicleservices.post(
  "/",
  jwt.validateJWT,
  vehicleServices.createVehicleServiceController
);

// Buscar serviços com troca de óleo próxima
routerVehicleservices.get(
  "/upcoming",
  jwt.validateJWT,
  vehicleServices.getUpcomingOilChangesController
);

/*routerVehicleservices.get(
  "/history/:plate",
  vehicleServices.getVehicleHistoryController
);*/

export default routerVehicleservices;
