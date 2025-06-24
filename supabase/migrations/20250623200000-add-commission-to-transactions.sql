-- Add commission field to transacoes_financeiras table
ALTER TABLE transacoes_financeiras 
ADD COLUMN commission DECIMAL(10,2) DEFAULT NULL;

-- Add comment to explain the new field
COMMENT ON COLUMN transacoes_financeiras.commission IS 'Comissão específica da entrada (opcional)';
