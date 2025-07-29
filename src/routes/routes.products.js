import { Router } from "express";
import productController from "../controllers/controller.product.js";
import jwt from "../jwt/token.js";
import handleImageUpload from "../middlewares/imageUploadHandler.js";
const routerproduct = Router();

// Rota para obter todos os produtos de um cliente
routerproduct.get(
  "/:company_id",
  jwt.validateJWT,
  productController.getProducts
);

routerproduct.get(
  "/stock/:company_id/:product_id",
  jwt.validateJWT,
  productController.getStockQuantity
);

// Rota para criar um novo produto
routerproduct.post(
  "/",
  jwt.validateJWT,
  handleImageUpload,
  (req, res, next) => {
    console.log("Recebido POST /products", { body: req.body, file: req.file });
    next();
  },
  productController.createOrUpdateProduct
);

routerproduct.put(
  "/stock/updatestockbarcode",
  jwt.validateJWT,
  productController.updateStockByBarcode
);

// Rota para atualizar um produto e seu estoque
routerproduct.put(
  "/:product_id",
  jwt.validateJWT,
  handleImageUpload,
  productController.updateProductAndStockController
);

// Rota para excluir um produto e seu estoque
routerproduct.delete(
  "/:productId",
  jwt.validateJWT,
  productController.deleteProductController
);

export default routerproduct;
