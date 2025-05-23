import categoryRepository from "../repositories/repository.category.js";

const createCategoryService = async (name, company_id) => {
  return await categoryRepository.createCategory(name, company_id);
};

const getCategoryByIdAndCompanyIdService = async (id, company_id) => {
  const category = await categoryRepository.getCategoryByIdAndCompanyId(
    id,
    company_id
  );
  return category;
};

const getCategoriesByCompanyIdService = async (company_id) => {
  console.log("company_id recebido no serviço:", company_id); // Confirmação do ID no serviço

  if (!company_id) {
    throw new Error("O ID da empresa é obrigatório.");
  }

  const categories = await categoryRepository.getCategoriesByCompanyId(
    company_id
  );

  // Apenas retorna os clientes (pode ser um array vazio)
  return categories;
  // return await categoryRepository.getCategoriesByCompanyId(company_id);

  /* try {
    // Chama a função do repositório para autenticar o cliente
    const result = await categoryRepository.getCategoriesByCompanyId(
      company_id
    );

    // Aqui você pode adicionar mais lógica, se necessário

    return result; // Retorna o token e os dados do cliente
  } catch (error) {
    throw new Error(error.message); // Repassa o erro para o controlador
  }*/
};

export const updateCategoryService = async (category_id, name, company_id) => {
  return await categoryRepository.updateCategory(category_id, name, company_id);
};

export const deleteCategoryService = async (category_id, company_id) => {
  return await categoryRepository.deleteCategory(category_id, company_id);
};

export default {
  createCategoryService,
  getCategoriesByCompanyIdService,
  getCategoryByIdAndCompanyIdService,
  updateCategoryService,
  deleteCategoryService,
};
