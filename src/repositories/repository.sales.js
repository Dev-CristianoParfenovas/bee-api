import pool from "../db/connection.js";

/*const createSale = async (saleData) => {
  // Função para verificar e atualizar o estoque
  const handleStockUpdate = async (productId, companyId, quantity) => {
    const stockQuery = `
      SELECT quantity FROM stock WHERE product_id = $1 AND company_id = $2
    `;
    const stockResult = await pool.query(stockQuery, [productId, companyId]);

    if (stockResult.rows.length === 0) {
      throw new Error(`Estoque do produto com ID ${productId} não encontrado.`);
    }

    const currentStock = stockResult.rows[0].quantity;
    if (currentStock < quantity) {
      throw new Error(
        `Estoque insuficiente para o produto com ID ${productId}.`
      );
    }

    const updateStockQuery = `
      UPDATE stock SET quantity = quantity - $1
      WHERE product_id = $2 AND company_id = $3
    `;
    await pool.query(updateStockQuery, [quantity, productId, companyId]);
  };

  // Verificar e processar a venda (para um ou mais itens)
  const processSale = async (sale) => {
    await handleStockUpdate(sale.product_id, sale.company_id, sale.quantity);

    const productQuery = `
      SELECT price FROM products WHERE id = $1 AND company_id = $2
    `;
    const productResult = await pool.query(productQuery, [
      sale.product_id,
      sale.company_id,
    ]);

    if (productResult.rows.length === 0) {
      throw new Error(`Produto com ID ${sale.product_id} não encontrado.`);
    }

    const productPrice = productResult.rows[0].price;
    const totalPrice = productPrice * sale.quantity;

    const query = `
      INSERT INTO sales (company_id, product_id, id_client, employee_id, quantity, total_price, sale_date, tipovenda)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      sale.company_id,
      sale.product_id,
      sale.id_client,
      sale.employee_id,
      parseFloat(sale.quantity),
      parseFloat(totalPrice),
      sale.sale_date || new Date(),
      sale.tipovenda || 0,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  };

  if (Array.isArray(saleData)) {
    const salePromises = saleData.map(processSale);
    return await Promise.all(salePromises);
  }

  return await processSale(saleData);
};*/

/*020625const createSale = async (saleData) => {
  // Função para verificar e atualizar o estoque
  const handleStockUpdate = async (productId, companyId, quantity) => {
    const stockQuery = `
      SELECT quantity FROM stock WHERE product_id = $1 AND company_id = $2
    `;
    const stockResult = await pool.query(stockQuery, [productId, companyId]);

    if (stockResult.rows.length === 0) {
      throw new Error(`Estoque do produto com ID ${productId} não encontrado.`);
    }

    const currentStock = stockResult.rows[0].quantity;
    if (currentStock < quantity) {
      throw new Error(
        `Estoque insuficiente para o produto com ID ${productId}.`
      );
    }

    const updateStockQuery = `
      UPDATE stock SET quantity = quantity - $1
      WHERE product_id = $2 AND company_id = $3
    `;
    await pool.query(updateStockQuery, [quantity, productId, companyId]);
  };

  // Verificar e processar a venda (para um ou mais itens)
  const processSale = async (sale) => {
    // Atualizar o estoque antes de registrar a venda
    await handleStockUpdate(sale.product_id, sale.company_id, sale.quantity);

    // Validar o formato da data ou definir uma padrão
    let saleDate = sale.sale_date;
    if (!saleDate) {
      saleDate = new Date().toISOString(); // Definir data padrão no formato ISO 8601
    } else if (isNaN(new Date(saleDate).getTime())) {
      throw new Error("Formato de data inválido para sale_date.");
    }

    // Buscar o preço do produto para cálculo do preço total
    const productQuery = `
      SELECT price FROM products WHERE id = $1 AND company_id = $2
    `;
    const productResult = await pool.query(productQuery, [
      sale.product_id,
      sale.company_id,
    ]);

    if (productResult.rows.length === 0) {
      // throw new Error(`Produto com ID ${sale.product_id} não encontrado.`);
      throw new Error(`Produto não encontrado ou não pertence à empresa.`);
    }

    const productPrice = parseFloat(productResult.rows[0].price);
    if (isNaN(productPrice)) {
      throw new Error("Preço do produto inválido.");
    }

    const totalPrice = productPrice * sale.quantity;

    // Inserir a venda no banco de dados
    const query = `
      INSERT INTO sales (company_id, product_id, id_client, employee_id, quantity, total_price, sale_date, tipovenda)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      sale.company_id,
      sale.product_id,
      sale.id_client,
      sale.employee_id,
      parseFloat(sale.quantity),
      parseFloat(totalPrice.toFixed(2)), // Garantir precisão no preço total
      saleDate,
      sale.tipovenda || 0,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  };

  // Se for um array de vendas, processar todas
  if (Array.isArray(saleData)) {
    const salePromises = saleData.map(processSale);
    return await Promise.all(salePromises);
  }

  // Processar uma única venda
  return await processSale(saleData);
};*/

