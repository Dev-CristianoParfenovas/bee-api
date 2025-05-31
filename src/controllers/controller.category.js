import categoryService from "../services/service.category.js";

const createCategoryController = async (req, res) => {
  const { name, company_id } = req.body;
  try {
    const category = await categoryService.createCategoryService(
      name,
      company_id
    );
    return res.status(201).json(category);
  } catch (error) {
    console.error("Erro ao criar categoria: ", error);
    return res.status(500).json({ message: "Erro ao criar categoria" });
  }
};

//Tras a categoria por id company e idcategoria
const getCategoryByIdAndCompanyIdController = async (req, res) => {
  const { id, company_id } = req.params;

  console.log("company_id recebido no controlador:", company_id);

  try {
    const category = await categoryService.getCategoryByIdAndCompanyIdService(
      id,
      company_id
    );

    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Erro ao obter categoria:", error);
    return res.status(500).json({ message: "Erro ao obter categoria" });
  }
};

//Tras todas as categorias do id company
const getCategoriesByCompanyIdController = async (req, res) => {
  const { company_id } = req.params;

  console.log("company_id recebido no controlador:", company_id);

  try {
    const categories = await categoryService.getCategoriesByCompanyIdService(
      company_id
    );

    if (categories.length === 0) {
      console.log(`Nenhuma categoria encontrada para a empresa ${company_id}`);
      return res.status(200).json({ data: [] }); // Retorna array vazio sem mensagem extra
    }

    return res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Erro ao buscar categorias no controlador:", error.message);
    return res.status(500).json({
      error: "Erro ao buscar categorias. Tente novamente mais tarde.",
    });
  }
};

const updateCategoryController = async (req, res) => {
  const { category_id } = req.params;
  const { name, company_id } = req.body;
  try {
    const category = await categoryService.updateCategoryService(
      category_id,
      name,
      company_id
    );
    if (!category)
      return res.status(404).json({ message: "Categoria não encontrada" });
    return res.status(200).json(category);
  } catch (error) {
    console.error("Erro ao atualizar categoria: ", error);
    return res.status(500).json({ message: "Erro ao atualizar categoria" });
  }
};

const deleteCategoryController = async (req, res) => {
  const { category_id } = req.params;
  const { company_id } = req.query;
  try {
    const category = await categoryService.deleteCategoryService(
      category_id,
      company_id
    );
    if (!category)
      return res.status(404).json({ message: "Categoria não encontrada" });
    return res.status(200).json({ message: "Categoria deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar categoria: ", error);
    return res.status(500).json({ message: "Erro ao deletar categoria" });
  }
};

export default {
  createCategoryController,
  getCategoriesByCompanyIdController,
  getCategoryByIdAndCompanyIdController,
  updateCategoryController,
  deleteCategoryController,
};
