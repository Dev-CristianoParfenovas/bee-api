import upload, { uploadFileToS3 } from "./upload.js"; // certifique-se que está importando certo

const uploadSingleImage = (req, res, next) => {
  const uploader = upload.single("image");

  uploader(req, res, async function (err) {
    if (err) {
      console.error("Erro no upload:", err);
      return res
        .status(400)
        .json({ message: "Erro ao processar imagem", error: err.message });
    }

    try {
      if (req.file) {
        const fileName = await uploadFileToS3(req.file);
        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        req.body.image_url = imageUrl; // adiciona ao corpo para o controller
      }
      next();
    } catch (uploadError) {
      console.error("Erro ao enviar imagem ao S3:", uploadError);
      return res
        .status(500)
        .json({
          message: "Falha ao enviar imagem ao S3",
          error: uploadError.message,
        });
    }
  });
};

export default uploadSingleImage;