/* sugestao do gptconst createSale = async (req, res) => {
  const sales = Array.isArray(salesData) ? salesData : [salesData];

  const client = await pool.connect(); // Pega uma conexão para a transação

  try {
    await client.query("BEGIN"); // Inicia a transação

    for (const sale of sales) {
      const productResult = await client.query(
        "SELECT price, stock FROM products WHERE id = $1 AND company_id = $2",
        [sale.product_id, sale.company_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Produto não encontrado para o ID ${sale.product_id}`);
      }

      const product = productResult.rows[0];
      const productPrice = parseFloat(product.price);
      const currentStock = parseInt(product.stock);
      const saleQuantity = parseInt(sale.quantity);

      if (saleQuantity > currentStock) {
        throw new Error(
          `Estoque insuficiente para o produto ID ${sale.product_id}`
        );
      }

      const totalPrice = productPrice * saleQuantity;
      const saleDate = new Date();

      await client.query(
        `INSERT INTO sales (company_id, product_id, id_client, employee_id, quantity, total_price, date, tipovenda)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          sale.company_id,
          sale.product_id,
          sale.id_client,
          sale.employee_id,
          saleQuantity,
          parseFloat(totalPrice.toFixed(2)),
          saleDate,
          sale.tipovenda || 0,
        ]
      );

      const newStock = currentStock - saleQuantity;
      await client.query(
        "UPDATE products SET stock = $1 WHERE id = $2 AND company_id = $3",
        [newStock, sale.product_id, sale.company_id]
      );
    }

    await client.query("COMMIT"); // Confirma todas as mudanças
    res.status(201).json({ message: "Venda(s) registrada(s) com sucesso" });
  } catch (error) {
    await client.query("ROLLBACK"); // Reverte tudo em caso de erro
    console.error("Erro ao registrar venda:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release(); // Libera a conexão de volta ao pool
  }
};020625*/

