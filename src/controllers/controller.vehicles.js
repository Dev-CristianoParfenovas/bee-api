import serviceVehicles from "../services/service.vehicles.js";

const createVehicle = async (req, res) => {
  const { company_id, client_id, license_plate, model, color, year } = req.body;

  try {
    const vehicle = await serviceVehicles.createVehicle(
      company_id,
      client_id,
      license_plate,
      model,
      color,
      year
    );

    return res.status(201).json({
      message: "Veículo cadastrado com sucesso.",
      vehicle,
    });
  } catch (error) {
    console.error("Erro ao criar veículo:", error.message);
    return res.status(500).json({
      message: "Erro ao cadastrar veículo.",
      error: error.message,
    });
  }
};

const getVehiclesByClient = async (req, res) => {
  const { company_id, client_id } = req.params;

  try {
    const vehicles = await serviceVehicles.getVehiclesByClient(
      company_id,
      client_id
    );

    if (vehicles.length === 0) {
      return res.status(200).json({
        message: "Nenhum veículo encontrado para este cliente.",
        data: [],
      });
    }

    return res.status(200).json({ data: vehicles });
  } catch (error) {
    console.error("Erro ao buscar veículos:", error.message);
    return res.status(500).json({
      message: "Erro ao buscar veículos.",
      error: error.message,
    });
  }
};

// *** Aqui está a função de login do veículo ***
const loginVehicle = async (req, res) => {
  const { license_plate } = req.body;

  try {
    const loginResult = await serviceVehicles.loginVehicle(license_plate);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token: loginResult.token,
      vehicle: loginResult.vehicle,
    });
  } catch (error) {
    console.error("Erro no login do veículo:", error.message);
    return res.status(401).json({
      message: "Falha no login",
      error: error.message,
    });
  }
};

const deleteVehicle = async (req, res) => {
  const { id_vehicle } = req.params;

  try {
    const deletedVehicle = await serviceVehicles.deleteVehicle(id_vehicle);

    return res.status(200).json({
      message: "Veículo deletado com sucesso.",
      vehicle: deletedVehicle,
    });
  } catch (error) {
    console.error("Erro ao deletar veículo:", error.message);
    return res.status(500).json({
      message: "Erro ao deletar veículo.",
      error: error.message,
    });
  }
};

export default {
  createVehicle,
  getVehiclesByClient,
  loginVehicle,
  deleteVehicle,
};
