ALTER TABLE `user` ADD COLUMN `user_google_id` VARCHAR(255) NULL AFTER `user_facebook_id`;
ALTER TABLE `user` MODIFY COLUMN `user_password` VARCHAR(255) NULL;
ALTER TABLE `sellers` ADD COLUMN `sel_slug` VARCHAR(255) NULL AFTER `sel_name`;