const createSale = async (saleData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Inicia transação

    // Função para verificar e atualizar estoque dentro da transação
    const handleStockUpdate = async (productId, companyId, quantity) => {
      const stockQuery = `
        SELECT quantity FROM stock WHERE product_id = $1 AND company_id = $2 FOR UPDATE
      `;
      // FOR UPDATE bloqueia a linha para evitar race conditions
      const stockResult = await client.query(stockQuery, [
        productId,
        companyId,
      ]);

      if (stockResult.rows.length === 0) {
        throw new Error(
          `Estoque do produto com ID ${productId} não encontrado.`
        );
      }

      const currentStock = stockResult.rows[0].quantity;
      if (currentStock < quantity) {
        throw new Error(
          `Estoque insuficiente para o produto com ID ${productId}.`
        );
      }

      const updateStockQuery = `
        UPDATE stock SET quantity = quantity - $1
        WHERE product_id = $2 AND company_id = $3
      `;
      await client.query(updateStockQuery, [quantity, productId, companyId]);
    };

    // Função que processa uma venda individual dentro da transação
    const processSale = async (sale) => {
      await handleStockUpdate(sale.product_id, sale.company_id, sale.quantity);

      let saleDate = sale.sale_date;
      if (!saleDate) {
        saleDate = new Date().toISOString();
      } else if (isNaN(new Date(saleDate).getTime())) {
        throw new Error("Formato de data inválido para sale_date.");
      }

      const productQuery = `
        SELECT price FROM products WHERE id = $1 AND company_id = $2
      `;
      const productResult = await client.query(productQuery, [
        sale.product_id,
        sale.company_id,
      ]);

      if (productResult.rows.length === 0) {
        throw new Error(`Produto não encontrado ou não pertence à empresa.`);
      }

      const productPrice = parseFloat(productResult.rows[0].price);
      if (isNaN(productPrice)) {
        throw new Error("Preço do produto inválido.");
      }

      const totalPrice = productPrice * sale.quantity;

      const query = `
        INSERT INTO sales (company_id, product_id, id_client, employee_id, quantity, total_price, sale_date, tipovenda)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        sale.company_id,
        sale.product_id,
        sale.id_client,
        sale.employee_id,
        parseFloat(sale.quantity),
        parseFloat(totalPrice.toFixed(2)),
        saleDate,
        sale.tipovenda || 0,
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    };

    // Se for array, processa todas as vendas
    let insertedSales;
    if (Array.isArray(saleData)) {
      const salePromises = saleData.map(processSale);
      insertedSales = await Promise.all(salePromises);
    } else {
      insertedSales = [await processSale(saleData)];
    }

    await client.query("COMMIT"); // Confirma transação
    return insertedSales;
  } catch (error) {
    await client.query("ROLLBACK"); // Desfaz tudo se erro
    throw error;
  } finally {
    client.release();
  }
};

const getSalesByCompanyId = async (company_id, tipovenda) => {
  const query = `
    SELECT * FROM sales
    WHERE company_id = $1 AND tipovenda = $2;
  `;
  const result = await pool.query(query, [company_id, tipovenda]);
  return result.rows;
};

const getSaleByIdAndCompanyId = async (id, company_id) => {
  const query = `SELECT * FROM sales WHERE id = $1 AND company_id = $2`;
  const result = await pool.query(query, [id, company_id]);
  return result.rows[0];
};

/*const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
}) => {
  const query = `
    SELECT
      sales.*,
      clients.name AS client_name,
      employees.name AS employee_name
    FROM sales
    LEFT JOIN clients ON sales.id_client = clients.id_client
    LEFT JOIN employees ON sales.employee_id = employees.id_employee
    WHERE sales.company_id = $1
      AND sales.sale_date BETWEEN $2 AND $3
      ${employee_id ? `AND sales.employee_id = $4` : ""}
      ${client_id ? `AND sales.id_client = $5` : ""}
  `;

  const values = [company_id, startDate, endDate];
  if (employee_id) values.push(employee_id);
  if (client_id) values.push(client_id);

  console.log("Query gerada no repositório:", query, values);

  const { rows } = await pool.query(query, values);
  return rows;
};*/

const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
}) => {
  // Inicializando a query com as condições básicas
  let query = `
    SELECT
      sales.*,
      clients.name AS client_name,
      employees.name AS employee_name
    FROM sales
    LEFT JOIN clients ON sales.id_client = clients.id_client
    LEFT JOIN employees ON sales.employee_id = employees.id_employee
    WHERE sales.company_id = $1
      AND sales.sale_date BETWEEN $2 AND $3
  `;

  const values = [company_id, startDate, endDate];

  // Condicional para o filtro de funcionário
  if (employee_id) {
    query += ` AND sales.employee_id = $${values.length + 1}`;
    values.push(employee_id);
  }

  // Condicional para o filtro de cliente
  if (client_id) {
    query += ` AND sales.id_client = $${values.length + 1}`;
    values.push(client_id);
  }

  console.log("Query gerada no repositório:", query, values);

  const { rows } = await pool.query(query, values);
  return rows;
};

const updateSaleById = async (id, company_id, saleData) => {
  const query = `
    UPDATE sales
    SET product_id = $1, quantity = $2, total_price = $3, tipovenda = $4
    WHERE id = $5 AND company_id = $6
    RETURNING *;
  `;
  const values = [
    saleData.product_id,
    saleData.quantity,
    saleData.total_price,
    saleData.tipovenda, // Atualizando o campo tipovenda
    id,
    company_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteSaleById = async (id, company_id) => {
  const query = `DELETE FROM sales WHERE id = $1 AND company_id = $2 RETURNING *;`;
  const result = await pool.query(query, [id, company_id]);
  return result.rows[0];
};

export default {
  createSale,
  getSalesByCompanyId,
  getSalesByDateRange,
  getSaleByIdAndCompanyId,
  updateSaleById,
  deleteSaleById,
};
