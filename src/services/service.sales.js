import salesRepository from "../repositories/repository.sales.js";
//import stockRepository from "../repositories/repository.sales.js";

/*const createSaleService = async (saleData) => {
  // Validação de quantity
  if (Array.isArray(saleData)) {
    for (let sale of saleData) {
      if (!sale.quantity || sale.quantity <= 0) {
        throw new Error("Quantidade inválida.");
      }
    }
  } else {
    if (!saleData.quantity || saleData.quantity <= 0) {
      throw new Error("Quantidade inválida.");
    }
  }

  // Chama o repositório para salvar as vendas no banco
  return await salesRepository.createSale(saleData);
};*/

const createSaleService = async (saleData) => {
  console.log("Dado recebido no service:", saleData);

  // Validação de quantity
  if (Array.isArray(saleData)) {
    for (let sale of saleData) {
      if (!sale.quantity || sale.quantity <= 0) {
        throw new Error("Quantidade inválida.");
      }
    }
  } else {
    if (!saleData.quantity || saleData.quantity <= 0) {
      throw new Error("Quantidade inválida.");
    }
  }

  // Chama o repositório para salvar as vendas no banco
  const result = await salesRepository.createSale(saleData);
  return result;
};

const getSalesByCompanyIdService = async (company_id) => {
  return await salesRepository.getSalesByCompanyId(company_id);
};

const getSaleByIdAndCompanyIdService = async (id, company_id) => {
  return await salesRepository.getSaleByIdAndCompanyId(id, company_id);
};

/*const getSalesByDateRangeService = async (company_id, startDate, endDate) => {
  return await salesRepository.getSalesByDateRange(
    company_id,
    startDate,
    endDate
  );
};*/

/*const getSalesByDateRangeService = async (
  company_id,
  startDate,
  endDate,
  employeeId
) => {
  // Adicione este log para verificar os parâmetros que estão sendo passados
  console.log("Service - Parâmetros para o Repository:", {
    company_id,
    startDate,
    endDate,
    employeeId,
  });

  return await salesRepository.getSalesByDateRange(
    company_id,
    startDate,
    endDate,
    employeeId
  );
};*/

/*const getSalesByDateRangeService = async (
  company_id,
  startDate,
  endDate,
  employeeId
) => {
  console.log("Service - Parâmetros recebidos:", {
    company_id,
    startDate,
    endDate,
    employeeId,
  });
  return await salesRepository.getSalesByDateRange(
    company_id,
    startDate,
    endDate,
    employeeId
  );
};*/

/*const getSalesByDateRangeService = async (
  company_id,
  startDate,
  endDate,
  employeeId
) => {
  console.log("Service - Parâmetros recebidos:", {
    company_id,
    startDate,
    endDate,
    employeeId,
  });

  if (!startDate || !endDate) {
    throw new Error("As datas de início e fim são obrigatórias.");
  }

  return await salesRepository.getSalesByDateRange(
    company_id,
    startDate,
    endDate,
    employeeId
  );
};*/

const getSalesByDateRangeService = async ({
  company_id,
  startDate,
  endDate,
  employee_id,
  client_id,
  vehicle_id,
}) => {
  const employeeFilter = employee_id ? parseInt(employee_id, 10) : null;
  const clientFilter = client_id ? parseInt(client_id, 10) : null;
  const vehicleFilter = vehicle_id ? parseInt(vehicle_id, 10) : null;

  const sales = await salesRepository.getSalesByDateRange({
    company_id,
    startDate,
    endDate,
    employee_id: employeeFilter,
    client_id: clientFilter,
    vehicle_id: vehicleFilter,
  });

  return sales;
};

const getSalesByVehicleIdService = async (company_id, vehicle_id) => {
  if (!company_id || !vehicle_id) {
    throw new Error("company_id e vehicle_id são obrigatórios.");
  }

  const sales = await salesRepository.getSalesByVehicleId(
    company_id,
    vehicle_id
  );
  return sales;
};

//Busca produtos por período / qtde vendida

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

//BUSCAPRODUTOS
const getMostSoldProductsByDateRangeService = async (
  company_id,
  startDate,
  endDate
) => {
  if (!startDate || !endDate) {
    throw new Error("Datas de início e fim são obrigatórias.");
  }

  return await salesRepository.getMostSoldProductsByDateRange(
    company_id,
    startDate,
    endDate
  );
};

const updateSaleService = async (id, company_id, saleData) => {
  return await salesRepository.updateSaleById(id, company_id, saleData);
};

const deleteSaleService = async (id, company_id) => {
  return await salesRepository.deleteSaleById(id, company_id);
};

export default {
  createSaleService,
  getSalesByCompanyIdService,
  getSaleByIdAndCompanyIdService,
  getMostSoldProductsByDateRangeService,
  getSalesByDateRangeService,
  getSalesByVehicleIdService,
  updateSaleService,
  deleteSaleService,
};
