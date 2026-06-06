-- 1. Create the cargos table
CREATE TABLE cargos (
  id TEXT PRIMARY KEY,
  ref TEXT,
  carrier TEXT,
  sender TEXT,
  origin TEXT,
  weight TEXT,
  dims TEXT,
  pieces INTEGER,
  temp TEXT,
  arrival TEXT,
  mode TEXT,
  status TEXT,
  condition TEXT,
  inspector TEXT,
  notes TEXT,
  "orderValue" NUMERIC,
  spendings JSONB
);

-- 2. Insert dummy data to match the UI state
INSERT INTO cargos (id, ref, carrier, sender, origin, weight, dims, pieces, temp, arrival, mode, status, condition, inspector, notes, "orderValue", spendings)
VALUES
('AC-2024-001', 'SH-2024-001', 'FastFreight LLC', 'Acme Corp', 'New York, NY', '2,400 kg', '120×80×90 cm', 12, 'Ambient', 'May 14, 09:00', 'road', 'accepted', 'good', 'J. Williams', '', 600000, '[{"label": "Customs Duty", "amount": 120000}, {"label": "Transport Fee", "amount": 50000}, {"label": "Handling", "amount": 30000}]'::jsonb),
('AC-2024-002', 'SH-2024-002', 'SkyMove Air', 'Euro Supplies', 'Hamburg, DE', '380 kg', '60×40×50 cm', 4, 'Chilled', 'May 15, 14:30', 'air', 'pending', 'good', 'Unassigned', '', 120000, '[{"label": "Air Freight", "amount": 18000}, {"label": "Import Duty", "amount": 9000}]'::jsonb),
('AC-2024-003', 'SH-2024-003', 'OceanPrime', 'Pacific Goods', 'Tokyo, JP', '8,700 kg', '240×120×200', 34, 'Ambient', 'May 16, 08:15', 'sea', 'inspection', 'partial', 'M. Torres', '3 pallets show moisture damage', 850000, '[{"label": "Sea Freight", "amount": 60000}, {"label": "Customs", "amount": 42000}, {"label": "Damage Inspection", "amount": 15000}]'::jsonb),
('AC-2024-004', 'SH-2024-004', 'BorderXpress', 'Mex Exports', 'Mexico City', '1,100 kg', '100×60×80 cm', 8, 'Frozen', 'May 17, 11:00', 'road', 'rejected', 'damaged', 'S. Patel', 'Packaging integrity compromised, temperature breach', 95000, '[{"label": "Import Duty", "amount": 7800}, {"label": "Cold Chain Fee", "amount": 12000}]'::jsonb),
('AC-2024-005', 'SH-2024-005', 'QuickCourier', 'UK Premium', 'London, UK', '95 kg', '45×30×30 cm', 3, 'Ambient', 'May 18, 16:45', 'courier', 'accepted', 'good', 'J. Williams', '', 31500, '[{"label": "Courier Fee", "amount": 2800}, {"label": "VAT", "amount": 1900}]'::jsonb),
('AC-2024-006', 'SH-2024-006', 'MarineRoute', 'AsiaTech', 'Seoul, KR', '5,200 kg', '200×100×150', 22, 'Ambient', 'May 19, 07:30', 'sea', 'pending', 'good', 'Unassigned', '', 320000, '[{"label": "Sea Freight", "amount": 28000}, {"label": "Port Handling", "amount": 14000}, {"label": "Customs", "amount": 19000}]'::jsonb);
