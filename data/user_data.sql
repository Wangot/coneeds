-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 07, 2014 at 05:51 AM
-- Server version: 5.5.24
-- PHP Version: 5.3.10-1ubuntu3.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `coneeds_dev`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `number` varchar(100) NOT NULL,
  `status` varchar(40) DEFAULT 'INACTIVE',
  `rtc_id` varchar(100) DEFAULT NULL,
  `otp_code` varchar(100) DEFAULT NULL,
  `expired` datetime DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(500) DEFAULT NULL,
  `short_desc` varchar(255) DEFAULT NULL,
  `keywords` varchar(255) DEFAULT NULL,
  `screen_name` varchar(40) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(10,8) DEFAULT NULL,
  `is_professional` tinyint(1) DEFAULT NULL,
  `credits` int(11) DEFAULT NULL,
  `avatar` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`number`, `status`, `rtc_id`, `otp_code`, `expired`, `id`, `code`, `short_desc`, `keywords`, `screen_name`, `lat`, `lng`, `is_professional`, `credits`, `avatar`) VALUES
('9154980404', 'ACTIVE', NULL, NULL, NULL, 1, NULL, 'Hi I''m Evan, I teach foreign languages', 'tutor', NULL, NULL, NULL, 1, NULL, ''),
('9154980404', 'ACTIVE', NULL, NULL, NULL, 2, NULL, 'Hi I''m Lester, I teach basic education', 'tutor', NULL, NULL, NULL, 1, NULL, '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
