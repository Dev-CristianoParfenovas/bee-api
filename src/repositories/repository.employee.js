import pool from "../db/connection.js";
import jwt from "../jwt/token.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;

const loginEmployeeRepository = async (email, password) => {
  const query = `SELECT * FROM employees WHERE email = $1`;
  const values = [email];

  const result = await pool.query(query, values);

  // Verificar se o cliente existe
  if (result.rows.length === 0) {
    throw new Error("Cliente não encontrado");
  }

  const employee = result.rows[0];

  // Testando a senha fornecida contra o hash no banco de dados
  //console.log("Senha fornecida: " + password);
  //console.log("Hash armazenado no banco de dados: " + employee.password);

  // Verificar a senha
  const isPasswordValid = await bcrypt.compare(password, employee.password); // Sem .trim()
  console.log(
    "Senha fornecida (em bytes):",
    Buffer.from(password).toString("hex")
  );
  console.log(
    "Senha Bco (em bytes):",
    Buffer.from(employee.password).toString("hex")
  );

  console.log("Senha válida: " + isPasswordValid); // Log adicional

  if (!isPasswordValid) {
    throw new Error("Senha incorreta");
  }

  // Gerar o token JWT usando a função createJWT
  const token = jwt.createJWTEmployee(
    employee.id_employee,
    employee.company_id
  );
  const companyId = employee.company_id;

  return {
    token,
    employee: {
      id_employee: employee.id_employee,
      name: employee.name,
      email: employee.email,
      is_admin: employee.is_admin,
      companyId, //company_id: employee.company_id,
    },
  };
};

const createEmployee = async (name, email, phone, password, company_id) => {
  try {
    const checkQuery = `SELECT * FROM employees WHERE email = $1 AND company_id = $2;`;
    const checkValues = [email, company_id]; // Verifica também pelo company_id
    const checkResult = await pool.query(checkQuery, checkValues);

    // Gerar o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Senha hasheada:", hashedPassword);

    // Define phone como null se não for fornecido
    const phoneValue = phone || null;
    const companiId = company_id;
    console.log("ID EMPRESA:", companiId);

    if (checkResult.rows.length > 0) {
      // Atualizar funcionário existente
      const updateQuery = `
        UPDATE employees 
        SET name = $1, phone = $2, password = $3, is_admin = $4
        WHERE email = $5 AND company_id = $6 
        RETURNING *;
      `;
      const updateValues = [
        name,
        phoneValue,
        hashedPassword, // Use a senha hasheada ao atualizar
        false, // Sempre define is_admin como false
        email,
        companiId, //company_id,
      ];
      const updateResult = await pool.query(updateQuery, updateValues);

      //Lógica pra atualizar
      const updatedEmployee = updateResult.rows[0];
      // Agora, passe o company_id para a função de criação do token
      const token = jwt.createJWTEmployee(
        updatedEmployee.id_employee,
        updatedEmployee.company_id
      );

      return { employee: updatedEmployee, token };
    } else {
      // Inserir novo funcionário
      const insertQuery = `
        INSERT INTO employees (name, email, phone, password, company_id, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
      `;
      const insertValues = [
        name,
        email,
        phoneValue,
        hashedPassword, // Use a senha hasheada ao criar
        companiId, //company_id,
        false, // Sempre define is_admin como false
      ];
      const insertResult = await pool.query(insertQuery, insertValues);

      const newEmployee = insertResult.rows[0];
      // Agora, passe o company_id para a função de criação do token
      const token = jwt.createJWTEmployee(
        newEmployee.id_employee,
        newEmployee.company_id
      );

      return { employee: newEmployee, token };
    }
  } catch (error) {
    console.error("Erro ao criar ou atualizar funcionário:", error);
    throw error;
  }
};

// repository.employee.js

const getEmployeesByCompany = async (company_id) => {
  const query = `SELECT * FROM employees WHERE company_id = $1`;
  const values = [company_id];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error("Nenhum funcionário encontrado para essa empresa.");
  }

  return result.rows;
};

export default {
  createEmployee,
  loginEmployeeRepository,
  getEmployeesByCompany, // Nova função
};
