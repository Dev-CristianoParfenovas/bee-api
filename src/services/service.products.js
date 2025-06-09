import productRepository from "../repositories/repository.product.js";
import stockRepository from "../repositories/repository.product.js";
const getProductsByClient = async (company_id, search) => {
  try {
    const products = await productRepository.getProductsByClient(
      company_id,
      search
    );
    return products;
  } catch (err) {
    console.error("Erro no serviço de busca de produtos:", err);
    throw new Error("Erro ao buscar produtos");
  }
};

const getStockQuantity = async (product_id, company_id) => {
  if (!product_id || !company_id) {
    throw new Error("Produto e empresa são obrigatórios");
  }

  const quantity = await stockRepository.getStockQuantityByProduct(
    product_id,
    company_id
  );
  return quantity;
};

// Exemplo de como o serviço upsertProduct poderia ser estruturado
const upsertProduct = async (productData) => {
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
  } = productData;

  // Insere o log aqui
  console.log("Parâmetros recebidos no serviço:", {
    id,
    name,
    category_id,
    price,
    barcode,
    ncm,
    aliquota,
    cfop,
    stock,
    company_id,
  });

  if (!name || !category_id || !price || !company_id || stock == null) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  try {
    const result = await productRepository.upsertProductAndStock(
      id, // Agora passamos o ID, que pode ser `undefined` se for um novo produto
      name,
      category_id,
      price,
      company_id,
      stock,
      barcode,
      ncm,
      aliquota,
      cfop
    );

    return result;
  } catch (err) {
    console.error(
      "Erro no serviço de criação ou atualização de produto: ",
      err
    );
    throw err;
  }
};

export const updateProductAndStockService = async (
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
) => {
  try {
    const result = await productRepository.updateProductAndStock(
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

    if (!result) {
      return {
        status: 404,
        message: "Produto não encontrado ou não atualizado.",
      };
    }

    return { status: 200, data: result };
  } catch (error) {
    console.error(
      "Erro no serviço de atualização de produto e estoque:",
      error.message,
      error.stack
    );
    throw new Error("Erro ao atualizar produto e estoque.");
  }
};

const deleteProductService = async (product_id, company_id) => {
  try {
    const deletedProduct = await productRepository.deleteProductAndStock(
      product_id,
      company_id
    );

    if (!deletedProduct) {
      throw new Error("Produto não encontrado ou já excluído");
    }

    return deletedProduct;
  } catch (error) {
    console.error("Erro ao deletar produto no serviço:", error);
    throw new Error("Erro ao excluir produto");
  }
};

export default {
  getProductsByClient,
  upsertProduct,
  getStockQuantity,
  updateProductAndStockService,
  deleteProductService,
};
