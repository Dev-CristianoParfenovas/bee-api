import { Router } from "express";
import categoryController from "../controllers/controller.category.js";
import jwt from "../jwt/token.js";

const routercategory = Router();

// Criar uma nova categoria
routercategory.post(
  "/",
  jwt.validateJWT,
  categoryController.createCategoryController
);

// Buscar uma categoria por ID e company_id
routercategory.get(
  "/:category_id/:company_id",
  jwt.validateJWT,
  categoryController.getCategoryByIdAndCompanyIdController
);

// Listar todas as categorias de uma empresa
routercategory.get(
  "/:company_id",
  jwt.validateJWT,
  categoryController.getCategoriesByCompanyIdController
);

// Atualizar categoria
routercategory.put(
  "/:category_id",
  jwt.validateJWT,
  categoryController.updateCategoryController
);

// Deletar categoria
routercategory.delete(
  "/:category_id",
  jwt.validateJWT,
  categoryController.deleteCategoryController
);

export default routercategory;
