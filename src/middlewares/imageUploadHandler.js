// middlewares/imageUploadHandler.js
import upload, { uploadFileToS3 } from "./upload.js";

const handleImageUpload = upload.single("image");

export default async (req, res, next) => {
  console.log("Entrou no middleware, req.file:", req.file);
  handleImageUpload(req, res, async (err) => {
    if (err) {
      console.error("Erro no multer:", err);
      return res.status(400).json({ message: "Erro ao processar imagem" });
    }

    try {
      if (req.file) {
        // Faz upload do arquivo para o S3
        const fileName = await uploadFileToS3(req.file);

        const bucket = process.env.AWS_BUCKET_NAME || "bee-aplicativos-img";
        // Monta a URL pública da imagem
        const imageUrl = `https://${bucket}.s3.amazonaws.com/${fileName}`;

        // Adiciona a URL da imagem no corpo da requisição para o controller usar
        req.body.image_url = imageUrl;

        console.log("Imagem enviada com sucesso:", imageUrl);
      } else {
        console.log("Nenhum arquivo recebido");
      }

      // Continua para o próximo middleware/controller
      next();
    } catch (uploadError) {
      console.error("Erro ao enviar imagem ao S3:", uploadError);
      return res.status(500).json({
        message: "Erro ao enviar imagem",
        error: uploadError.message,
      });
    }
  });
};
