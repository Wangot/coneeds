ALTER TABLE  `user` ADD  `short_desc` VARCHAR( 255 ) NULL AFTER  `id` ,
ADD  `keywords` VARCHAR( 255 ) NULL AFTER  `short_desc` ,
ADD  `screen_name` VARCHAR( 40 ) NULL AFTER  `keywords` ,
ADD  `lat` DECIMAL( 10, 8 ) NULL AFTER  `screen_name` ,
ADD  `long` DECIMAL( 10, 8 ) NULL AFTER  `lat` ,
ADD  `is_professional` TINYINT( 1 ) NULL AFTER  `long`