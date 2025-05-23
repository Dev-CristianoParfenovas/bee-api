import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Testa a conexão (idealmente, isso deve ser feito de forma assíncrona em vez de callback)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Conexão com o banco de dados bem-sucedida!");
    client.release(); // Libera o cliente após o teste
  } catch (err) {
    console.error("Erro ao conectar no banco de dados:", err.stack);
  }
};

// Chama a função de teste de conexão
testConnection();

// Testa a conexão
/*pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro ao conectar no banco de dados:", err.stack);
  } else {
    console.log("Conexão com o banco de dados bem-sucedida!");
  }
  release(); // Libera o cliente
});*/

export default pool; // Exporta a conexão com ES Modules
