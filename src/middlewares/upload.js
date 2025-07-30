import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import s3 from "../config/s3.js";

const bucketName = process.env.AWS_BUCKET_NAME || "bee-aplicativos-img";

// Multer vai guardar o arquivo em memória (buffer)
const upload = multer({ storage: multer.memoryStorage() });

export const uploadFileToS3 = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  };

  const parallelUploads3 = new Upload({
    client: s3,
    params: uploadParams,
  });

  await parallelUploads3.done();

  return fileName;
};

export default upload;
