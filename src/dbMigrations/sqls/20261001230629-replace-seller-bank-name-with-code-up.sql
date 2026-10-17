-- Replace `sel_bank_name` (string) with `sel_bank_code` (SMALLINT, Kode Bank Indonesia) on `sellers`
ALTER TABLE `sellers`
  DROP COLUMN `sel_bank_name`,
  ADD COLUMN `sel_bank_code` SMALLINT NULL AFTER `sel_address_lng`;
