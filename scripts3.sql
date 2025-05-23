DROP TABLE IF EXISTS images;

CREATE TABLE images (
    id SERIAL PRIMARY KEY,               -- Identificador único da imagem
    product_id INTEGER NOT NULL,         -- Identificador do produto
    file_path VARCHAR(255) NOT NULL,     -- Caminho ou URL da imagem
    description TEXT,                    -- (Opcional) Descrição da imagem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data de criação
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_product_id ON images(product_id);

