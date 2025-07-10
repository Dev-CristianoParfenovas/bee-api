import { Router } from "express";
import vehicleServices from "../controllers/controller.vehicle_services.js";

const routerVehicleservices = Router();

// Criar serviço de veículo (requer transação externa)
routerVehicleservices.post("/", vehicleServices.createVehicleServiceController);

// Buscar serviços com troca de óleo próxima
routerVehicleservices.get(
  "/upcoming",
  vehicleServices.getUpcomingOilChangesController
);

/*routerVehicleservices.get(
  "/history/:plate",
  vehicleServices.getVehicleHistoryController
);*/

export default routerVehicleservices;
