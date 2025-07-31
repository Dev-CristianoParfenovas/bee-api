import imageRepository from "../repositories/repository.images.js";

const insertImageService = async (
  product_id,
  image_url,
  description,
  company_id
) => {
  return await imageRepository.insertImage(
    product_id,
    image_url,
    description,
    company_id
  );
};

const getImagesService = async (product_id, company_id) => {
  return await imageRepository.getImagesByProductId(product_id, company_id);
};

const deleteImageService = async (image_id, company_id) => {
  return await imageRepository.deleteImageById(image_id, company_id);
};

export default {
  insertImageService,
  getImagesService,
  deleteImageService,
};
