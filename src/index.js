// index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routerproduct from "./routes/routes.products.js";
import routercompany from "./routes/routes.company.js";
import routerclient from "./routes/routes.client.js";
import routeremployee from "./routes/routes.employee.js";
import routercategory from "./routes/routes.category.js";
import routerImage from "./routes/routes.images.js";
import routersales from "./routes/routes.sales.js";
import routerVehicles from "./routes/routes.vehicles.js";
import routerVehicleservices from "./routes/routes.vehicle_services.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// NÃO use middlewares de JSON e URL-encoded aqui globalmente, pois eles
// interferem com o upload de arquivos (multipart/form-data).
// Eles serão aplicados nas rotas específicas que precisam deles.

// Middleware para servir a pasta 'uploads' estaticamente
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rota raiz simples para teste
app.get("/", (req, res) => {
  res.send("API está no ar!");
});

// Aplica o middleware de JSON/URL-encoded apenas às rotas que precisam dele
// O middleware de upload de imagens será aplicado apenas na rota de imagens
app.use(
  "/products",
  express.json(),
  express.urlencoded({ extended: true }),
  routerproduct
);
app.use(
  "/company",
  express.json(),
  express.urlencoded({ extended: true }),
  routercompany
);
app.use(
  "/clients",
  express.json(),
  express.urlencoded({ extended: true }),
  routerclient
);
app.use(
  "/employees",
  express.json(),
  express.urlencoded({ extended: true }),
  routeremployee
);
app.use(
  "/categories",
  express.json(),
  express.urlencoded({ extended: true }),
  routercategory
);
app.use(
  "/sales",
  express.json(),
  express.urlencoded({ extended: true }),
  routersales
);
app.use(
  "/vehicles",
  express.json(),
  express.urlencoded({ extended: true }),
  routerVehicles
);
app.use(
  "/vehicle_services",
  express.json(),
  express.urlencoded({ extended: true }),
  routerVehicleservices
);

// A rota de imagens usa o middleware Multer, que será aplicado via routerImage.
// Não é necessário aplicar express.json() ou urlencoded() aqui.
app.use("/images", routerImage);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
