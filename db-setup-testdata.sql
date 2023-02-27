INSERT INTO scripts VALUES (1, 'test');
INSERT INTO scripts VALUES (2, 'twelfthNight');
SELECT pg_catalog.setval('scripts_id_seq', 2, true);

INSERT INTO actors VALUES (1, 'rachel cheman');
INSERT INTO actors VALUES (2, 'matthew cheman');
INSERT INTO actors VALUES (3, 'allison blumenthal');
INSERT INTO actors VALUES (4, 'richard blumenthal');
INSERT INTO actors VALUES (5, 'jeff  peden');
INSERT INTO actors VALUES (6, 'someone else');
INSERT INTO actors VALUES (7, 'Test Actor');
INSERT INTO actors VALUES (8, 'Test Actor2');
INSERT INTO actors VALUES (9, 'test actor 3');
INSERT INTO actors VALUES (10, 'TEST ACTOR 4');
INSERT INTO actors VALUES (11, 'Molly Matz');
INSERT INTO actors VALUES (12, 'Mark Matz');
SELECT pg_catalog.setval('actors_id_seq', 12, true);

-- for "twelfth night"
INSERT INTO characters VALUES (1, 2, 1, 'DUKE', 203, 59);
INSERT INTO characters VALUES (2, 2, 2, 'CURIO', 5, 4);
INSERT INTO characters VALUES (3, 2, 1, 'VALENTINE', 13, 3);
INSERT INTO characters VALUES (4, 2, null, 'VIOLA', 317, 121);
INSERT INTO characters VALUES (5, 2, null, 'CAPTAIN', 32, 10);
INSERT INTO characters VALUES (6, 2, null, 'SIR TOBY', 278, 152);
INSERT INTO characters VALUES (7, 2, null, 'MARIA', 121, 59);
INSERT INTO characters VALUES (8, 2, null, 'SIR ANDREW', 129, 88);
INSERT INTO characters VALUES (9, 2, null, 'CLOWN', 219, 101);
INSERT INTO characters VALUES (10, 2, null, 'OLIVIA', 261, 118);
INSERT INTO characters VALUES (11, 2, null, 'MALVOLIO', 208, 87);
INSERT INTO characters VALUES (12, 2, null, 'ANTONIO', 104, 27);
INSERT INTO characters VALUES (13, 2, null, 'SEBASTIAN', 117, 31);
INSERT INTO characters VALUES (14, 2, null, 'FABIAN', 94, 51);
INSERT INTO characters VALUES (15, 2, null, 'SERVANT', 2, 1);
INSERT INTO characters VALUES (16, 2, null, 'FIRST OFFICER', 12, 5);
INSERT INTO characters VALUES (17, 2, null, 'SECOND OFFICER', 4, 3);
INSERT INTO characters VALUES (18, 2, null, 'PRIEST', 8, 1);

-- for "test"
INSERT INTO characters VALUES (19, 1, 1, 'MATT', 2, 1);
INSERT INTO characters VALUES (20, 1, 2, 'RACHEL', 2, 2);
INSERT INTO characters VALUES (21, 1, 2, 'BOB', 2, 1);

SELECT pg_catalog.setval('characters_id_seq', 21, true);
