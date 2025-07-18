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

// Rota raiz simples para teste
app.get("/", (req, res) => {
  res.send("API está no ar!");
});

// Rotas com prefixos
app.use("/products", routerproduct);
app.use("/company", routercompany);
app.use("/clients", routerclient);
app.use("/employees", routeremployee);
app.use("/categories", routercategory);
app.use("/sales", routersales);
app.use("/vehicles", routerVehicles);
app.use("/vehicle_services", routerVehicleservices);

// Listar rotas carregadas para debug
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
