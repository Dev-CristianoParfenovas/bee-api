import { Router } from "express";
import salesController from "../controllers/controller.sales.js";
import jwt from "../jwt/token.js";

const routersales = Router();

routersales.post(
  "/:company_id",
  jwt.validateJWT,
  salesController.createSaleController
);

routersales.get(
  "/most-sold/:company_id",
  salesController.getMostSoldProductsByDateRangeController
);

routersales.get(
  "/:company_id/date-range",
  jwt.validateJWT,
  salesController.getSalesByDateRangeController
);

routersales.get(
  "/:company_id",
  jwt.validateJWT,
  salesController.getSalesByCompanyIdController
);
routersales.get(
  "/:company_id/:id",
  jwt.validateJWT,
  salesController.getSaleByIdAndCompanyIdController
);

routersales.get(
  "/:company_id/vehicle/:vehicle_id",
  salesController.getSalesByVehicleIdController
);

routersales.get(
  "/:company_id/products-by-sale/:saleGroupId",
  jwt.validateJWT,
  salesController.getProductsBySaleIdController
);

routersales.put(
  "/:company_id/:id",
  jwt.validateJWT,
  salesController.updateSaleController
);
routersales.delete(
  "/:company_id/:id",
  jwt.validateJWT,
  salesController.deleteSaleController
);

export default routersales;
