import serviceProducts from "../services/service.products.js";
import { updateProductAndStockService } from "../services/service.products.js";
import stockService from "../services/service.products.js";

// Obter todos os produtos de um cliente
/*const getProducts = async (req, res) => {
  const { company_id } = req.params;
  const { search } = req.query; // Pegando o parâmetro de pesquisa da query string

  console.log("Company ID recebido: ", company_id);
  console.log("Search Term: ", search); // Verifique se o termo de busca está sendo passado corretamente

  try {
    const products = await serviceProducts.getProductsByClient(
      company_id,
      search
    );

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum produto encontrado para este company_id" });
    }

    res.status(200).json(products); // Retorna a lista de produtos
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ error: err.message });
  }
};*/
const getProducts = async (req, res) => {
  const { company_id } = req.params;
  const { search } = req.query;

  try {
    const products = await serviceProducts.getProductsByClient(
      company_id,
      search
    );

    // products sempre será array, pode ser vazio
    return res.status(200).json(products);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getStockQuantity = async (req, res) => {
  const { product_id, company_id } = req.params;
  console.log("REQ PARAMS:", { product_id, company_id });

  if (!product_id || !company_id) {
    return res
      .status(400)
      .json({ error: "product_id e company_id são obrigatórios" });
  }

  try {
    const quantity = await stockService.getStockQuantity(
      product_id,
      company_id
    );
    return res.status(200).json({ quantity });
  } catch (err) {
    console.error("Erro no controller ao buscar quantidade de estoque:", err);
    return res.status(500).json({ error: err.message });
  }
};

const createOrUpdateProduct = async (req, res) => {
  const {
    id,
    name,
    category_id,
    price,
    company_id,
    stock,
    barcode,
    ncm,
    aliquota,
    cfop,
  } = req.body;

  try {
    const result = await serviceProducts.upsertProduct({
      id, // Passa o id para o serviço
      name,
      category_id,
      price,
      company_id,
      stock,
      barcode,
      ncm,
      aliquota,
      cfop,
    });

    return res.status(200).json({
      message: "Produto criado ou atualizado com sucesso.",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao criar ou atualizar produto: ", err);
    return res.status(500).json({
      message: "Erro ao criar ou atualizar produto.",
      error: err.message,
    });
  }
};

//ATUALIZA O ESTOQUE URILIZANDO O CÓDIGO DE BARRAS DO PRODUTO
const updateStockByBarcode = async (req, res) => {
  const { barcode, quantity, company_id } = req.body;

  console.log("Dados recebidos no controlador:", req.body);

  if (!barcode || !quantity || !company_id) {
    return res
      .status(400)
      .json({ error: "Dados incompletos para atualizar produto e estoque." });
  }

  try {
    const result = await serviceProducts.updateStockByBarcode(
      barcode,
      quantity,
      company_id
    );
    return res
      .status(200)
      .json({ message: "Estoque atualizado com sucesso", data: result });
  } catch (error) {
    console.error("Erro no controller ao atualizar estoque:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

export const updateProductAndStockController = async (req, res) => {
  const { product_id } = req.params;
  const {
    name,
    category_id,
    price,
    barcode,
    ncm,
    aliquota,
    cfop,
    quantity,
    company_id,
  } = req.body;

  try {
    console.log("Dados recebidos no controlador:", {
      product_id,
      name,
      category_id,
      price,
      barcode,
      ncm,
      aliquota,
      cfop,
      quantity,
      company_id,
    });

    // Checar se os dados estão completos
    if (
      !product_id ||
      !name ||
      !category_id ||
      !price ||
      !barcode ||
      !ncm ||
      !aliquota ||
      !cfop ||
      !quantity ||
      !company_id
    ) {
      console.error("Dados incompletos para atualizar produto e estoque.");
      return res.status(400).json({
        message: "Dados incompletos para atualizar produto e estoque.",
      });
    }

    // Chamando o serviço e esperando o resultado
    const result = await updateProductAndStockService(
      product_id,
      name,
      category_id,
      price,
      barcode,
      ncm,
      aliquota,
      cfop,
      quantity,
      company_id
    );

    if (result.status === 404) {
      console.error("Produto não encontrado ou não atualizado.");
      return res.status(404).json({ message: result.message });
    }

    console.log("Resultado do serviço:", result);
    return res.status(200).json({
      message: "Produto e estoque atualizados com sucesso.",
      data: result.data,
    });
  } catch (error) {
    console.error(
      "Erro no controlador de atualização de produto e estoque:",
      error.message,
      error.stack
    );
    return res
      .status(500)
      .json({ message: "Erro ao atualizar produto e estoque." });
  }
};

const deleteProductController = async (req, res) => {
  const { productId } = req.params; // Captura o productId da URL
  const { companyId } = req.query; // Captura o companyId da query string

  try {
    const deletedProduct = await serviceProducts.deleteProductService(
      productId,
      companyId
    );

    return res.status(200).json({
      message: "Produto excluído com sucesso",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Erro no controlador ao deletar produto:", error.message);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
};

export default {
  getProducts,
  createOrUpdateProduct,
  getStockQuantity,
  updateProductAndStockController,
  updateStockByBarcode,
  deleteProductController,
};
