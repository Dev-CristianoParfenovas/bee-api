import { Router } from "express";
import imageController from "../controllers/controller.images.js";
import handleImageUpload from "../middlewares/imageUploadHandler.js";

const routerImage = Router();

// Inserir imagem
routerImage.post(
  "/",
  handleImageUpload,
  (req, res, next) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    next();
  },
  imageController.insertImage
);

// Buscar imagens por produto e empresa
routerImage.get("/:product_id/:company_id", imageController.getImagesByProduct);

// Deletar imagem
routerImage.delete("/:image_id/:company_id", imageController.deleteImage);

export default routerImage;
