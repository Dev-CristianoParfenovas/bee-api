ALTER TABLE products
ADD CONSTRAINT unique_product_name_company_id UNIQUE (name, company_id);

SELECT name, company_id, COUNT(*)
FROM products
GROUP BY name, company_id
HAVING COUNT(*) > 1;

DELETE FROM products
WHERE ctid NOT IN (
    SELECT min(ctid)
    FROM products
    GROUP BY name, company_id
)
AND name = 'Heineken Lata 350ml' AND company_id = 1;

