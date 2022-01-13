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
