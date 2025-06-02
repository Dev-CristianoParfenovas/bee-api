import serviceVehiclesService from "../services/service.vehicle_services.js";

// Criação de um novo registro de serviço de veículo
const createVehicleServiceController = async (req, res) => {
  const { sale_id, license_plate, km, company_id, employee_id, client_id } =
    req.body;

  try {
    const client = req.pgClient; // usando o client da transação, se necessário
    const vehicleservices =
      await serviceVehiclesService.createVehicleServiceService(
        { sale_id, license_plate, km, company_id, employee_id, client_id },
        client
      );

    return res.status(201).json({
      message: "Serviço de veículo cadastrado com sucesso.",
      vehicleservices,
    });
  } catch (error) {
    console.error("Erro ao criar serviço do veículo:", error.message);
    return res.status(500).json({
      message: "Erro ao cadastrar serviço do veículo.",
      error: error.message,
    });
  }
};

// Consulta de trocas de óleo nos próximos 7 dias
const getUpcomingOilChangesController = async (req, res) => {
  try {
    const upcomingChanges =
      await serviceVehiclesService.getUpcomingOilChangesService();
    res.status(200).json(upcomingChanges);
  } catch (error) {
    console.error("Erro ao buscar trocas de óleo:", error);
    res.status(500).json({ message: "Erro interno ao buscar trocas de óleo" });
  }
};
export default {
  createVehicleServiceController,
  getUpcomingOilChangesController,
};
