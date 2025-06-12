import pool from "../db/connection.js";

// Função para obter os produtos de uma empresa
const getProductsByClient = async (company_id, search = "") => {
  const query = `
    SELECT p.*, COALESCE(s.quantity, 0) AS quantity
    FROM products p
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.company_id = $1
    AND p.name ILIKE $2
  `;
  const values = [company_id, `%${search}%`];

  try {
    const result = await pool.query(query, values);
    return result.rows; // sempre retorna array, vazio se nada encontrado
  } catch (error) {
    console.error("Erro ao buscar produtos: ", error);
    throw new Error("Erro ao buscar produtos");
  }
};

// Função para verificar duplicidade
const findProductByNameAndCompany = async (name, company_id) => {
  const query = `
    SELECT * FROM products 
    WHERE name = $1 AND company_id = $2
  `;
  const values = [name, company_id];
  const result = await pool.query(query, values);
  console.log("Resultado da consulta de duplicidade:", result.rows); // Log adicional
  return result.rows[0]; // Retorna o produto encontrado ou undefined
};

//grava e altera produto

const upsertProductAndStock = async (
  id,
  name,
  category_id,
  price,
  company_id,
  stockQuantity,
  barcode,
  ncm,
  aliquota,
  cfop
) => {
  const client = await pool.connect();

  console.log("Valores recebidos no repositório:", {
    id,
    name,
    category_id,
    price,
    company_id,
    stockQuantity,
    barcode,
    ncm,
    aliquota,
    cfop,
  });

  try {
    await client.query("BEGIN");

    let productResponse, stockResponse;

    if (id) {
      // Verifica se o produto existe com o ID fornecido
      const findProductQuery = `
        SELECT * FROM products
        WHERE id = $1 AND company_id = $2
      `;
      const productResult = await client.query(findProductQuery, [
        id,
        company_id,
      ]);

      if (productResult.rows.length > 0) {
        // Atualiza o produto existente
        const updateProductQuery = `
          UPDATE products
          SET name = $1, category_id = $2, price = $3, barcode = $4, ncm = $5, aliquota = $6, cfop = $7
          WHERE id = $8 AND company_id = $9
          RETURNING *
        `;
        productResponse = await client.query(updateProductQuery, [
          name,
          category_id,
          price,
          barcode,
          ncm,
          aliquota,
          cfop,
          id,
          company_id,
        ]);

        // Atualiza o estoque correspondente
        const updateStockQuery = `
          UPDATE stock
          SET quantity = $1
          WHERE product_id = $2 AND company_id = $3
          RETURNING *
        `;
        stockResponse = await client.query(updateStockQuery, [
          stockQuantity,
          id,
          company_id,
        ]);
      } else {
        throw new Error("Produto não encontrado para o ID fornecido.");
      }
    } else {
      // Cria novo produto se o ID não for fornecido
      const insertProductQuery = `
        INSERT INTO products (name, category_id, price, company_id, barcode, ncm, aliquota, cfop)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      productResponse = await client.query(insertProductQuery, [
        name,
        category_id,
        price,
        company_id,
        barcode,
        ncm,
        aliquota,
        cfop,
      ]);

      // Verifica se o produto foi inserido corretamente
      if (!productResponse.rows.length) {
        throw new Error("Erro ao inserir o novo produto.");
      }

      const insertStockQuery = `
        INSERT INTO stock (product_id, quantity, company_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      stockResponse = await client.query(insertStockQuery, [
        productResponse.rows[0].id,
        stockQuantity,
        company_id,
      ]);
    }

    // Seleciona todos os produtos com o produto atualizado primeiro
    const fetchProductsQuery = `
      SELECT p.*, s.quantity 
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id AND p.company_id = s.company_id
      WHERE p.company_id = $1
      ORDER BY p.id = $2 DESC, p.id
    `;
    const allProducts = await client.query(fetchProductsQuery, [
      company_id,
      productResponse.rows[0].id,
    ]);

    await client.query("COMMIT");

    return {
      updatedProduct: productResponse.rows[0],
      updatedStock: stockResponse.rows[0],
      products: allProducts.rows,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao criar ou atualizar produto e estoque: ", err);
    throw new Error("Erro ao criar ou atualizar produto e estoque.");
  } finally {
    client.release();
  }
};

// Função para atualizar produto e estoque
const updateProductAndStock = async (
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Atualizar produto
    const queryProduct = `
      UPDATE products
      SET name = $1, category_id = $2, price = $3
      WHERE id = $4 AND company_id = $5
      RETURNING *
    `;
    const valuesProduct = [
      name,
      category_id,
      price,
      barcode,
      ncm,
      aliquota,
      cfop,
      product_id,
      company_id,
    ];
    const productResult = await client.query(queryProduct, valuesProduct);
    const product = productResult.rows[0];

    // Atualizar estoque
    const queryStock = `
      UPDATE stock
      SET quantity = $1
      WHERE product_id = $2 AND company_id = $3
      RETURNING *
    `;
    const valuesStock = [quantity, product_id, company_id];
    const stockResult = await client.query(queryStock, valuesStock);

    await client.query("COMMIT");
    return { product, stock };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao atualizar produto e estoque: ", err);
    throw new Error("Erro ao atualizar produto e estoque");
  } finally {
    client.release();
  }
};

//FUNÇÃO PARA ATUALIZAR O ESTOQUE ATRAVES DO CODIGO DE BARRAS DO PRODUTO
/*120625const updateStockByBarcode = async (barcode, quantityToAdd, company_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const companyIdNum = Number(company_id);

    const selectQuery = `
      SELECT s.quantity, p.id AS product_id
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE p.barcode = $1 AND p.company_id = $2 AND s.company_id = $2
      FOR UPDATE
    `;

    const selectResult = await client.query(selectQuery, [
      barcode,
      companyIdNum,
    ]);

    if (selectResult.rows.length === 0) {
      throw new Error(
        "Produto não encontrado para o código de barras informado."
      );
    }

    const { quantity: currentQuantity, product_id } = selectResult.rows[0];

    const newQuantity = Number(currentQuantity) + Number(quantityToAdd);

    const updateQuery = `
      UPDATE stock
      SET quantity = $1
      WHERE product_id = $2 AND company_id = $3
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [
      newQuantity,
      product_id,
      companyIdNum,
    ]);

    await client.query("COMMIT");

    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Erro ao atualizar estoque por código de barras:",
      error.message
    );
    throw error;
  } finally {
    client.release();
  }
};*/

const updateStockByBarcode = async (barcode, quantityToAdd, company_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const companyIdNum = Number(company_id);

    // Busca estoque atual + product_id
    const selectQuery = `
      SELECT s.quantity, p.id AS product_id
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE p.barcode = $1 AND p.company_id = $2 AND s.company_id = $2
      FOR UPDATE
    `;

    const selectResult = await client.query(selectQuery, [
      barcode,
      companyIdNum,
    ]);

    if (selectResult.rows.length === 0) {
      throw new Error(
        "Produto não encontrado para o código de barras informado."
      );
    }

    const { quantity: currentQuantity, product_id } = selectResult.rows[0];

    const newQuantity = Number(currentQuantity) + Number(quantityToAdd);

    // Atualiza estoque
    const updateQuery = `
      UPDATE stock
      SET quantity = $1
      WHERE product_id = $2 AND company_id = $3
    `;

    await client.query(updateQuery, [newQuantity, product_id, companyIdNum]);

    // Busca dados completos do produto + estoque atualizado
    const resultQuery = `
      SELECT p.id, p.name, p.barcode, s.quantity
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE p.id = $1 AND s.company_id = $2
    `;

    const result = await client.query(resultQuery, [product_id, companyIdNum]);

    await client.query("COMMIT");

    if (result.rows.length === 0) {
      throw new Error("Erro ao obter dados do produto atualizado.");
    }

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Erro ao atualizar estoque por código de barras:",
      error.message
    );
    throw error;
  } finally {
    client.release();
  }
};

