import pool from "../db/connection.js";

const createCategory = async (name, company_id) => {
  const query = `
    INSERT INTO categories (name, company_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  const values = [name, company_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getCategoryByIdAndCompanyId = async (id, company_id) => {
  const query = `
    SELECT * FROM categories
    WHERE id = $1 AND company_id = $2
  `;
  const values = [id, company_id];

  const result = await pool.query(query, values);
  return result.rows[0]; // Retorna a categoria encontrada ou undefined se não existir
};

const getCategoriesByCompanyId = async (company_id) => {
  console.log("company_id recebido no repositório:", company_id); // Confirmação do ID no repositório
  console.log("Tipo de company_id no repositório:", typeof company_id); // Confirmação do tipo

  try {
    console.log(
      "Recebendo request para buscar categorias da empresa:",
      company_id
    );

    const query = `SELECT * FROM categories WHERE company_id = $1`;
    const values = [company_id];
    const result = await pool.query(query, values);

    console.log("Resultado da consulta:", result.rows);

    return result.rows; // Retorna o array de clientes (vazio se não encontrar)
  } catch (error) {
    console.error("Erro ao buscar clientes no repositório:", error.message);
    throw new Error("Erro ao buscar clientes no banco de dados.");
  }

  /*try {
    const result = await pool.query(query, [company_id]);
    return result.rows;
  } catch (error) {
    console.error("Erro ao obter categorias no repositório:", error);
    throw error;
  }*/
};

const updateCategory = async (category_id, name, company_id) => {
  const query = `
    UPDATE categories
    SET name = $1
    WHERE id = $2 AND company_id = $3
    RETURNING *
  `;
  const values = [name, category_id, company_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteCategory = async (category_id, company_id) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1 AND company_id = $2
    RETURNING *
  `;
  const values = [category_id, company_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export default {
  createCategory,
  getCategoriesByCompanyId,
  getCategoryByIdAndCompanyId,
  updateCategory,
  deleteCategory,
};
