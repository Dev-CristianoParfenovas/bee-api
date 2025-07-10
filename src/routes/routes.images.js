import { Router } from "express";
import imageController from "../controllers/controller.images.js";

const roterImage = Router();

roterImage.post("/", (req, res) => imageController.createImage);
roterImage.get("/:productId", (req, res) => imageController.getImagesByProduct);
roterImage.put("/:id", (req, res) => imageController.updateImage);
roterImage.delete("/:id", (req, res) => imageController.deleteImage);

export default roterImage;
