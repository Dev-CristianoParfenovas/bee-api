import imageService from "../services/service.products.js";

const createImage = async (req, res) => {
  try {
    const { productId, filePath, description } = req.body;
    const image = await imageService.createImage(
      productId,
      filePath,
      description
    );
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getImagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = await imageService.getImagesByProduct(productId);
    res.status(200).json(images);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { filePath, description } = req.body;
    const updatedImage = await imageService.updateImage(
      id,
      filePath,
      description
    );
    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await imageService.deleteImage(id);
    res.status(200).json(deletedImage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default { createImage, getImagesByProduct, updateImage, deleteImage };
