CREATE TABLE IF NOT EXISTS `credits_history` (
  `reference_code` bigint(20) DEFAULT NULL,
  `action` varchar(40) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;