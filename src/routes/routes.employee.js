import { Router } from "express";
import employeeController from "../controllers/controller.employee.js";

const routeremployee = Router();

routeremployee.post("/employee", employeeController.createEmployee);

routeremployee.post(
  "/employee/login",
  employeeController.loginEmployeeController
);

// Rota para buscar os funcionários
routeremployee.get("/employees/:company_id", employeeController.getEmployees);

export default routeremployee;
