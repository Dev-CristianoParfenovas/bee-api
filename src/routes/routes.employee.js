import { Router } from "express";
import employeeController from "../controllers/controller.employee.js";

const routeremployee = Router();

routeremployee.post("/", employeeController.createEmployee);

routeremployee.post("/login", employeeController.loginEmployeeController);

// Rota para buscar os funcionários
routeremployee.get("/:company_id", employeeController.getEmployees);

export default routeremployee;
