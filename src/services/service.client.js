import clientRepository from "../repositories/repository.client.js";

const loginClient = async (email, password) => {
  try {
    // Chama a função do repositório para autenticar o cliente
    const result = await clientRepository.loginClient(email, password);

    // Aqui você pode adicionar mais lógica, se necessário

    return result; // Retorna o token e os dados do cliente
  } catch (error) {
    throw new Error(error.message); // Repassa o erro para o controlador
  }
};

const getClientsByCompany = async (company_id) => {
  if (!company_id) {
    throw new Error("O ID da empresa é obrigatório.");
  }

  const clients = await clientRepository.getClientsByCompany(company_id);

  // Apenas retorna os clientes (pode ser um array vazio)
  return clients;
};

// Função para criar ou atualizar um cliente
const createClient = async (name, email, phone, password, company_id) => {
  try {
    const client = await clientRepository.createClient(
      name,
      email,
      phone,
      password,
      company_id
    );
    return client; // Retorna o cliente criado ou atualizado
  } catch (error) {
    console.error("Error creating/updating client:", error);
    throw error; // Lança o erro para ser tratado no Controller
  }
};
export default { createClient, loginClient, getClientsByCompany };
