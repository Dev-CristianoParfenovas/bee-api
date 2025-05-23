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
      // Retorna status 200 com mensagem informativa
      console.log(`Nenhuma categoria encontrada para a empresa ${company_id}`);
      return res.status(200).json({
        message: "Nenhuma categoria cadastrada no momento.",
        data: [], // Array vazio para consistência
      });
    }

    // Retorna os clientes encontrados
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Erro ao buscar categorias no controlador:", error.message);
    res
      .status(500)
      .json({
        error: "Erro ao buscar categorias. Tente novamente mais tarde.",
      });
  }
  /*  try {
    const companyId = req.params.company_id;
    console.log("Buscando categorias para company_id:", companyId);

    const categories = await Category.find({
      where: { company_id: companyId },
    });
    console.log("Categorias encontradas:", categories);

    if (categories.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }*/
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
