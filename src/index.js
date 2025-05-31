import express from "express";
import cors from "cors";
import routerproduct from "./routes/routes.products.js";
import routercompany from "./routes/routes.company.js";
import routerclient from "./routes/routes.client.js";
import routeremployee from "./routes/routes.employee.js";
import routercategory from "./routes/routes.category.js";
import routersales from "./routes/routes.sales.js";
import routerVehicles from "./routes/routes.vehicles.js";
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
  routerVehicles
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
