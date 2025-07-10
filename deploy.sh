KEY_PATH="/c/Bee Aplicativos/aws/bee-api-key.pem"
REMOTE_USER="ubuntu"
REMOTE_HOST="3.84.211.229"
REMOTE_DIR="/home/ubuntu/bee-api"

echo "🔐 Enviando .env para o EC2..."
scp -i "$KEY_PATH" .env $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/.env

echo "📦 Enviando código-fonte atualizado da pasta src..."
scp -i "$KEY_PATH" -r src/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/src/

echo "📦 Enviando package.json e package-lock.json..."
scp -i "$KEY_PATH" package*.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

echo "🚀 Instalando dependências e reiniciando aplicação com PM2..."
ssh -i "$KEY_PATH" $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_DIR
  npm install --omit=dev
  pm2 restart bee-api || pm2 start src/index.js --name bee-api
EOF

echo "✅ Deploy concluído com sucesso!"
