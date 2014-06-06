CREATE DATABASE coneeds;

CREATE USER coneeds@localhost IDENTIFIED BY 'coneeds';

grant CREATE,INSERT,DELETE,UPDATE,SELECT,DROP,ALTER on coneeds.* to coneeds@localhost;

CREATE DATABASE coneeds_dev;

CREATE USER coneeds_dev@localhost IDENTIFIED BY 'coneeds_dev';

grant CREATE,INSERT,DELETE,UPDATE,SELECT,DROP,ALTER on coneeds_dev.* to coneeds_dev@localhost;