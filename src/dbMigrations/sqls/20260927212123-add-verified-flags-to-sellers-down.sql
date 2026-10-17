-- Revert `sel_is_verified_collector`, `sel_is_verified_shop`, `sel_is_verified_official` columns from `sellers`
ALTER TABLE `sellers`
  DROP COLUMN `sel_is_verified_collector`,
  DROP COLUMN `sel_is_verified_shop`,
  DROP COLUMN `sel_is_verified_official`;
