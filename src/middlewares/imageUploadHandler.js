import upload from "./upload.js";

const handleImageUpload = (req, res, next) => {
  console.log("Content-Type recebido:", req.headers["content-type"]);

  if (
    req.headers["content-type"] &&
    req.headers["content-type"].startsWith("multipart/form-data")
  ) {
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("Erro no upload:", err);
        return res.status(400).json({ message: "Erro ao processar imagem" });
      }
      console.log("Requisição sem multipart/form-data - seguindo direto");
      next();
    });
  } else {
    // Não é multipart, segue sem arquivo
    next();
  }
};

export default handleImageUpload;
