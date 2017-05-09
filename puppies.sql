DROP DATABASE IF EXISTS puppies;
CREATE DATABASE puppies;

\c puppies;

CREATE TABLE pups (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  breed VARCHAR,
  age INTEGER,
  sex VARCHAR
);

CREATE TABLE users (
	ID SERIAL PRIMARY KEY,
	username VARCHAR NOT NULL UNIQUE,
	password VARCHAR,
	phone VARCHAR,
  notifications_email BOOLEAN,
  notifications_sms BOOlEAN,
  next_survey_date DATE,
  next_survey_ID VARCHAR,
  invite_token VARCHAR,
  forgotPass_token VARCHAR,
  permission_level INTEGER
);

CREATE TABLE surveys (
  ID SERIAL PRIMARY KEY,
  qualtrics_id VARCHAR,
  days_till_next INTEGER,
  next_id INTEGER
);

INSERT INTO pups (name, breed, age, sex)
  VALUES ('Tyler', 'Retrieved', 3, 'M');
