// middlewares/uploadMiddleware.js
import upload from "./upload"; // ou o caminho correto do seu upload configurado

const uploadSingleImage = (req, res, next) => {
  const uploader = upload.single("image");

  uploader(req, res, function (err) {
    if (err) {
      console.error("Erro no upload:", err);
      return res
        .status(400)
        .json({ message: "Erro ao processar imagem", error: err.message });
    }
    next();
  });
};

export default uploadSingleImage;
