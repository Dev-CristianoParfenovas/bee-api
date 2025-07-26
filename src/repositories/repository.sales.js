import pool from "../db/connection.js";
import serviceVehiclesRepository from "./repository.vehicle_services.js";

const createSale = async (saleData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const handleStockUpdate = async (productId, companyId, quantity) => {
      const productCheck = await client.query(
        `SELECT id FROM products WHERE id = $1 AND company_id = $2`,
        [productId, companyId]
      );

      if (productCheck.rows.length === 0) {
        throw new Error(`Produto com ID ${productId} não encontrado.`);
      }

      const stockResult = await client.query(
        `SELECT quantity FROM stock WHERE product_id = $1 AND company_id = $2 FOR UPDATE`,
        [productId, companyId]
      );

      if (stockResult.rows.length === 0) {
        console.warn(
          `Produto com ID ${productId} não tem estoque registrado. Criando estoque com quantidade 0.`
        );

        // Cria o estoque com quantidade zero para evitar erro de chave estrangeira
        await client.query(
          `INSERT INTO stock (product_id, company_id, quantity) VALUES ($1, $2, 0)`,
          [productId, companyId]
        );

        // Depois, não precisa atualizar o estoque, pois quantidade está em 0
        return;
      }

      const currentStock = stockResult.rows[0].quantity;

      if (currentStock < quantity) {
        throw new Error(
          `Estoque insuficiente para o produto com ID ${productId}.`
        );
      }

      await client.query(
        `UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2 AND company_id = $3`,
        [quantity, productId, companyId]
      );
    };

    const processSale = async (sale) => {
      const vehicleInfo = {
        vehicle_id: sale.vehicleInfo?.vehicle_id || null,
        km: sale.vehicleInfo?.km || null,
        license_plate: sale.vehicleInfo?.license_plate || null,
      };

      if (sale.product_id <= 0 || isNaN(sale.product_id)) {
        throw new Error(`ID do produto inválido: ${sale.product_id}`);
      }

      await handleStockUpdate(sale.product_id, sale.company_id, sale.quantity);

      console.log("Processando venda:", sale);

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
        INSERT INTO sales (company_id, product_id, id_client, employee_id, quantity, total_price, sale_date, tipovenda, id_vehicle, km, license_plate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        vehicleInfo.vehicle_id,
        vehicleInfo.km != null ? String(vehicleInfo.km).trim() : null,
        vehicleInfo.license_plate,
      ];

      const result = await client.query(query, values);
      // return result.rows[0];

      // ✅ Adiciona o vehicleInfo ao retorno da venda
      const finalSale = {
        ...result.rows[0],
        vehicleInfo: sale.vehicleInfo || null,
      };

      return finalSale;
    };

    let insertedSales;
    if (Array.isArray(saleData)) {
      const salePromises = saleData.map(processSale);
      insertedSales = await Promise.all(salePromises);
    } else {
      insertedSales = [await processSale(saleData)];
    }

    // === AQUI ===
    for (const sale of insertedSales) {
      const categoryQuery = `
        SELECT c.notification 
        FROM categories c
        JOIN products p ON p.category_id = c.id
        WHERE p.id = $1 AND p.company_id = $2
      `;
      const categoryResult = await client.query(categoryQuery, [
        sale.product_id,
        sale.company_id,
      ]);

      const notifications = categoryResult.rows.map((row) => row.notification);

      if (notifications.some((n) => n === true)) {
        // Aqui você deve ter os dados do veículo no objeto sale (ex: sale.vehicleInfo)
        if (sale.vehicleInfo) {
          await serviceVehiclesRepository.createVehicleService(
            {
              sale_id: sale.id,
              license_plate: sale.vehicleInfo.license_plate,
              model: sale.vehicleInfo.model,
              km: sale.vehicleInfo.km,
              company_id: sale.company_id,
              employee_id: sale.employee_id,
              client_id: sale.id_client,
              vehicle_id: sale.vehicleInfo.vehicle_id,
            },
            client
          );
        }
      }
    }
    // === FIM DA PARTE NOVA ===

    await client.query("COMMIT");
    return insertedSales;
  } catch (error) {
    await client.query("ROLLBACK");
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

/*050625const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
  vehicle_id,
}) => {
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

  if (employee_id) {
    query += ` AND sales.employee_id = $${values.length + 1}`;
    values.push(employee_id);
  }

  if (client_id) {
    query += ` AND sales.id_client = $${values.length + 1}`;
    values.push(client_id);
  }

  if (vehicle_id) {
    query += ` AND sales.id_vehicle = $${values.length + 1}`;
    values.push(vehicle_id);
  }

  console.log("Query gerada no repositório:", query, values);

  const { rows } = await pool.query(query, values);
  return rows;
};050625*/

/*250725 const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
  vehicle_id,
}) => {
  let query = `
    SELECT
      sales.*,
      clients.name AS client_name,
      employees.name AS employee_name,
      service_vehicles.model AS model
    FROM sales
    LEFT JOIN clients ON sales.id_client = clients.id_client
    LEFT JOIN employees ON sales.employee_id = employees.id_employee   
    LEFT JOIN service_vehicles ON sales.id = service_vehicles.sale_id    
    WHERE sales.company_id = $1
      AND sales.sale_date BETWEEN $2 AND $3
  `;

  const values = [company_id, startDate, endDate];

  if (employee_id) {
    query += ` AND sales.employee_id = $${values.length + 1}`;
    values.push(employee_id);
  }

  if (client_id) {
    query += ` AND sales.id_client = $${values.length + 1}`;
    values.push(client_id);
  }

  // Agora, o filtro por vehicle_id usará a coluna da tabela service_vehicles
  if (vehicle_id) {
    query += ` AND service_vehicles.vehicle_id = $${values.length + 1}`;
    values.push(vehicle_id);
  }

  console.log("Query gerada no repositório:", query, values);

  const { rows } = await pool.query(query, values);
  return rows;
};*/

/* 25 07 2025 const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
  vehicle_id,
}) => {
  let query = `
    SELECT DISTINCT ON (sales.id)
      sales.id,
      sales.total_price,
      sales.sale_date,
      clients.name AS client_name,
      employees.name AS employee_name
    FROM sales
    LEFT JOIN clients ON sales.id_client = clients.id_client
    LEFT JOIN employees ON sales.employee_id = employees.id_employee
    LEFT JOIN service_vehicles ON sales.id = service_vehicles.sale_id
    WHERE sales.company_id = $1
      AND sales.sale_date BETWEEN $2 AND $3
  `;

  const values = [company_id, startDate, endDate];

  if (employee_id) {
    query += ` AND sales.employee_id = $${values.length + 1}`;
    values.push(employee_id);
  }

  if (client_id) {
    query += ` AND sales.id_client = $${values.length + 1}`;
    values.push(client_id);
  }

  if (vehicle_id) {
    query += ` AND service_vehicles.vehicle_id = $${values.length + 1}`;
    values.push(vehicle_id);
  }

  query += ` ORDER BY sales.id, sales.sale_date DESC`;

  const { rows } = await pool.query(query, values);
  return rows;
};*/

const getSalesByDateRange = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
  vehicle_id,
}) => {
  let query = `
    SELECT
      sales.id,
      sales.total_price,
      sales.sale_date,
      clients.name AS client_name,
      employees.name AS employee_name,
      sales.employee_id
    FROM sales
    LEFT JOIN clients ON sales.id_client = clients.id_client
    LEFT JOIN employees ON sales.employee_id = employees.id_employee
  `;

  const values = [company_id, startDate, endDate];
  let conditions = [
    `sales.company_id = $1`,
    `sales.sale_date BETWEEN $2 AND $3`,
  ];

  if (employee_id) {
    values.push(employee_id);
    conditions.push(`sales.employee_id = $${values.length}`);
  }

  if (client_id) {
    values.push(client_id);
    conditions.push(`sales.id_client = $${values.length}`);
  }

  if (vehicle_id) {
    values.push(vehicle_id);
    conditions.push(`sales.id_vehicle = $${values.length}`);
  }

  query += ` WHERE ${conditions.join(" AND ")}`;
  query += ` ORDER BY sales.sale_date DESC`;

  const { rows } = await pool.query(query, values);
  return rows;
};

