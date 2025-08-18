import { Router } from "express";
import salesController from "../controllers/controller.sales.js";
import jwt from "../jwt/token.js";

const routersales = Router();

// A validação do token injetará o company_id em req
routersales.post("/", jwt.validateJWT, salesController.createSaleController);

routersales.get(
  "/most-sold",
  jwt.validateJWT,
  salesController.getMostSoldProductsByDateRangeController
);

routersales.get(
  "/date-range",
  jwt.validateJWT,
  salesController.getSalesByDateRangeController
);

routersales.get(
  "/",
  jwt.validateJWT,
  salesController.getSalesByCompanyIdController
);
routersales.get(
  "/:id",
  jwt.validateJWT,
  salesController.getSaleByIdAndCompanyIdController
);

routersales.get(
  "/vehicle/:vehicle_id",
  salesController.getSalesByVehicleIdController
);

routersales.get(
  "/products-by-sale/:saleGroupId",
  jwt.validateJWT,
  salesController.getProductsBySaleIdController
);

routersales.put("/:id", jwt.validateJWT, salesController.updateSaleController);

routersales.delete(
  "/:id",
  jwt.validateJWT,
  salesController.deleteSaleController
);

export default routersales;
