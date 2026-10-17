-- Add seller verified flags (collector, shop, official) to `sellers`
ALTER TABLE `sellers`
  ADD COLUMN `sel_is_verified_collector` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sel_type`,
  ADD COLUMN `sel_is_verified_shop` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sel_is_verified_collector`,
  ADD COLUMN `sel_is_verified_official` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sel_is_verified_shop`;
