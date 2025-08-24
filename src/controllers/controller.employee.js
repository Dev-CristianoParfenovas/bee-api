import EmployeeService from "../services/service.employee.js";

const loginEmployeeController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await EmployeeService.loginEmployeeService(email, password);
    res.status(200).json(result); // Retorna o token e os dados do cliente
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(400).json({ error: error.message });
  }
};

/* 230825const createEmployee = async (req, res) => {
  const { name, email, phone, password, company_id } = req.body; // is_admin removido

  console.log("Dados recebidos no body:", req.body);

  try {
    // Validações básicas dos campos obrigatórios
    if (!name || !email || !password || !company_id) {
      return res.status(400).json({
        message:
          "Os campos obrigatórios são: name, email, password, company_id.",
      });
    }

    // Define phone como null caso não seja fornecido
    const phoneValue = phone || null;

    // Chama o serviço para criar o funcionário
    const employee = await EmployeeService.createEmployee(
      name,
      email,
      phoneValue, // Passa o phone tratado
      password,
      company_id
    );

    // Retorna o novo funcionário ao cliente
    res.status(201).json({
      message: "Funcionário criado com sucesso.",
      employee,
    });
  } catch (error) {
    console.error("Erro no controller ao criar funcionário:", error);

    // Retorna uma resposta de erro caso ocorra uma exceção
    res.status(500).json({
      message: "Erro ao criar funcionário.",
      error: error.message,
    });
  }
};*/

const createEmployee = async (req, res) => {
  const { name, email, phone, password, company_id } = req.body;

  console.log("Dados recebidos no body:", req.body);

  if (!name || !email || !company_id) {
    return res.status(400).json({
      message: "Os campos obrigatórios são: name, email, company_id.",
    });
  }

  try {
    const employee = await EmployeeService.createEmployee(
      name,
      email,
      phone || null,
      password, // senha opcional para edição
      company_id
    );

    res.status(200).json({
      message: "Funcionário criado ou atualizado com sucesso.",
      employee,
    });
  } catch (error) {
    console.error(
      "Erro no controller ao criar ou atualizar funcionário:",
      error
    );
    res.status(400).json({
      message: error.message,
    });
  }
};

const getEmployees = async (req, res) => {
  // Pegue o company_id do token (injetado pelo middleware JWT)
  const { company_id } = req;
  try {
    const employees = await EmployeeService.getEmployeesByCompany(company_id);
    res.status(200).json(employees); // Retorna a lista de funcionários
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const deleteEmployeeController = async (req, res) => {
  const { employeeId } = req.params;
  const { company_id } = req; // obtido via JWT

  try {
    const deletedEmployee = await EmployeeService.deleteEmployeeService(
      employeeId,
      company_id
    );

    if (!deletedEmployee) {
      return res.status(404).json({
        message: "Funcionário não encontrado ou já excluído",
      });
    }

    return res.status(200).json({
      message: "Funcionário excluído com sucesso",
      employee: deletedEmployee,
    });
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    return res.status(500).json({ error: "Erro ao excluir funcionário" });
  }
};

export default {
  getEmployees, // Nova função
  createEmployee,
  loginEmployeeController,
  deleteEmployeeController,
};
