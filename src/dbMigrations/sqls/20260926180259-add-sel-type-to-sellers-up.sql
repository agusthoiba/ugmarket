-- Add seller type enum column (COLLECTOR, SHOP, OFFICIAL) to `sellers`
ALTER TABLE `sellers`
  ADD COLUMN `sel_type` ENUM('COLLECTOR', 'SHOP', 'OFFICIAL') NOT NULL DEFAULT 'COLLECTOR' AFTER `sel_slug`;
