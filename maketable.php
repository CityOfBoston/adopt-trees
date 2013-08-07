CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL,
  subname varchar(100) NOT NULL,
  signname varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  address varchar(100) NOT NULL,
  treeaddress varchar(100) NOT NULL,
  treetype varchar(100) NOT NULL,  
  bday varchar(15) NOT NULL,  
  PRIMARY KEY (id),
  UNIQUE (id)
);