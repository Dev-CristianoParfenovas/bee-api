import pool from "../db/connection.js";
import jwt from "../jwt/token.js";
import bcrypt from "bcrypt";

const createVehicle = async (
  company_id,
  client_id,
  license_plate,
  model,
  color,
  year
) => {
  const query = `
    INSERT INTO vehicles (company_id, client_id, license_plate, model, color, year)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [company_id, client_id, license_plate, model, color, year];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getVehiclesByClient = async (company_id, client_id) => {
  try {
    const query = `
      SELECT * FROM vehicles
      WHERE company_id = $1 AND client_id = $2;
    `;
    const values = [company_id, client_id];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Erro ao buscar veículos no repositório:", error.message);
    throw new Error("Erro ao buscar veículos no banco de dados.");
  }
};

// 🚗 Login de veículo com uso de JWT e bcrypt
const loginVehicle = async (license_plate) => {
  const query = `SELECT * FROM vehicles WHERE license_plate = $1 LIMIT 1;`;
  const values = [license_plate];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error("Veículo não encontrado");
  }

  const vehicle = result.rows[0];

  const token = jwt.createJWT(vehicle.id_vehicle); // ou outro campo que representa o id do veículo

  return {
    token,
    vehicle: {
      id_vehicle: vehicle.id_vehicle,
      license_plate: vehicle.license_plate,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
    },
  };
};

const deleteVehicle = async (id_vehicle) => {
  const query = `DELETE FROM vehicles WHERE id_vehicle = $1 RETURNING *;`;
  const values = [id_vehicle];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error("Veículo não encontrado ou já foi deletado.");
  }

  return result.rows[0];
};

export default {
  createVehicle,
  getVehiclesByClient,
  loginVehicle,
  deleteVehicle,
};
