import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Carregar as variáveis de ambiente
dotenv.config();

// Obtenha o segredo do JWT a partir da variável de ambiente
const secretToken = process.env.SECRET_TOKEN;

function createJWT(id_user) {
  const token = jwt.sign({ id_user }, secretToken, {
    expiresIn: "7d", // Define a expiração do token para 7 dias
  });
  return token;
}

function createJWTEmployee(id_employee) {
  const token = jwt.sign({ id_employee }, secretToken, {
    expiresIn: "7d", // Define a expiração do token para 7 dias
  });
  return token;
}

function validateJWT(req, res, next) {
  const authToken = req.headers.authorization;

  console.log("Cabeçalho Authorization:", authToken);

  if (!authToken) {
    return res.status(401).send({ error: "Token não informado" });
  }

  const [aux, token] = authToken.split(" ");

  jwt.verify(token, secretToken, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token inválido" });

    // Verifica se é cliente ou funcionário e adiciona ao request
    if (decoded.id_user) req.id_user = decoded.id_user;
    if (decoded.id_employee) req.id_employee = decoded.id_employee;

    next();
  });
}
// ----->> routes ----->> Validar token ----->> Controller

export default { createJWT, createJWTEmployee, validateJWT };
