-- Revert `sel_bank_code` back to `sel_bank_name` on `sellers`
ALTER TABLE `sellers`
  DROP COLUMN `sel_bank_code`,
  ADD COLUMN `sel_bank_name` VARCHAR(60) NULL AFTER `sel_address_lng`;
