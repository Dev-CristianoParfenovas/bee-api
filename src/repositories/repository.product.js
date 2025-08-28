import pool from "../db/connection.js";
import { deleteImage } from "../config/s3.js";

// Função para obter os produtos de uma empresa
/*160825 const getProductsByClient = async (company_id, search = "") => {
  const query = `
    SELECT
      p.*,
      COALESCE(s.quantity, 0) AS quantity,
      -- Use uma subquery para pegar APENAS UMA image_url por produto
      (SELECT im.image_url
       FROM images im
       WHERE im.product_id = p.id
       ORDER BY im.id ASC -- Escolha a imagem com o menor ID (geralmente a mais antiga ou a primeira inserida)
       LIMIT 1
      ) AS image_url
    FROM products p
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.company_id = $1
    AND p.name ILIKE $2
    ORDER BY p.created_at DESC
  `;
  const values = [company_id, `%${search}%`];

  console.log("Company ID no repository:", company_id);

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar produtos: ", error);
    throw new Error("Erro ao buscar produtos");
  }
};*/

const getProductsByClient = async (company_id, search = "") => {
  let query = `
    SELECT
      p.*,
      COALESCE(s.quantity, 0) AS quantity,
      (SELECT im.image_url
       FROM images im
       WHERE im.product_id = p.id
       ORDER BY im.id ASC
       LIMIT 1
      ) AS image_url
    FROM products p
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.company_id = $1
  `;

  const values = [company_id];

  if (search) {
    query += ` AND p.name ILIKE $2`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY p.created_at DESC`;

  console.log("Company ID no repository:", company_id);
  console.log("Search no repository:", search);

  try {
    const result = await pool.query(query, values);
    return result.rows;
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

/*280725 const upsertProductAndStock = async (
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
  cst,
  csosn,
  image_url
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
    cst,
    csosn,
    image_url,
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
          SET name = $1, category_id = $2, price = $3, barcode = $4, ncm = $5, aliquota = $6, cfop = $7, cst = $8, csosn = $9, image_url = $10
          WHERE id = $11 AND company_id = $12
          RETURNING *
        `;
        productResponse = await client.query(updateProductQuery, [
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
          id,
          company_id,
        ]);

        // Atualiza o estoque correspondente
        const upsertStockQuery = `
        INSERT INTO stock (product_id, quantity, company_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, company_id)
        DO UPDATE SET quantity = EXCLUDED.quantity
        RETURNING *
      `;
        stockResponse = await client.query(upsertStockQuery, [
          id,
          stockQuantity,
          company_id,
        ]);
      } else {
        throw new Error("Produto não encontrado para o ID fornecido.");
      }
    } else {
      // Cria novo produto se o ID não for fornecido
      const insertProductQuery = `
        INSERT INTO products (name, category_id, price, company_id, barcode, ncm, aliquota, cfop, cst, csosn, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      productResponse = await client.query(insertProductQuery, [
        name,
        category_id || null,
        price,
        company_id,
        barcode || null,
        ncm,
        aliquota,
        cfop,
        cst,
        csosn,
        image_url,
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
};*/

/*290725 const upsertProductAndStock = async (
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
  cst,
  csosn,
  imageBuffer, // ← buffer da imagem
  originalFileName // ← nome original do arquivo (para extensão)
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let productResponse, stockResponse;
    let imageUrl = null;

    if (id) {
      // Atualiza produto existente
      const updateProductQuery = `
        UPDATE products
        SET name = $1, category_id = $2, price = $3, barcode = $4, ncm = $5,
            aliquota = $6, cfop = $7, cst = $8, csosn = $9
        WHERE id = $10 AND company_id = $11
        RETURNING *
      `;
      productResponse = await client.query(updateProductQuery, [
        name,
        category_id || null,
        price,
        barcode || null,
        ncm,
        aliquota,
        cfop,
        cst,
        csosn,
        id,
        company_id,
      ]);

      // Upload imagem (se enviada)
      if (imageBuffer) {
        const ext = originalFileName.split(".").pop();
        const imageName = `product-${id}.${ext}`;
        imageUrl = await uploadToS3(imageBuffer, imageName); // sua função de upload

        await client.query(`UPDATE products SET image_url = $1 WHERE id = $2`, [
          imageUrl,
          id,
        ]);
      }

      // Atualiza ou insere estoque
      const upsertStockQuery = `
        INSERT INTO stock (product_id, quantity, company_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, company_id)
        DO UPDATE SET quantity = EXCLUDED.quantity
        RETURNING *
      `;
      stockResponse = await client.query(upsertStockQuery, [
        id,
        stockQuantity,
        company_id,
      ]);
    } else {
      // Insere produto sem imagem primeiro
      const insertProductQuery = `
        INSERT INTO products (name, category_id, price, company_id, barcode, ncm, aliquota, cfop, cst, csosn)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      productResponse = await client.query(insertProductQuery, [
        name,
        category_id || null,
        price,
        company_id,
        barcode || null,
        ncm,
        aliquota,
        cfop,
        cst,
        csosn,
      ]);

      const newProductId = productResponse.rows[0].id;

      // Upload da imagem após obter o ID
      if (imageBuffer) {
        const ext = originalFileName.split(".").pop();
        const imageName = `product-${newProductId}.${ext}`;
        imageUrl = await uploadToS3(imageBuffer, imageName);

        await client.query(`UPDATE products SET image_url = $1 WHERE id = $2`, [
          imageUrl,
          newProductId,
        ]);
        productResponse.rows[0].image_url = imageUrl;
      }

      // Insere estoque
      const insertStockQuery = `
        INSERT INTO stock (product_id, quantity, company_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      stockResponse = await client.query(insertStockQuery, [
        newProductId,
        stockQuantity,
        company_id,
      ]);
    }

    await client.query("COMMIT");

    return {
      updatedProduct: productResponse.rows[0],
      updatedStock: stockResponse.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao criar/atualizar produto e estoque:", err);
    throw err;
  } finally {
    client.release();
  }
};*/

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
  cfop,
  cst,
  csosn
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let productResponse, stockResponse;
    let imageUrl = null;

    if (id) {
      // Atualização com ID
      const updateProductQuery = `
        UPDATE products
        SET name = $1, category_id = $2, price = $3, barcode = $4, ncm = $5,
            aliquota = $6, cfop = $7, cst = $8, csosn = $9
        WHERE id = $10 AND company_id = $11
        RETURNING *
      `;
      productResponse = await client.query(updateProductQuery, [
        name,
        category_id || null,
        price,
        barcode || null,
        ncm || null,
        aliquota || null,
        cfop || null,
        cst || null,
        csosn || null,
        id,
        company_id,
      ]);

      const upsertStockQuery = `
        INSERT INTO stock (product_id, quantity, company_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, company_id)
        DO UPDATE SET quantity = EXCLUDED.quantity
        RETURNING *
      `;
      stockResponse = await client.query(upsertStockQuery, [
        id,
        stockQuantity,
        company_id,
      ]);
    } else {
      // Verifica se já existe produto com mesmo nome e empresa
      const existingProductQuery = `
        SELECT id FROM products WHERE name = $1 AND company_id = $2
      `;
      const existing = await client.query(existingProductQuery, [
        name,
        company_id,
      ]);

      if (existing.rows.length > 0) {
        // Já existe: atualiza
        const existingId = existing.rows[0].id;

        const updateProductQuery = `
          UPDATE products
          SET category_id = $1, price = $2, barcode = $3, ncm = $4,
              aliquota = $5, cfop = $6, cst = $7, csosn = $8
          WHERE id = $9 AND company_id = $10
          RETURNING *
        `;
        productResponse = await client.query(updateProductQuery, [
          category_id || null,
          price,
          barcode || null,
          ncm || null,
          aliquota || null,
          cfop || null,
          cst || null,
          csosn || null,
          existingId,
          company_id,
        ]);

        const upsertStockQuery = `
          INSERT INTO stock (product_id, quantity, company_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (product_id, company_id)
          DO UPDATE SET quantity = EXCLUDED.quantity
          RETURNING *
        `;
        stockResponse = await client.query(upsertStockQuery, [
          existingId,
          stockQuantity,
          company_id,
        ]);
      } else {
        // Não existe: insere
        const insertProductQuery = `
          INSERT INTO products (name, category_id, price, company_id, barcode, ncm, aliquota, cfop, cst, csosn)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;
        productResponse = await client.query(insertProductQuery, [
          name,
          category_id || null,
          price,
          company_id,
          barcode || null,
          ncm || null,
          aliquota || null,
          cfop || null,
          cst || null,
          csosn || null,
        ]);

        const newProductId = productResponse.rows[0].id;

        const insertStockQuery = `
          INSERT INTO stock (product_id, quantity, company_id)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        stockResponse = await client.query(insertStockQuery, [
          newProductId,
          stockQuantity,
          company_id,
        ]);
      }
    }

    await client.query("COMMIT");

    return {
      product: productResponse.rows[0],
      stock: stockResponse.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
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
  cst,
  csosn,
  image_url,
  quantity,
  company_id
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // A query de atualização foi expandida para incluir todos os novos campos.
    const queryProduct = `
      UPDATE products
      SET 
        name = $1, 
        category_id = $2, 
        price = $3,
        barcode = $4,
        ncm = $5,
        aliquota = $6,
        cfop = $7,
        cst = $8,
        csosn = $9,
        image_url = $10
      WHERE id = $11 AND company_id = $12
      RETURNING *
    `;

    // A lista de valores foi reordenada para corresponder exatamente à nova query.
    const valuesProduct = [
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
      product_id,
      company_id,
    ];

    const productResult = await client.query(queryProduct, valuesProduct);
    const product = productResult.rows[0];

    // Atualizar estoque (esta parte já estava correta)
    const queryStock = `
      UPDATE stock
      SET quantity = $1
      WHERE product_id = $2 AND company_id = $3
      RETURNING *
    `;
    const valuesStock = [quantity, product_id, company_id];
    const stockResult = await client.query(queryStock, valuesStock);

    // --- CORREÇÃO IMPORTANTE AQUI ---
    // A variável 'stock' precisa ser definida a partir do resultado da query.
    const stock = stockResult.rows[0];

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

const getStockQuantityByProduct = async (productId, company_id) => {
  const query = `
    SELECT quantity FROM stock
    WHERE product_id = $1 AND company_id = $2
  `;
  const values = [productId, company_id];
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

    // 2. Busca a imagem associada ao produto
    const imageQuery = `
      SELECT image_url FROM images WHERE product_id = $1
    `;
    const imageResult = await client.query(imageQuery, [product_id]);
    const image = imageResult.rows[0];

    if (image) {
      // 3. Deleta a imagem do S3
      // A URL da imagem pode ser algo como: "https://seu-bucket.s3.amazonaws.com/nome_do_arquivo.jpg"
      // Pegamos apenas o "nome_do_arquivo.jpg"
      const imageFileName = image.image_url.split("/").pop();
      await deleteImage(imageFileName);
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
    console.error("Erro ao excluir produto estoque e imagem: ", err);
    throw new Error("Erro ao excluir produto e estoque");
  } finally {
    client.release();
  }
};

/*const deleteProductAndStock = async (product_id, company_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Verifica se o produto existe
    const productCheckResult = await client.query(
      `SELECT * FROM products WHERE id = $1 AND company_id = $2`,
      [product_id, company_id]
    );

    if (productCheckResult.rows.length === 0) {
      throw new Error("Produto não encontrado ou já excluído");
    }

    console.log(
      `[REPOSITORY] Buscando produto com ID: ${product_id} e Company ID: ${company_id}`
    );
    // 2️⃣ Busca imagem associada (opcional)
    const imageResult = await client.query(
      `SELECT image_url FROM images WHERE product_id = $1 AND company_id = $2`,
      [product_id, company_id]
    );
    const image = imageResult.rows[0];

    if (image && image.image_url) {
      try {
        const imageFileName = image.image_url.split("/").pop();
        await deleteImage(imageFileName);
      } catch (err) {
        console.error("Erro ao deletar imagem do S3 (ignorado):", err);
        // não throw para não bloquear a exclusão do produto
      }
    }

    // 3️⃣ Exclui estoque se existir
    const stockResult = await client.query(
      `DELETE FROM stock WHERE product_id = $1 AND company_id = $2 RETURNING *`,
      [product_id, company_id]
    );
    console.log(`Estoque removido: ${stockResult.rowCount} item(s)`);

    // 4️⃣ Exclui produto
    const productResult = await client.query(
      `DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING *`,
      [product_id, company_id]
    );

    await client.query("COMMIT");
    return productResult.rows[0]; // retorna produto excluído
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao excluir produto e estoque:", err);
    throw new Error("Erro ao excluir produto");
  } finally {
    client.release();
  }
};*/

export default {
  getProductsByClient,
  upsertProductAndStock,
  updateProductAndStock,
  updateStockByBarcode,
  getStockQuantityByProduct,
  deleteProductAndStock,
  findProductByNameAndCompany,
};
