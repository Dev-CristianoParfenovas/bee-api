import { Router } from "express";
import imageController from "../controllers/controller.images.js";
import handleImageUpload from "../middlewares/imageUploadHandler.js";
import jwt from "../jwt/token.js";

const routerImage = Router();

// Inserir imagem
routerImage.post(
  "/",
  jwt.validateJWT,
  handleImageUpload,
  (req, res, next) => {
    console.log("Recebendo upload de imagem...");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    next();
  },
  imageController.insertImage
);

// Buscar imagens por produto e empresa
routerImage.get(
  "/:product_id",
  jwt.validateJWT,
  imageController.getImagesByProduct
);

// Deletar imagem
routerImage.delete("/:image_id", jwt.validateJWT, imageController.deleteImage);

export default routerImage;
