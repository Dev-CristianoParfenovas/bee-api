import { Router } from "express";
import employeeController from "../controllers/controller.employee.js";
import jwt from "../jwt/token.js";

const routeremployee = Router();

routeremployee.post("/", employeeController.createEmployee);

routeremployee.post("/login", employeeController.loginEmployeeController);

// Rota para buscar os funcionários da empresa do usuário logado (SEGURA)
routeremployee.get("/", jwt.validateJWT, employeeController.getEmployees);

routeremployee.delete(
  "/:employeeId",
  jwt.validateJWT,
  employeeController.deleteEmployeeController
);

export default routeremployee;
