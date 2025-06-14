import express from "express";
import cors from "cors";
import routerproduct from "./routes/routes.products.js";
import routercompany from "./routes/routes.company.js";
import routerclient from "./routes/routes.client.js";
import routeremployee from "./routes/routes.employee.js";
import routercategory from "./routes/routes.category.js";
import routersales from "./routes/routes.sales.js";
import routerVehicles from "./routes/routes.vehicles.js";
import routerVehicleservices from "./routes/routes.vehicle_services.js";
import dotenv from "dotenv";

dotenv.config(); // Carregar variáveis de ambiente

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  routerproduct,
  routercompany,
  routerclient,
  routeremployee,
  routercategory,
  routersales,
  routerVehicles,
  routerVehicleservices
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
