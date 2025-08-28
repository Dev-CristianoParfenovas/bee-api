import pool from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "../jwt/token.js";

const createCompanyAndEmployee = async (name, email, password, is_admin) => {
  try {
    // Inicia uma transação
    await pool.query("BEGIN");

    // Verifica se o nome da empresa já existe
    const existingCompany = await pool.query(
      `SELECT id_company FROM companies WHERE name = $1`,
      [name]
    );
    if (existingCompany.rowCount > 0) {
      throw new Error("Uma empresa com esse nome já existe.");
    }

    // Verifica se o e-mail do funcionário já existe
    const existingEmployee = await pool.query(
      `SELECT id_employee FROM employees WHERE email = $1`,
      [email]
    );
    if (existingEmployee.rowCount > 0) {
      throw new Error("Um funcionário com esse e-mail já existe.");
    }

    // Insere a empresa na tabela `companies`
    const companyResult = await pool.query(
      `INSERT INTO companies (name, is_active) VALUES ($1, $2) RETURNING id_company`,
      [name, true]
    );
    const companyId = companyResult.rows[0].id_company;

    // Hashear a senha do funcionário antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere o funcionário na tabela `employees`
    const employeeResult = await pool.query(
      `INSERT INTO employees (name, email, password, is_admin, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id_employee, name, email, is_admin`,
      [name, email, hashedPassword, is_admin, companyId]
    );
    const employee = employeeResult.rows[0]; // Aqui, estamos pegando os dados do funcionário

    // Gera o token JWT para o novo funcionário
    const token = jwt.createJWTEmployee(employee.id_employee, companyId);

    // Confirma a transação
    await pool.query("COMMIT");

    // Retorna a mensagem de sucesso junto com o token e o objeto 'employee'
    return {
      message: "Empresa e funcionário criados com sucesso!",
      token,
      company_id: companyId,
      employee, // Incluindo os dados do funcionário na resposta
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw new Error("Erro ao criar empresa e funcionário: " + error.message);
  }
};

export default {
  createCompanyAndEmployee,
};

/*const createCompany = async (name) => {
  const query = `
          INSERT INTO companies (name)
          VALUES ($1) RETURNING *
      `;
  const values = [name];

  const result = await pool.query(query, values);
  return result.rows[0];
};*/
