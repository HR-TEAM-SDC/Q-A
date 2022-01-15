Once I had the DB setup, I had downloaded the raw CSV files and loaded them in their entirety with the following commands:

COPY questions
FROM '/home/jacobhawkins/Documents/SDC/test questions.csv'
DELIMITER ','
CSV HEADER;

COPY answers
FROM '/home/jacobhawkins/Documents/SDC/answers.csv'
DELIMITER ','
CSV HEADER;

COPY answer_photos
FROM '/home/jacobhawkins/Documents/SDC/answers_photos.csv'
DELIMITER ','
CSV HEADER;

Should be done in this order as the tables have some foreign keys setup.

All db setup and dataloading has been done in the terminal thus far. Nothing is being run command wise on the file.

## sql commands below

-- answers insert ex: INSERT INTO answers (id_questions, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ('1', 'nonsense', '2020-07-27 14:18:34', 'jake', 'jake@fake.com', '0', '0');
-- questions insert ex: INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ('1', 'nonsense', '2020-07-27 14:18:34', 'jake', 'jake@fake.com', '0', '0');
-- photos insert ex: INSERT INTO answer_photos (id_answers, url) VALUES ('1', 'fakeurl');

-- example put request for questions: UPDATE questions SET helpful = helpful + 1 WHERE id = 1;
