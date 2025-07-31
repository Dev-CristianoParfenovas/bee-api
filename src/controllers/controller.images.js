import imageService from "../services/service.images.js";
import { uploadFileToS3 } from "../middlewares/upload.js";

// Inserir imagem
const insertImage = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { product_id, description, company_id } = req.body;

    if (!product_id || !req.file || !company_id) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // 📤 Faz upload da imagem para o S3 e pega o nome do arquivo
    const fileName = await uploadFileToS3(req.file);

    // 🧠 Constrói a URL pública da imagem (ajuste conforme sua configuração)
    const image_url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    const image = await imageService.insertImageService(
      product_id,
      image_url,
      description,
      company_id
    );

    res.status(201).json(image);
  } catch (error) {
    console.error("Erro ao inserir imagem:", error);
    res.status(500).json({ error: "Erro ao inserir imagem." });
  }
};

// Buscar imagens de um produto
const getImagesByProduct = async (req, res) => {
  try {
    const { product_id, company_id } = req.params;

    if (!product_id || !company_id) {
      return res
        .status(400)
        .json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const images = await imageService.getImagesService(product_id, company_id);
    res.status(200).json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    res.status(500).json({ error: "Erro ao buscar imagens." });
  }
};

// Deletar imagem
const deleteImage = async (req, res) => {
  try {
    const { image_id, company_id } = req.params;

    const deleted = await imageService.deleteImageService(image_id, company_id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Imagem não encontrada ou já excluída." });
    }

    res.status(200).json({ message: "Imagem excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    res.status(500).json({ error: "Erro ao deletar imagem." });
  }
};

export default {
  insertImage,
  getImagesByProduct,
  deleteImage,
};
