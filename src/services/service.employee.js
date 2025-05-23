import employeeRepository from "../repositories/repository.employee.js";
import bcrypt from "bcrypt";
import jwt from "../jwt/token.js";
import dotenv from "dotenv";

// Carregar as variáveis de ambiente
dotenv.config();

const secretToken = process.env.JWT_SECRET; // Usa o segredo do JWT das variáveis de ambiente
const saltRounds = 10;

if (!secretToken) {
  throw new Error("SECRET_TOKEN não definido no arquivo .env");
}

const loginEmployeeService = async (email, password) => {
  try {
    // Chama a função do repositório para autenticar o cliente
    const result = await employeeRepository.loginEmployeeRepository(
      email,
      password
    );

    // Aqui você pode adicionar mais lógica, se necessário

    return result; // Retorna o token e os dados do cliente
  } catch (error) {
    throw new Error(error.message); // Repassa o erro para o controlador
  }
};

const createEmployee = async (name, email, phone, password, company_id) => {
  try {
    // 1. Garantir que is_admin seja sempre false
    const is_admin = false;

    // 2. Criptografar a senha
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Define phone como null se não for fornecido
    const phoneValue = phone || null;

    // 3. Chamar o repositório para criar ou atualizar o funcionário
    const employee = await employeeRepository.createEmployee(
      name,
      email,
      phoneValue,
      password, // Passa a senha criptografada
      company_id,
      is_admin
    );

    if (!employee) {
      throw new Error("Falha ao criar ou atualizar funcionário");
    }

    // 4. Retornar o funcionário criado/atualizado
    return employee;
  } catch (err) {
    console.error("Erro ao criar ou atualizar funcionário:", err);
    throw new Error("Erro ao criar ou atualizar funcionário");
  }
};

const getEmployeesByCompany = async (company_id) => {
  try {
    // Chama a função do repositório para obter os funcionários
    const employees = await employeeRepository.getEmployeesByCompany(
      company_id
    );
    return employees; // Retorna os funcionários
  } catch (error) {
    throw new Error(error.message); // Repassa o erro
  }
};

export default {
  createEmployee,
  loginEmployeeService,
  getEmployeesByCompany, // Nova função
};
