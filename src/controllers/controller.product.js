import serviceProducts from "../services/service.products.js";
import { updateProductAndStockService } from "../services/service.products.js";
import stockService from "../services/service.products.js";

// Obter todos os produtos de um cliente
const getProducts = async (req, res) => {
  const { company_id } = req;
  const { search } = req.query;

  console.log("Company ID recebido no controller:", company_id);
  console.log("Search recebido:", search);

  try {
    const products = await serviceProducts.getProductsByClient(
      company_id,
      search
    );

    if (!products || products.length === 0) {
      return res.status(200).json([]); // devolve array vazio em vez de objeto
    }

    res.status(200).json(products); // devolve direto o array
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getStockQuantity = async (req, res) => {
  const { productId } = req.params;
  const { company_id } = req; // <<< Correção: Obtem o company_id do token

  console.log("🔍 DEBUG getStockQuantity:");
  console.log("  ➝ productId recebido:", productId);
  console.log("  ➝ company_id do token:", company_id);

  if (!productId || !company_id) {
    return res
      .status(400)
      .json({ error: "productId  e company_id são obrigatórios" });
  }

  try {
    const quantity = await stockService.getStockQuantity(productId, company_id);
    return res.status(200).json({ quantity });
  } catch (err) {
    console.error("Erro no controller ao buscar quantidade de estoque:", err);
    return res.status(500).json({ error: err.message });
  }
};

const createOrUpdateProduct = async (req, res) => {
  const { company_id } = req; // <<< Correção: Obtem o company_id do token
  const {
    id,
    name,
    category_id,
    price,
    stock,
    barcode,
    ncm,
    aliquota,
    cfop,
    cst,
    csosn,
  } = req.body;

  try {
    if (!name || !category_id || !price || !company_id) {
      return res.status(400).json({
        message:
          "Campos obrigatórios ausentes: name, category_id, price, company_id.",
      });
    }

    // Conversão dos tipos
    const stockQuantity = stock ? parseInt(stock, 10) : 0;
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat)) {
      return res.status(400).json({ message: "Preço inválido." });
    }
    const categoryIdInt = category_id ? parseInt(category_id, 10) : null;
    const companyIdInt = company_id ? parseInt(company_id, 10) : null;

    const result = await serviceProducts.upsertProduct({
      id,
      name,
      category_id: categoryIdInt,
      price: priceFloat,
      company_id: companyIdInt,
      stock: stockQuantity,
      barcode,
      ncm,
      aliquota,
      cfop,
      cst,
      csosn,
    });

    return res.status(200).json({
      message: "Produto criado ou atualizado com sucesso.",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao criar ou atualizar produto: ", err);

    // Verifica se é o erro de duplicidade lançado pelo repository
    if (err.message.includes("duplicado")) {
      return res.status(400).json({
        message:
          "Produto com mesmo nome ou código de barras já existe para esta empresa.",
      });
    }

    if (err.code === "23505") {
      // 23505 = unique_violation no PostgreSQL
      return res.status(400).json({
        message: "Produto com esse nome já existe para essa empresa.",
      });
    }

    return res.status(500).json({
      message: "Erro ao criar ou atualizar produto.",
      error: err.message,
    });
  }
};

const updateProductAndStockController = async (req, res) => {
  const { product_id } = req.params;
  const { company_id } = req; // <<< Correção: Obtem o company_id do token
  const {
    name,
    category_id,
    price,
    barcode,
    ncm,
    aliquota,
    cfop,
    cst,
    csosn,
    quantity,
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
      cst,
      csosn,
      quantity,
      company_id,
    });

    // Checar se os dados estão completos
    if (
      !product_id ||
      !name?.trim() ||
      !category_id ||
      price == null ||
      isNaN(price) ||
      !barcode?.trim() ||
      !ncm?.trim() ||
      aliquota == null ||
      !cfop?.trim() ||
      !cst?.trim() ||
      !csosn?.trim() ||
      quantity == null ||
      isNaN(quantity) ||
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
      cst,
      csosn,
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

//ATUALIZA O ESTOQUE URILIZANDO O CÓDIGO DE BARRAS DO PRODUTO
const updateStockByBarcode = async (req, res) => {
  const { barcode, quantity } = req.body;
  const { company_id } = req; // <<< Correção: Obtem o company_id do token

  //console.log("Dados recebidos no controlador:", req.body);

  if (
    typeof barcode !== "string" ||
    barcode.trim() === "" ||
    isNaN(Number(quantity)) ||
    Number(quantity) <= 0 ||
    isNaN(Number(company_id)) ||
    Number(company_id) <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Dados inválidos para atualizar estoque." });
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

/*const deleteProductController = async (req, res) => {
  const { productId } = req.params; // Captura o productId da URL
  const { companyId } = req; // <<< Correção: Obtem o company_id do token
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
};*/

const deleteProductController = async (req, res) => {
  const { productId } = req.params; // Captura o productId da URL
  const { company_id } = req; // Obtem o company_id do token

  try {
    console.log(`[CONTROLLER] Tentando deletar produto com ID: ${productId}`);
    const parsedProductId = parseInt(productId, 10);
    console.log(`[CONTROLLER] ID após parseInt: ${parsedProductId}`);
    if (isNaN(parsedProductId)) {
      return res.status(400).json({
        message: "ID do produto inválido.",
      });
    }

    const deletedProduct = await serviceProducts.deleteProductService(
      parsedProductId,
      company_id
    );

    if (!deletedProduct) {
      // Produto não encontrado ou já excluído
      return res.status(404).json({
        message: "Produto não encontrado ou já excluído",
      });
    }

    return res.status(200).json({
      message: "Produto excluído com sucesso",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(
      "Erro no controlador ao deletar produto (imagem opcional):",
      error.message
    );
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
