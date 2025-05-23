import { Router } from "express";
import categoryController from "../controllers/controller.category.js";
import jwt from "../jwt/token.js";

const routercategory = Router();

// Criar uma nova categoria
routercategory.post(
  "/categories",
  jwt.validateJWT,
  categoryController.createCategoryController
);

// Buscar uma categoria por ID e company_id
routercategory.get(
  "/categories/:category_id/:company_id",
  jwt.validateJWT,
  categoryController.getCategoryByIdAndCompanyIdController
);

// Listar todas as categorias de uma empresa
routercategory.get(
  "/categories/:company_id",
  jwt.validateJWT,
  categoryController.getCategoriesByCompanyIdController
);

// Atualizar categoria
routercategory.put(
  "/categories/:category_id",
  jwt.validateJWT,
  categoryController.updateCategoryController
);

// Deletar categoria
routercategory.delete(
  "/categories/:category_id",
  jwt.validateJWT,
  categoryController.deleteCategoryController
);

export default routercategory;
