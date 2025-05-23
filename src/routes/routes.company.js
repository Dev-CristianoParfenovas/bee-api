import { Router } from "express";
import companyController from "../controllers/controller.company.js";

const routercompany = Router();

/*routercompany.post(
  "/companyemployee",
  companyController.createCompanyAndEmployee
);*/

routercompany.post(
  "/companyemployee",
  (req, res, next) => {
    console.log("Corpo recebido na rota:", req.body); // Log para verificar o req.body
    next();
  },
  companyController.createCompanyAndEmployee
);

export default routercompany;
