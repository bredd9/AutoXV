// importam modulele necesare
const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

const Client = pg.Client;

// conectare la baza de date
client = new Client({
    database: "masini",
    user: "vlad",
    password: "vlad",
    host: "localhost",
    port: 5432
});

client.connect();

// setam intervalele de timp pentru generarea si curatarea ofertelor
const intervalOferta = 60 * 1000; // 1 minut
const intervalCuratare = 5 * 60 * 1000; // 5 minute

// preluam categoriile disponibile din baza de date
let categoriiDisponibile = [];
client.query("SELECT unnest(enum_range(NULL::categ_masina)) AS categorie", function (err, rez) {
    if (!err) {
        categoriiDisponibile = rez.rows.map(row => row.categorie);
    }
});

// functie pentru generarea automata a ofertelor
function genereazaOferta() {
    let cale = path.join(__dirname, "resurse/json/oferte.json");
    let oferte = JSON.parse(fs.readFileSync(cale).toString());
    let ultimeleOferte = oferte.oferte;

    let categoriiValide = categoriiDisponibile.filter(cat => 
        ultimeleOferte.length == 0 || cat != ultimeleOferte[0].categorie
    );

    if (categoriiValide.length == 0) return;

    let categorieAleasa = categoriiValide[Math.floor(Math.random() * categoriiValide.length)];
    let reduceriPosibile = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    let reducereAleasa = reduceriPosibile[Math.floor(Math.random() * reduceriPosibile.length)];

    let dataStart = new Date();
    let dataSfarsit = new Date(dataStart.getTime() + intervalOferta);

    let ofertaNoua = {
        categorie: categorieAleasa,
        "data-incepere": dataStart,
        "data-finalizare": dataSfarsit,
        reducere: reducereAleasa
    };

    ultimeleOferte.unshift(ofertaNoua);
    oferte.oferte = ultimeleOferte;

    fs.writeFileSync(cale, JSON.stringify(oferte, null, 2));
    console.log("Oferta generata:", ofertaNoua);
}

// functie pentru stergerea ofertelor vechi
const T2 = 5 * 60 * 1000;

function curataOferte() {
    let cale = path.join(__dirname, "resurse/json/oferte.json");
    let oferte = JSON.parse(fs.readFileSync(cale).toString());
    let acum = new Date();

    let oferteActive = oferte.oferte.filter(of => {
        let dataFinal = new Date(of["data-finalizare"]);
        return (acum - dataFinal) < T2;
    });

    if (oferteActive.length != oferte.oferte.length) {
        oferte.oferte = oferteActive;
        fs.writeFileSync(cale, JSON.stringify(oferte, null, 2));
        console.log("Oferte vechi curatate");
    }
}

// pornim procesele automate
setInterval(genereazaOferta, intervalOferta);
setInterval(curataOferte, 60 * 1000);

app = express();

// setam motorul de template
app.set('view engine', 'ejs');

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, 'resurse/scss'),
    folderCss: path.join(__dirname, 'resurse/css'),
    folderBackup: path.join(__dirname, 'backup')
};

// cream folderele daca nu exista
vect_foldere = ['temp', 'backup', 'temp1'];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

// functie pentru compilarea fisierelor scss
function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split('.')[0];
        caleCss = numeFis + '.css';
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, 'resurse/css');
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(
            caleCss,
            path.join(obGlobal.folderBackup, 'resurse/css', path.basename(caleCss))
        );
    }

    rez = sass.compile(caleScss, { sourceMap: true, loadPaths: ["./node_modules"] });
    fs.writeFileSync(caleCss, rez.css);
}

// compilam toate fisierele scss la pornire
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == '.scss') {
        compileazaScss(numeFis);
    }
}

// monitorizam modificarile scss
fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (eveniment == 'change' || eveniment == 'rename') {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});

// initializam erorile
function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, 'resurse/json/erori.json')).toString('utf-8');
    obGlobal.obErori = JSON.parse(continut);

    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine);
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
}

initErori();

// initializam imaginile pentru galerie
function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier)
    }
}

initImagini();

// functie pentru afisarea paginilor de eroare
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find(function (elem) {
        return elem.identificator == identificator;
    });

    if (eroare) {
        if (eroare.status) res.status(identificator);
        var titluCustom = titlu || eroare.titlu;
        var textCustom = text || eroare.text;
        var imagineCustom = imagine || eroare.imagine;
    } else {
        var err = obGlobal.obErori.eroare_default;
        var titluCustom = titlu || err.titlu;
        var textCustom = text || err.text;
        var imagineCustom = imagine || err.imagine;
    }
    res.render('pagini/eroare', {
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom,
    });
}

