import pool from "../db/connection.js";
import jwt from "../jwt/token.js";
import bcrypt from "bcrypt";

const loginClient = async (email, password) => {
  const query = `SELECT * FROM clients WHERE email = $1`;
  const values = [email];

  const result = await pool.query(query, values);

  // Verificar se o cliente existe
  if (result.rows.length === 0) {
    throw new Error("Cliente não encontrado");
  }

  const client = result.rows[0];

  // Verificar a senha
  const isPasswordValid = await bcrypt.compare(password, client.password);
  if (!isPasswordValid) {
    throw new Error("Senha incorreta");
  }

  // Gerar o token JWT usando a função createJWT
  const token = jwt.createJWT(client.id_user, client.company_id);

  return {
    token,
    client: {
      id_user: client.id_user,
      name: client.name,
      email: client.email,
      company_id: client.company_id,
    },
  };
};

const getClientsByCompany = async (company_id) => {
  try {
    console.log(
      "Recebendo request para buscar clientes da empresa:",
      company_id
    );

    const query = `SELECT * FROM clients WHERE company_id = $1`;
    const values = [company_id];
    const result = await pool.query(query, values);

    console.log("Resultado da consulta:", result.rows);

    return result.rows; // Retorna o array de clientes (vazio se não encontrar)
  } catch (error) {
    console.error("Erro ao buscar clientes no repositório:", error.message);
    throw new Error("Erro ao buscar clientes no banco de dados.");
  }
};

// Função para criar ou atualizar cliente
const createClient = async (name, email, phone, password, company_id) => {
  // Hash da senha antes de armazená-la no banco de dados
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
INSERT INTO clients (name, email, phone, password, company_id)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (email) 
DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  password = EXCLUDED.password,
  company_id = EXCLUDED.company_id,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;
  `;

  const values = [name, email, phone, hashedPassword, company_id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export default {
  createClient,
  loginClient,
  getClientsByCompany,
};
