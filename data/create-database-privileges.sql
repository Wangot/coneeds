CREATE DATABASE coneeds;

CREATE USER coneeds@localhost IDENTIFIED BY 'coneeds';

grant CREATE,INSERT,DELETE,UPDATE,SELECT,DROP,ALTER on coneeds.* to coneeds@localhost;