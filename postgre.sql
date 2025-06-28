DROP TYPE IF EXISTS categ_masina;
DROP TYPE IF EXISTS tipuri_masina;
drop type if exists seturi;
drop type if exists asociere_set;

CREATE TYPE categ_masina AS ENUM('sport', 'familiala', 'SUV', 'utilitara', 'electrica', 'clasica');
CREATE TYPE tipuri_masina AS ENUM('sedan', 'hatchback', 'coupe', 'suv', 'pickup', 'convertibil');

CREATE TABLE IF NOT EXISTS masini (
    id serial PRIMARY KEY,
    nume VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8, 2) NOT NULL,
    putere INT NOT NULL CHECK (putere > 0),
    tip_masina tipuri_masina DEFAULT 'sedan',
    categorie categ_masina DEFAULT 'familiala',
    dotari VARCHAR [],
    automata BOOLEAN NOT NULL DEFAULT FALSE,
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT INTO masini (nume, descriere, pret, putere, tip_masina, categorie, dotari, automata, imagine) VALUES
('Lamborghini Aventador', 'Supercar cu design agresiv si performante ridicate.', 350000, 740, 'coupe', 'sport', '{"navigatie", "climatizare", "trapa"}', TRUE, 'aventador.jpg'),

('Dacia Logan', 'Masina accesibila, fiabila, potrivita pentru oras.', 12000, 90, 'sedan', 'familiala', '{"aer conditionat", "geamuri electrice"}', FALSE, 'logan.jpg'),

('Tesla Model S', 'Masina electrica performanta cu autonomie ridicata.', 85000, 670, 'sedan', 'electrica', '{"pilot automat", "incalzire scaune", "ecran tactil"}', TRUE, 'model-s.jpg'),

('Ford Ranger', 'Pickup robust pentru teren accidentat.', 35000, 200, 'pickup', 'utilitara', '{"tractiune 4x4", "bara protectie", "suspensie off-road"}', FALSE, 'ranger.jpg'),

('BMW X5', 'SUV premium cu dotari avansate si design sportiv.', 65000, 400, 'suv', 'SUV', '{"climatizare", "trapa", "navigatie", "piele"}', TRUE, 'x5.jpg'),

('Mazda MX-5', 'Masina sport mica, ideala pentru plimbari de vara.', 30000, 181, 'convertibil', 'sport', '{"soft top", "navigatie"}', TRUE, 'mx5.jpg'),

('Volkswagen Golf', 'Model hatchback popular si versatil.', 20000, 150, 'hatchback', 'familiala', '{"geamuri electrice", "aer conditionat"}', FALSE, 'golf.jpg'),

('Mercedes G-Class', 'SUV de lux cu capabilitati off-road remarcabile.', 120000, 420, 'suv', 'SUV', '{"piele", "navigatie", "tractiune 4x4"}', TRUE, 'gclass.jpg'),

('Porsche 911', 'Simbol al performantei si rafinamentului.', 110000, 450, 'coupe', 'sport', '{"navigatie", "trapa", "piele"}', TRUE, '911.jpg'),

('Fiat 500', 'Masina compacta ideala pentru oras.', 15000, 70, 'hatchback', 'familiala', '{"aer conditionat", "geamuri electrice"}', FALSE, 'fiat500.jpg'),

('Audi Q7', 'SUV spatios cu tehnologii avansate.', 80000, 340, 'suv', 'SUV', '{"navigatie", "climatizare", "piele", "trapa"}', TRUE, 'q7.jpg'),

('Toyota Hilux', 'Pickup cunoscut pentru fiabilitatea sa extrema.', 40000, 204, 'pickup', 'utilitara', '{"tractiune 4x4", "bara protectie"}', FALSE, 'hilux.jpg'),

('Mustang GT', 'Muscle car american iconic.', 45000, 450, 'coupe', 'sport', '{"trapa", "piele"}', TRUE, 'mustang.jpg'),

('Nissan Leaf', 'Masina electrica accesibila pentru oras.', 30000, 150, 'hatchback', 'electrica', '{"aer conditionat", "incalzire scaune"}', TRUE, 'leaf.jpg'),

('Chevrolet Camaro', 'Masina sport cu un design agresiv.', 50000, 455, 'coupe', 'sport', '{"piele", "navigatie", "trapa"}', TRUE, 'camaro.jpg'),

('Volkswagen Transporter', 'Utilitar perfect pentru transportul de marfa.', 35000, 150, 'pickup', 'utilitara', '{"geamuri electrice", "climatizare"}', FALSE, 'transporter.jpg'),

('Ferrari F8', 'Supercar cu design italian si performanta de top.', 250000, 710, 'coupe', 'sport', '{"trapa", "navigatie", "piele"}', TRUE, 'f8.jpg'),

('Honda Civic', 'Hatchback economic si fiabil.', 22000, 160, 'hatchback', 'familiala', '{"aer conditionat", "geamuri electrice"}', FALSE, 'civic.jpg'),

('Land Rover Defender', 'SUV rezistent pentru aventuri off-road.', 75000, 300, 'suv', 'SUV', '{"tractiune 4x4", "bara protectie", "climatizare"}', TRUE, 'defender.jpg'),

('Volkswagen Beetle Clasic', 'Masina clasica cu design iconic.', 25000, 100, 'hatchback', 'clasica', '{"radio", "geamuri manuale"}', FALSE, 'beetle.jpg');


select * from masini



CREATE USER vlad WITH ENCRYPTED PASSWORD 'vlad';
GRANT ALL PRIVILEGPuES ON DATABASE masini TO vlad ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vlad;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vlad;

CREATE TABLE seturi (
    id SERIAL PRIMARY KEY,
    nume_set VARCHAR(100) NOT NULL,
    descriere_set TEXT
);

CREATE TABLE asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INTEGER REFERENCES seturi(id),
    id_produs INTEGER REFERENCES masini(id)
);



-- Inserare in tabela seturi (deja făcută corect de tine)
INSERT INTO seturi (nume_set, descriere_set) VALUES
('Set Sport', 'Set de masini sport rapide.'),
('Set Electric', 'Set de masini electrice prietenoase cu mediul.'),
('Set Familie', 'Set de masini spatioase pentru familie.'),
('Set Lux', 'Set de masini de lux premium.'),
('Set Compact', 'Set de masini compacte pentru oras.');

-- Asociere produse la seturi
-- Set 1: Set Sport
INSERT INTO asociere_set (id_set, id_produs) VALUES 
(1, 1),
(1, 6),
(1, 9),
(1, 13),
(1, 15),
(1, 17),
(2, 3),
(2, 14),
(3, 2),
(3, 7),
(3, 10),
(3, 18),
(4, 5),
(4, 8),
(4, 11),
(5, 4),
(5, 12),
(5, 16),
(5, 20);


SELECT * FROM seturi;

SELECT * FROM asociere_set;

SELECT * FROM masini;

DELETE FROM asociere_set;

DELETE FROM seturi;

ALTER SEQUENCE asociere_set_id_seq RESTART WITH 1;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vlad;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vlad;

