// middlewares/imageUploadHandler.js
import upload, { uploadFileToS3 } from "./upload.js";

const handleImageUpload = (req, res, next) => {
  console.log("Content-Type recebido:", req.headers["content-type"]);

  if (
    req.headers["content-type"] &&
    req.headers["content-type"].startsWith("multipart/form-data")
  ) {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        console.error("Erro no upload:", err);
        return res.status(400).json({ message: "Erro ao processar imagem" });
      }

      try {
        if (req.file) {
          const fileName = await uploadFileToS3(req.file);
          const bucket = process.env.AWS_BUCKET_NAME || "bee-aplicativos-img";

          // monta a URL pública da imagem
          const imageUrl = `https://${bucket}.s3.amazonaws.com/${fileName}`;

          // adiciona no body para ser salvo pelo controller
          req.body.image_url = imageUrl;

          console.log("Imagem enviada com sucesso:", imageUrl);
        }
        next();
      } catch (uploadError) {
        console.error("Erro ao enviar imagem ao S3:", uploadError);
        return res
          .status(500)
          .json({
            message: "Erro ao enviar imagem",
            error: uploadError.message,
          });
      }
    });
  } else {
    // Se não for multipart, segue normalmente
    next();
  }
};

export default handleImageUpload;
