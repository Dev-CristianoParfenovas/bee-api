# --- Configuração ---
# O caminho para a chave SSH privada
KEY_PATH="/c/Bee Aplicativos/aws/bee-api-key.pem"
# O usuário da instância EC2
REMOTE_USER="ubuntu"
# O IP público da sua instância EC2
REMOTE_HOST="44.216.228.58"
# O diretório onde a aplicação está no servidor remoto
REMOTE_DIR="/home/ubuntu/bee-api"

# --- Limpeza e Envio de Arquivos ---
echo "🧹 Removendo a pasta 'src' antiga no servidor..."
# Remove a pasta src inteira, garantindo uma cópia limpa.
ssh -i "$KEY_PATH" $REMOTE_USER@$REMOTE_HOST "rm -rf $REMOTE_DIR/src"

echo "📦 Enviando o código-fonte, .env e package.json..."
# O comando scp agora tem a opção -r no início, como deveria ser.
# Ele irá copiar o arquivo .env, os arquivos package.json e a pasta src inteira.
scp -i "$KEY_PATH" -r .env package*.json src $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# --- Instalação de Dependências e Reinício da Aplicação ---
echo "🚀 Instalando dependências e reiniciando a aplicação com PM2..."
ssh -i "$KEY_PATH" $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_DIR
  # Instala as dependências, ignorando as de desenvolvimento.
  npm install --omit=dev
  # Tenta parar a aplicação primeiro, ignorando erros se ela não estiver rodando.
  pm2 stop bee-api || true
  # Deleta o processo antigo.
  pm2 delete bee-api || true
  # Inicia a nova versão da aplicação.
  pm2 start src/index.js --name bee-api
EOF

echo "✅ Deploy concluído com sucesso!"