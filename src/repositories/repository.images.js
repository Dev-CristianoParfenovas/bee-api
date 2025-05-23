import pool from "../db/connection.js";

const createImage = async (productId, filePath, description) => {
  const query = `
        INSERT INTO images (product_id, file_path, description)
        VALUES ($1, $2, $3) RETURNING *;
      `;
  const values = [productId, filePath, description];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getImagesByProduct = async (productId) => {
  const query = `SELECT * FROM images WHERE product_id = $1;`;
  const result = await pool.query(query, [productId]);
  return result.rows;
};

const updateImage = async (id, filePath, description) => {
  const query = `
        UPDATE images 
        SET file_path = $1, description = $2
        WHERE id = $3 RETURNING *;
      `;
  const values = [filePath, description, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteImage = async (id) => {
  const query = `DELETE FROM images WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export default { createImage, getImagesByProduct, updateImage, deleteImage };
