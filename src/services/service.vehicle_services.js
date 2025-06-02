import vehicleRepository from "../repositories/repository.vehicle_services.js";

const createVehicleServiceService = async (vehicleData, client) => {
  return await vehicleRepository.createVehicleService(vehicleData, client);
};

const getUpcomingOilChangesService = async () => {
  return await vehicleRepository.getUpcomingOilChanges();
};

export default {
  createVehicleServiceService,
  getUpcomingOilChangesService,
};