// configuram accesul la resursele statice
app.use('/resurse', express.static(path.join(__dirname, 'resurse')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// ruta pentru favicon
app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, 'resurse/imagini/favicon/favicon.ico'));
});

// rutele principale
app.get(['/', '/index', '/home'], function (req, res) {
    let dataCurenta = new Date();
    let lunaCurenta = dataCurenta.toLocaleString('ro', { month: 'long' }).toLowerCase();
    let vImagini = obGlobal.obImagini.imagini.filter(img => img.luni.includes(lunaCurenta)).slice(0, 10);

    let ofertaCurenta = null;
    try {
        let oferte = JSON.parse(fs.readFileSync(path.join(__dirname, 'resurse/json/oferte.json')).toString());
        ofertaCurenta = oferte.oferte[0];
    } catch (e) { console.log("Eroare la citirea ofertei", e); }

    res.render('pagini/index', { ip: req.ip, imagini: vImagini, cale: obGlobal.obImagini.cale_galerie, oferta: ofertaCurenta });
});

// rutele secundare
app.get('/despre', function (req, res) {
    res.render('pagini/despre');
});

app.get('/galerie-statica', function (req, res) {
    res.render('pagini/galerie-statica', { imagini: obGlobal.obImagini.imagini, cale: obGlobal.obImagini.cale_galerie });
});

// ruta pentru seturi de produse
app.get("/seturi", async (req, res) => {
    try {
        const seturiResult = await client.query(`SELECT * FROM seturi`);
        const seturi = [];

        for (let set of seturiResult.rows) {
            const produseResult = await client.query(`
                SELECT m.* FROM masini m
                JOIN asociere_set a ON m.id = a.id_produs
                WHERE a.id_set = $1
            `, [set.id]);

            const produse = produseResult.rows;
            const suma = produse.reduce((acc, p) => acc + parseFloat(p.pret), 0);
            const reducere = Math.min(5, produse.length) * 5;
            const pretFinal = (suma * (100 - reducere)) / 100;

            seturi.push({ ...set, produse: produse, pretFinal: pretFinal.toFixed(2) });
        }

        res.render("pagini/seturi", { seturi: seturi });
    } catch (err) {
        console.error("Eroare la /seturi:", err);
        afisareEroare(res, 2);
    }
});

