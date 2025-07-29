import productRepository from "../repositories/repository.product.js";
import { uploadFileToS3 } from "../middlewares/upload.js";

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

//ATUALIZA ESTOQUE DO PRODUTO UTILIZANDO O CÓDIGO DE BARRAS
const updateStockByBarcode = async (barcode, quantityToAdd, company_id) => {
  try {
    const stock = await productRepository.updateStockByBarcode(
      barcode,
      quantityToAdd,
      company_id
    );

    return stock;
  } catch (error) {
    console.error(
      "Erro no serviço ao atualizar estoque por código de barras:",
      error.message
    );
    throw error;
  }
};

const getStockQuantity = async (product_id, company_id) => {
  if (!product_id || !company_id) {
    throw new Error("Produto e empresa são obrigatórios");
  }

  const quantity = await productRepository.getStockQuantityByProduct(
    product_id,
    company_id
  );
  return quantity;
};

// Exemplo de como o serviço upsertProduct poderia ser estruturado
/*280725const upsertProduct = async (productData) => {
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
    cst,
    csosn,
    image_url,
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
    cst,
    csosn,
    image_url,
    stock,
    company_id,
  });

  if (!name || !price || !company_id || stock == null) {
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
      cfop,
      cst,
      csosn,
      image_url
    );

    return result;
  } catch (err) {
    console.error(
      "Erro no serviço de criação ou atualização de produto: ",
      err
    );
    throw err;
  }
};*/

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
    cst,
    csosn,
    file,
  } = productData;

  // Obtem o caminho da imagem se o arquivo existir
  // const image_url = file?.location || null;

  // Validar e sanitizar dados, se quiser
  const sanitizedName = name?.trim();
  const sanitizedBarcode = barcode?.trim() || null;
  const sanitizedNcm = ncm?.trim() || null;
  const sanitizedCfop = cfop?.trim() || null;
  const sanitizedCst = cst?.trim() || null;
  const sanitizedCsosn = csosn?.trim() || null;

  return await productRepository.upsertProductAndStock(
    id,
    sanitizedName,
    category_id,
    parseFloat(price),
    company_id,
    stock ? parseInt(stock) : 0,
    sanitizedBarcode,
    sanitizedNcm,
    aliquota ? parseFloat(aliquota) : null,
    sanitizedCfop,
    sanitizedCst,
    sanitizedCsosn,
    file || null
  );
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
  cst,
  csosn,
  image_url,
  quantity,
  company_id
) => {
  try {
    const result = await productRepository.updateProductAndStock(
      product_id,
      name,
      category_id || null,
      price,
      barcode || null,
      ncm,
      aliquota,
      cfop,
      cst,
      csosn,
      image_url,
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
  updateStockByBarcode,
  getStockQuantity,
  updateProductAndStockService,
  deleteProductService,
};
