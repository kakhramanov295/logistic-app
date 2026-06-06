-- 1. Create the declarations table
CREATE TABLE declarations (
  id TEXT PRIMARY KEY,
  shipper TEXT,
  consignee TEXT,
  origin TEXT,
  port TEXT,
  mode TEXT,
  value TEXT,
  hs TEXT,
  date TEXT,
  status TEXT,
  spendings TEXT,
  "spendingBreakdown" TEXT,
  "paymentStatus" TEXT,
  documents JSONB
);

-- 2. Insert dummy data to match the UI state
INSERT INTO declarations (id, shipper, consignee, origin, port, mode, value, hs, date, status, spendings, "spendingBreakdown", "paymentStatus", documents)
VALUES 
(
  'CD-2024-001', 'Acme Corp', 'Delta Imports', 'Shanghai, CN', 'LA Port', 'sea', '$48,200', '8471.30', 'May 14, 2024', 'received', '$2,410', 'Import Duty ($1,800) + Handling ($610)', 'paid', 
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Packing List", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Certificate of Origin", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Insurance Policy", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Customs Release Certificate", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
),
(
  'CD-2024-002', 'Euro Supplies', 'NexTrade Ltd', 'Hamburg, DE', 'JFK Airport', 'air', '$12,900', '6110.20', 'May 15, 2024', 'waiting', '$645', 'Import Duty ($450) + Air Handling ($195)', 'unpaid',
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Packing List", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Airway Bill", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
),
(
  'CD-2024-003', 'Pacific Goods', 'Summit Inc', 'Tokyo, JP', 'Long Beach', 'sea', '$73,400', '9403.60', 'May 16, 2024', 'waiting', '$4,170', 'Import Duty ($3,670) + Storage Fee ($500)', 'unpaid',
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Packing List", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Certificate of Origin", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Cargo Manifest", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
),
(
  'CD-2024-004', 'Mex Exports', 'BorderLine Co', 'Mexico City', 'Laredo TX', 'road', '$9,600', '0702.00', 'May 17, 2024', 'going', '$780', 'Import Duty ($480) + Inspection ($300)', 'unpaid',
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Road Consignment Note", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
),
(
  'CD-2024-005', 'UK Premium', 'Global Trade', 'London, UK', 'ORD Airport', 'air', '$31,750', '3004.90', 'May 18, 2024', 'received', '$1,580', 'Import Duty ($1,280) + Handling ($300)', 'paid',
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Packing List", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Certificate of Origin", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Insurance Certificate", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Airway Bill", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Customs Release Certificate", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
),
(
  'CD-2024-006', 'AsiaTech', 'TechImport USA', 'Seoul, KR', 'Newark Port', 'sea', '$95,000', '8542.31', 'May 19, 2024', 'rejected', '$4,750', 'Import Duty ($3,800) + Quarantine ($950)', 'unpaid',
  '[{"name": "Bill of Lading", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Commercial Invoice", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Packing List", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Certificate of Origin", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, {"name": "Insurance Policy", "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}]'::jsonb
);