// ruta pentru afisarea tuturor produselor cu filtre si optiuni
app.get("/produse", function(req, res) {
    // definim query-urile necesare pentru filtre
    let queryPret = "SELECT MIN(pret) AS min_pret, MAX(pret) AS max_pret FROM masini";
    let queryPutere = "SELECT MIN(putere) AS min_putere, MAX(putere) AS max_putere FROM masini";
    let queryData = "SELECT MIN(data_adaugare) AS min_data, MAX(data_adaugare) AS max_data FROM masini";
    let queryCategorii = "SELECT unnest(enum_range(NULL::categ_masina)) AS categorie";
    let queryTipuri = "SELECT unnest(enum_range(NULL::tipuri_masina)) AS tip_masina";
    let queryDotari = "SELECT DISTINCT UNNEST(dotari) AS dotare FROM masini";
    let queryProduse = "SELECT * FROM masini";

    // executam query-urile secvential pentru a obtine toate datele necesare
    client.query(queryPret, function(err, rezPret) {
        if (err) { afisareEroare(res, 2); return; }

        client.query(queryPutere, function(err, rezPutere) {
            if (err) { afisareEroare(res, 2); return; }

            client.query(queryData, function(err, rezData) {
                if (err) { afisareEroare(res, 2); return; }

                client.query(queryCategorii, function(err, rezCategorii) {
                    if (err) { afisareEroare(res, 2); return; }

                    client.query(queryTipuri, function(err, rezTipuri) {
                        if (err) { afisareEroare(res, 2); return; }

                        client.query(queryDotari, function(err, rezDotari) {
                            if (err) { afisareEroare(res, 2); return; }

                            client.query(queryProduse, function(err, rezProduse) {
                                if (err) { afisareEroare(res, 2); return; }

                                // randam pagina produse cu toate filtrele si datele necesare
                                res.render("pagini/produse", {
                                    produse: rezProduse.rows,
                                    minPret: rezPret.rows[0].min_pret,
                                    maxPret: rezPret.rows[0].max_pret,
                                    minPutere: rezPutere.rows[0].min_putere,
                                    maxPutere: rezPutere.rows[0].max_putere,
                                    minData: rezData.rows[0].min_data,
                                    maxData: rezData.rows[0].max_data,
                                    categorii: rezCategorii.rows,
                                    tipuri: rezTipuri.rows,
                                    dotari: rezDotari.rows
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// ruta pentru afisarea detaliilor unui produs si a seturilor asociate
app.get("/produs/:id", async (req, res) => {
    try {
        let idProdus = req.params.id;

        // obtinem produsul
        const produsResult = await client.query(`SELECT * FROM masini WHERE id = $1`, [idProdus]);

        if (produsResult.rowCount == 0) {
            afisareEroare(res, 2, "Produsul nu exista.");
            return;
        }

        const produs = produsResult.rows[0];

        // obtinem seturile din care face parte produsul
        const seturiResult = await client.query(`
            SELECT s.id, s.nume_set, s.descriere_set
            FROM seturi s
            JOIN asociere_set a ON s.id = a.id_set
            WHERE a.id_produs = $1
        `, [idProdus]);

        const seturi = [];

        for (let set of seturiResult.rows) {
            // obtinem toate produsele din set
            const produseSetResult = await client.query(`
                SELECT m.*
                FROM masini m
                JOIN asociere_set a ON m.id = a.id_produs
                WHERE a.id_set = $1
            `, [set.id]);

            const produse = produseSetResult.rows;

            // calculam pretul final al setului cu reducere
            const suma = produse.reduce((acc, p) => acc + parseFloat(p.pret), 0);
            const reducere = Math.min(5, produse.length) * 5;
            const pretFinal = (suma * (100 - reducere)) / 100;

            seturi.push({
                ...set,
                produse: produse,
                pretFinal: pretFinal.toFixed(2)
            });
        }

        res.render("pagini/produs", { prod: produs, seturi: seturi });

    } catch (err) {
        console.error("Eroare la afisarea produsului:", err);
        afisareEroare(res, 2);
    }
});

// ruta pentru afisarea compararii a doua produse
app.get("/comparare", async (req, res) => {
    try {
        if (!req.query.ids) {
            return res.send("Nu ai transmis id-urile produselor pentru comparare.");
        }

        let ids = req.query.ids.split(",").map(x => parseInt(x));
        if (ids.length !== 2) {
            return res.send("Trebuie sa compari exact doua produse.");
        }

        let rezultat = await client.query(
            "SELECT * FROM masini WHERE id = ANY($1::int[])",
            [ids]
        );

        if (rezultat.rows.length !== 2) {
            return res.send("Produsele nu au fost gasite.");
        }

        // randam pagina de comparare cu cele doua produse
        res.render("pagini/comparare", { produse: rezultat.rows });

    } catch (err) {
        console.error("Eroare la comparare:", err);
        res.status(500).send("Eroare la comparare.");
    }
});

// ruta pentru afisarea fisierului package.json
app.get('/fisier', function (req, res, next) {
    res.sendFile(path.join(__dirname, 'package.json'));
});

// ruta intermediara pentru test
app.get('/abc', function (req, res, next) {
    res.write('Data curenta: ');
    next();
});

app.get('/abc', function (req, res, next) {
    res.write(new Date() + '');
    res.end();
    next();
});

app.get('/abc', function (req, res, next) {
    console.log('------------');
});

// restrictie pentru accesarea directa a resurselor
app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function (req, res, next) {
    afisareEroare(res, 403);
});

// restrictie pentru accesarea fisierelor ejs
app.get(/^\/.*\.ejs$/, function (req, res, next) {
    afisareEroare(res, 400);
});

// handler generic pentru toate rutele neidentificate
app.get('/*splat', function (req, res, next) {
    try {
        res.render('pagini' + req.url, function (err, rezultatRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith('Failed to lookup view')) {
                    afisareEroare(res, 404);
                } else {
                    afisareEroare(res);
                }
            } else {
                res.send(rezultatRandare);
                console.log(rezultatRandare);
            }
        });
    } catch (errRandare) {
        if (errRandare.message.startsWith('Cannot find module')) {
            afisareEroare(res, 404);
        } else {
            afisareEroare(res);
        }
    }
});

// pornim serverul pe portul 8080
app.listen(8080);
console.log('Serverul a pornit');
