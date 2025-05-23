import serviceCompany from "../services/service.company.js";

const createCompanyAndEmployee = async (req, res) => {
  console.log("Dados recebidos no controlador:", req.body);
  const { name, email, password, is_admin } = req.body;

  if (!name || !email || !password || is_admin === undefined) {
    return res.status(400).json({
      message:
        "Todos os campos (name, email, password, is_admin) são obrigatórios.",
    });
  }

  try {
    // Passa os dados para o serviço
    const result = await serviceCompany.createCompanyAndEmployee(
      name,
      email,
      password,
      is_admin
    );

    // Retorna a mensagem e o token
    return res.status(201).json({
      message: result.message,
      token: result.token,
    });
  } catch (error) {
    // Verifica mensagens de erro conhecidas
    if (error.message.includes("já existe")) {
      return res.status(409).json({ message: error.message }); // Status 409 = Conflito
    }

    // Erro genérico
    return res.status(500).json({
      message: "Erro ao criar empresa e funcionário",
      error: error.message,
    });
  }
};

export default {
  createCompanyAndEmployee,
};

/*const createCompany = async (req, res) => {
  const { name } = req.body;
  try {
    // Chamando o serviço de company para criar uma empresa/cliente
    const company = await serviceCompany.createCompany(name);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createCompany,
};*/
