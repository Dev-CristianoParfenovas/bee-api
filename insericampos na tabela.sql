ALTER TABLE products
ADD COLUMN barcode VARCHAR(255),        -- Código de barras
ADD COLUMN aliquot DECIMAL(5, 2),      -- Alíquota com até 2 casas decimais
ADD COLUMN ncm VARCHAR(10),            -- Código NCM
ADD COLUMN cfop VARCHAR(10);           -- Código CFOP
