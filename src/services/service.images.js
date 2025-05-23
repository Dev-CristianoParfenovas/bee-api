import imageRepository from "../repositories/repository.images.js";

const createImage = async (productId, filePath, description) => {
  if (!productId || !filePath) {
    throw new Error("Product ID and file path are required.");
  }
  return await imageRepository.createImage(productId, filePath, description);
};

const getImagesByProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required.");
  }
  return await imageRepository.getImagesByProduct(productId);
};

const updateImage = async (id, filePath, description) => {
  if (!id) {
    throw new Error("Image ID is required.");
  }
  return await imageRepository.updateImage(id, filePath, description);
};

const deleteImage = async (id) => {
  if (!id) {
    throw new Error("Image ID is required.");
  }
  return await imageRepository.deleteImage(id);
};

export default { createImage, getImagesByProduct, updateImage, deleteImage };
