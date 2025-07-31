import pool from "../db/connection.js";

// Inserir imagem
const insertImage = async (product_id, image_url, description, company_id) => {
  try {
    const query = `
      INSERT INTO images (product_id, image_url, description, company_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [product_id, image_url, description, company_id];

    console.log("🧩 Salvando imagem no banco com URL:", image_url);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao inserir imagem:", error);
    throw error;
  }
};

// Buscar imagens por produto e empresa
const getImagesByProductId = async (product_id, company_id) => {
  const query = `
    SELECT * FROM images
    WHERE product_id = $1 AND company_id = $2
    ORDER BY created_at DESC;
  `;
  const values = [product_id, company_id];

  const result = await pool.query(query, values);
  return result.rows;
};

// Deletar imagem por ID e empresa
const deleteImageById = async (image_id, company_id) => {
  const query = `
    DELETE FROM images
    WHERE id = $1 AND company_id = $2
    RETURNING *;
  `;
  const values = [image_id, company_id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export default {
  insertImage,
  getImagesByProductId,
  deleteImageById,
};
