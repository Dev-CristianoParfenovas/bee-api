import { Router } from "express";
import imageController from "../controllers/controller.images.js";

const roterImage = Router();

roterImage.post("/images", (req, res) => imageController.createImage);
roterImage.get(
  "/images/:productId",
  (req, res) => imageController.getImagesByProduct
);
roterImage.put("/images/:id", (req, res) => imageController.updateImage);
roterImage.delete("/images/:id", (req, res) => imageController.deleteImage);

export default roterImage;
