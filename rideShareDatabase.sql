CREATE DATABASE  IF NOT EXISTS `rideshare` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `rideshare`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: rideshare.c1sopuas5n0h.us-east-1.rds.amazonaws.com    Database: rideshare
-- ------------------------------------------------------
-- Server version	5.6.40-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Driver`
--

DROP TABLE IF EXISTS `Driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Driver` (
  `user_id` varchar(255) NOT NULL,
  `source_lat` decimal(16,14) DEFAULT NULL,
  `source_long` decimal(16,14) DEFAULT NULL,
  `destination_lat` decimal(16,14) DEFAULT NULL,
  `destination_long` decimal(16,14) DEFAULT NULL,
  `current_lat` decimal(16,14) DEFAULT NULL,
  `current_long` decimal(16,14) DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  `timestamp` timestamp NOT NULL,
  PRIMARY KEY (`user_id`,`status`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver`
--

LOCK TABLES `Driver` WRITE;
/*!40000 ALTER TABLE `Driver` DISABLE KEYS */;
/*!40000 ALTER TABLE `Driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ride_Request`
--

DROP TABLE IF EXISTS `Ride_Request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Ride_Request` (
  `driver_id` varchar(255) NOT NULL,
  `rider_id` varchar(255) NOT NULL,
  `ride_status` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL,
  PRIMARY KEY (`driver_id`,`rider_id`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ride_Request`
--

LOCK TABLES `Ride_Request` WRITE;
/*!40000 ALTER TABLE `Ride_Request` DISABLE KEYS */;
/*!40000 ALTER TABLE `Ride_Request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rider`
--

DROP TABLE IF EXISTS `Rider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Rider` (
  `user_id` varchar(255) NOT NULL,
  `source_lat` decimal(16,14) DEFAULT NULL,
  `source_long` decimal(16,14) DEFAULT NULL,
  `destination_lat` decimal(16,14) DEFAULT NULL,
  `destination_long` decimal(16,14) DEFAULT NULL,
  `current_lat` decimal(16,14) DEFAULT NULL,
  `current_long` decimal(16,14) DEFAULT NULL,
  `status` varchar(45) NOT NULL,
  `timestamp` timestamp NOT NULL,
  PRIMARY KEY (`user_id`,`status`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rider`
--

LOCK TABLES `Rider` WRITE;
/*!40000 ALTER TABLE `Rider` DISABLE KEYS */;
/*!40000 ALTER TABLE `Rider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rating` (
  `user_id` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `avg_rating` decimal(16,14) DEFAULT NULL,
  `no_of_raters` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'rideshare'
--

--
-- Dumping routines for database 'rideshare'
--
/*!50003 DROP PROCEDURE IF EXISTS `nearest_cordinates` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`rideShare007`@`%` PROCEDURE `nearest_cordinates`(IN lat DECIMAL(16,14) , IN lng DECIMAL(16,14), In tableName varchar(45) )
BEGIN
	IF (tableName = 'Rider') THEN
		SET @joinColumn = 'Ride_Request.rider_id';
        SET @joinColumn2 = 'complete.rider_id';
	END IF;
    IF (tableName = 'Driver') THEN
		SET @joinColumn = 'Ride_Request.driver_id';
        SET @joinColumn2 = 'complete.driver_id';
	END IF;
	SET @sql_text = concat('
    SELECT  *, complete.user_id
	FROM   
		(
		Select * from
			(SELECT
			source_lat, source_long, current_lat, current_long, user_id, destination_lat, destination_long, status, (
			3959 * acos (
			  cos ( radians(',lat,') )
			  * cos( radians( current_lat ) )
			  * cos( radians( current_long ) - radians(',lng,') )
			  + sin ( radians(',lat,') )
			  * sin( radians( current_lat ) )
			)
		  ) AS distance
			FROM ',tableName,'
			where status = "searching"
            HAVING distance < 1.5
			ORDER BY distance
			LIMIT 0 , 10
			) as nearestTable
		Left outer Join Ride_Request 
		ON nearestTable.user_id = ',@joinColumn,') as complete
        
	Left outer JOIN 
	(select * from rating where rating.type = "',tableName,'") as rate
	ON ',@joinColumn2,' = rate.user_id');
    PREPARE stmt FROM @sql_text;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-12-22 22:15:16
