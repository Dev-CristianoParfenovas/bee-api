import vehiclesRepository from "../repositories/repository.vehicles.js";

const createVehicle = async (
  company_id,
  client_id,
  license_plate,
  model,
  color,
  year
) => {
  // Aqui você pode incluir validações e lógica adicional se necessário
  return await vehiclesRepository.createVehicle(
    company_id,
    client_id,
    license_plate,
    model,
    color,
    year
  );
};

const getVehiclesByClient = async (company_id, client_id) => {
  return await vehiclesRepository.getVehiclesByClient(company_id, client_id);
};

const loginVehicle = async (license_plate) => {
  return await vehiclesRepository.loginVehicle(license_plate);
};

const deleteVehicle = async (id_vehicle) => {
  return await vehiclesRepository.deleteVehicle(id_vehicle);
};

export default {
  createVehicle,
  getVehiclesByClient,
  loginVehicle,
  deleteVehicle,
};
