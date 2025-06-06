import pool from "../db/connection.js";

/*const createVehicleService = async (vehicleData, client) => {
  const { sale_id, license_plate, km, company_id, employee_id, client_id } =
    vehicleData;

  const query = `
    INSERT INTO vehicle_services (
      sale_id, license_plate, km, company_id, employee_id, client_id, next_oil_change
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '6 months')
    RETURNING *
  `;

  const values = [
    sale_id,
    license_plate,
    km,
    company_id,
    employee_id,
    client_id,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};*/

/*const createVehicleService = async (
  sale_id,
  license_plate,
  km,
  company_id,
  employee_id,
  client_id
) => {
  const query = `
        INSERT INTO service_vehicles (
      sale_id, license_plate, km, company_id, employee_id, client_id, next_oil_change
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '6 months')
    RETURNING *
    `;
  const values = [
    parseInt(sale_id),
    license_plate,
    parseInt(km),
    parseInt(company_id),
    parseInt(employee_id),
    parseInt(client_id),
  ];

  console.log("Valores para inserção:", values);
  const result = await pool.query(query, values);
  return result.rows[0];
};*/

const createVehicleService = async (
  {
    sale_id,
    license_plate,
    model,
    km,
    company_id,
    employee_id,
    client_id,
    vehicle_id,
  },
  client // <- se estiver usando transação
) => {
  const query = `
      INSERT INTO service_vehicles (
        sale_id, license_plate, model, km, company_id, employee_id, client_id, vehicle_id, next_oil_change
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '6 months')
      RETURNING *
    `;

  const values = [
    parseInt(sale_id),
    license_plate,
    model,
    parseFloat(km), // como `km` é numeric
    parseInt(company_id),
    parseInt(employee_id),
    parseInt(client_id),
    parseInt(vehicle_id),
  ];

  console.log("Valores para inserção:", values);

  const result = await (client || pool).query(query, values);
  return result.rows[0];
};

const getUpcomingOilChanges = async () => {
  const query = `
    SELECT * FROM vehicle_services
    WHERE next_oil_change BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  `;
  const result = await pool.query(query);
  return result.rows;
};

export default {
  createVehicleService,
  getUpcomingOilChanges,
};
