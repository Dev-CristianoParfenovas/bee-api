import serviceClient from "../services/service.client.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await serviceClient.loginClient(email, password);
    res.status(200).json(result); // Retorna o token e os dados do cliente
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const getClientsByCompany = async (req, res) => {
  const { company_id } = req.params;

  console.log("company_id recebido no controlador:", company_id);

  try {
    const clients = await serviceClient.getClientsByCompany(company_id);

    if (clients.length === 0) {
      // Retorna status 200 com mensagem informativa
      console.log(`Nenhum cliente encontrado para a empresa ${company_id}`);
      return res.status(200).json({
        message: "Nenhum cliente cadastrado no momento.",
        data: [], // Array vazio para consistência
      });
    }

    // Retorna os clientes encontrados
    res.status(200).json({ data: clients });
  } catch (error) {
    console.error("Erro ao buscar clientes no controlador:", error.message);
    res
      .status(500)
      .json({ error: "Erro ao buscar clientes. Tente novamente mais tarde." });
  }
};

// Função para lidar com a criação ou atualização de um cliente
const createOrUpdateClient = async (req, res) => {
  const { name, email, phone, password, company_id } = req.body;

  try {
    const client = await serviceClient.createClient(
      name,
      email,
      phone,
      password,
      company_id
    );

    return res.status(201).json({
      message: "Cliente criado ou atualizado com sucesso.",
      client,
    });
  } catch (error) {
    console.error("Error in controller:", error);
    return res.status(500).json({
      message: "Erro ao criar ou atualizar o cliente.",
      error: error.message,
    });
  }
};

export default { createOrUpdateClient, login, getClientsByCompany };
