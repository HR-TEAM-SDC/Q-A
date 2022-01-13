-- \c postgres;

-- DROP DATABASE IF EXISTS q_a;

-- CREATE DATABASE q_a

-- \c q_a;

DROP TABLE IF EXISTS answers;

CREATE TABLE answers (
 id BIGSERIAL,
 id_questions INTEGER,
 body VARCHAR(250),
 date_written INTEGER,
 answerer_name VARCHAR(25),
 answerer_email VARCHAR(40),
 reported BYTEA,
 helpful INTEGER
);


ALTER TABLE answers ADD CONSTRAINT answers_pkey PRIMARY KEY (id);

DROP TABLE IF EXISTS questions;

CREATE TABLE questions (
 id BIGSERIAL,
 product_id INTEGER,
 body VARCHAR(250),
 date_written INTEGER,
 asker_name VARCHAR(25),
 asker_email VARCHAR(40),
 reported BYTEA,
 helpful INTEGER
);


ALTER TABLE questions ADD CONSTRAINT questions_pkey PRIMARY KEY (id);

DROP TABLE IF EXISTS answer_photos;

CREATE TABLE answer_photos (
 id BIGSERIAL,
 id_answers INTEGER,
 url VARCHAR(150)
);


ALTER TABLE answer_photos ADD CONSTRAINT answer_photos_pkey PRIMARY KEY (id);

ALTER TABLE answers ADD CONSTRAINT answers_id_questions_fkey FOREIGN KEY (id_questions) REFERENCES questions(id);
ALTER TABLE answer_photos ADD CONSTRAINT answer_photos_id_answers_fkey FOREIGN KEY (id_answers) REFERENCES answers(id);