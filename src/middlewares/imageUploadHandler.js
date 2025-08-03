import upload, { uploadFileToS3 } from "./upload.js";
import multer from "multer";

// Este é o middleware que será exportado e usado na rota
// Ele encapsula o Multer e a lógica de upload para o S3
const handleImageUpload = (req, res, next) => {
  // `upload.single("image")` é o middleware do Multer.
  // Ele processa a requisição e, se houver um arquivo com o campo "image",
  // o anexa a `req.file`.
  upload.single("image")(req, res, async (err) => {
    // Tratamento de erros do Multer, caso a requisição não seja válida
    if (err instanceof multer.MulterError) {
      console.error("Erro no Multer (MulterError):", err);
      return res
        .status(400)
        .json({ message: "Erro no upload da imagem", error: err.message });
    } else if (err) {
      console.error("Erro desconhecido no Multer:", err);
      return res
        .status(500)
        .json({ message: "Erro interno no servidor", error: err.message });
    }

    // Se não houver arquivo, a requisição continua sem erro de upload
    if (!req.file) {
      console.log(
        "Nenhum arquivo de imagem recebido. Continuando para a rota."
      );
      return next();
    }

    console.log("Arquivo recebido no Multer:", req.file);

    try {
      // Faz o upload do arquivo para o S3
      const fileName = await uploadFileToS3(req.file);

      // Constrói a URL da imagem e a anexa ao corpo da requisição
      const bucket = process.env.AWS_BUCKET_NAME || "bee-aplicativos-img";
      const imageUrl = `https://${bucket}.s3.amazonaws.com/${fileName}`;
      req.body.image_url = imageUrl;

      console.log("Imagem enviada com sucesso para S3:", imageUrl);
      // Continua para o próximo middleware/controller
      next();
    } catch (uploadError) {
      console.error("Erro ao enviar imagem ao S3:", uploadError);
      return res.status(500).json({
        message: "Erro ao enviar imagem ao S3",
        error: uploadError.message,
      });
    }
  });
};

export default handleImageUpload;