const getStockQuantityByProduct = async (product_id, company_id) => {
  const query = `
    SELECT quantity FROM stock
    WHERE product_id = $1 AND company_id = $2
  `;
  const values = [product_id, company_id];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]?.quantity ?? 0;
  } catch (err) {
    console.error(
      "Erro ao buscar quantidade de estoque no banco:",
      err.message
    );
    throw err; // reenvia o erro original
  }
};

// Função para excluir produto e seu estoque
const deleteProductAndStock = async (product_id, company_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verifica se o produto existe antes de tentar excluí-lo
    const productCheckQuery = `
      SELECT * FROM products
      WHERE id = $1 AND company_id = $2
    `;
    const productCheckValues = [product_id, company_id];
    const productCheckResult = await client.query(
      productCheckQuery,
      productCheckValues
    );

    if (productCheckResult.rows.length === 0) {
      throw new Error("Produto não encontrado ou já excluído");
    }

    // Excluir estoque
    const queryStock = `
      DELETE FROM stock
      WHERE product_id = $1 AND company_id = $2
      RETURNING *
    `;
    const valuesStock = [product_id, company_id];
    await client.query(queryStock, valuesStock);

    // Excluir produto
    const queryProduct = `
      DELETE FROM products
      WHERE id = $1 AND company_id = $2
      RETURNING *
    `;
    const valuesProduct = [product_id, company_id];
    const productResult = await client.query(queryProduct, valuesProduct);

    await client.query("COMMIT");
    return productResult.rows[0]; // Retorna o produto excluído
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao excluir produto e estoque: ", err);
    throw new Error("Erro ao excluir produto e estoque");
  } finally {
    client.release();
  }
};

export default {
  getProductsByClient,
  upsertProductAndStock,
  updateProductAndStock,
  updateStockByBarcode,
  getStockQuantityByProduct,
  deleteProductAndStock,
  findProductByNameAndCompany,
};
