import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// 1. Configuração do cliente S3 (isso está correto)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 2. Função separada para deletar a imagem (isso foi corrigido)
const deleteImage = async (imageFileName) => {
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName || !imageFileName) {
    console.error("Nome do bucket ou do arquivo não fornecido para exclusão.");
    return;
  }

  const params = {
    Bucket: bucketName,
    Key: imageFileName,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
    console.log(`Imagem '${imageFileName}' excluída do S3 com sucesso.`);
  } catch (error) {
    console.error(`Erro ao deletar imagem '${imageFileName}' do S3:`, error);
    throw new Error(`Falha ao excluir a imagem do S3: ${imageFileName}`);
  }
};

// 3. Exporta as duas funcionalidades
export { s3Client, deleteImage };
