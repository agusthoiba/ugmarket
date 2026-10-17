ALTER TABLE `user` ADD COLUMN `user_google_id` VARCHAR(255) NULL AFTER `user_facebook_id`;
ALTER TABLE `user` MODIFY COLUMN `user_password` VARCHAR(255) NULL;
ALTER TABLE `sellers` ADD COLUMN `sel_slug` VARCHAR(255) NULL AFTER `sel_name`;
ALTER TABLE `sellers` ADD COLUMN `sel_total_product` INT(11) UNSIGNED NULL DEFAULT 0 AFTER `sel_is_active`;
ALTER TABLE `cart` ADD COLUMN `cart_guest_token` VARCHAR(36) NULL AFTER `cart_user_id`, MODIFY COLUMN `cart_user_id` INT(11) UNSIGNED NULL;
