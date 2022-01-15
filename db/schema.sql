-- \c postgres;

-- DROP DATABASE IF EXISTS q_a;

-- CREATE DATABASE q_a

-- \c q_a;

DROP TABLE IF EXISTS answers;

CREATE TABLE answers (
 id BIGSERIAL,
 id_questions INTEGER,
 body VARCHAR(250),
 date_written BIGINT,
 answerer_name VARCHAR(40),
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
 date_written BIGINT,
 asker_name VARCHAR(40),
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

UPDATE questions SET date_written = date_written/1000;
ALTER TABLE questions ALTER COLUMN date_written TYPE TIMESTAMP USING to_timestamp(date_written);

UPDATE answers SET date_written = date_written/1000;
ALTER TABLE answers ALTER COLUMN date_written TYPE TIMESTAMP USING to_timestamp(date_written);

-- still need to update the sequence on all tables so you can begin inserting in the correct spot.
-- to find the final id number where you begin to add stuff:  select id from <tablename> order by id desc limit 1; add one to this. replace id with * to grab last row.

--ALTER SEQUENCE answers_id_seq RESTART WITH <number from from above> ;
--ALTER SEQUENCE questions_id_seq RESTART WITH <number from from above>;
--ALTER SEQUENCE answer_photos_id_seq RESTART WITH <number from from above>;

-- answers insert ex: INSERT INTO answers (id_questions, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ('1', 'nonsense', '2020-07-27 14:18:34', 'jake', 'jake@fake.com', '0', '0');
-- questions insert ex: INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ('1', 'nonsense', '2020-07-27 14:18:34', 'jake', 'jake@fake.com', '0', '0');
-- photos insert ex: INSERT INTO answer_photos (id_answers, url) VALUES ('1', 'fakeurl');