//POR ID DO VEÍCULO
const getSalesByVehicleId = async (company_id, vehicle_id) => {
  const query = `
    SELECT sales.*
    FROM sales
    WHERE sales.company_id = $1 AND sales.vehicle_id = $2
  `;
  const result = await pool.query(query, [company_id, vehicle_id]);
  return result.rows;
};

//BUSCAPRODUTOS
const getMostSoldProductsByDateRange = async (
  company_id,
  startDate,
  endDate
) => {
  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      SUM(s.quantity) AS total_quantity,
      SUM(s.total_price) AS total_revenue
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE s.company_id = $1
      AND s.sale_date BETWEEN $2 AND $3
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
  `;
  const result = await pool.query(query, [company_id, startDate, endDate]);
  return result.rows;
};

const getProductsBySaleId = async (company_id, saleId) => {
  const query = `
    SELECT 
      si.product_id,
      p.name AS product_name,
      si.quantity,
      si.unit_price,
      si.total_price
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE si.sale_id = $1 AND s.company_id = $2
  `;

  try {
    const result = await pool.query(query, [saleId, company_id]);
    return result.rows;
  } catch (error) {
    console.error("Erro no repository:", error);
    throw error; // reenvia para ser tratado no controller
  }
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
  getSalesByVehicleId,
  getProductsBySaleId,
  getSaleByIdAndCompanyId,
  getMostSoldProductsByDateRange,
  updateSaleById,
  deleteSaleById,
};
