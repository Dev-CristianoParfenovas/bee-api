import { Router } from "express";
import salesController from "../controllers/controller.sales.js";
import jwt from "../jwt/token.js";

const routersales = Router();

routersales.post(
  "/sales/:company_id",
  jwt.validateJWT,
  salesController.createSaleController
);

routersales.get(
  "/sales/most-sold/:company_id",
  salesController.getMostSoldProductsByDateRangeController
);

routersales.get(
  "/sales/:company_id/date-range",
  jwt.validateJWT,
  salesController.getSalesByDateRangeController
);

routersales.get(
  "/sales/:company_id",
  jwt.validateJWT,
  salesController.getSalesByCompanyIdController
);
routersales.get(
  "/sales/:company_id/:id",
  jwt.validateJWT,
  salesController.getSaleByIdAndCompanyIdController
);

routersales.get(
  "/:company_id/vehicle/:vehicle_id",
  salesController.getSalesByVehicleIdController
);

routersales.put(
  "/sales/:company_id/:id",
  jwt.validateJWT,
  salesController.updateSaleController
);
routersales.delete(
  "/sales/:company_id/:id",
  jwt.validateJWT,
  salesController.deleteSaleController
);

export default routersales;
