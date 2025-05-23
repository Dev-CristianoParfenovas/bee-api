SELECT id, sale_date, employee_id, total_price
FROM sales
WHERE company_id = 1
AND sale_date >= '2025-01-01T00:00:00Z'::timestamptz
AND sale_date <= '2025-01-07T23:59:59Z'::timestamptz
AND employee_id = 19;

ALTER TABLE sales ALTER COLUMN sale_date TYPE DATE USING sale_date::date;
