const express= require("express");
const path= require("path");
const fs = require("fs");
const sharp = require("sharp");
const sass = require("sass");
const pg = require("pg");

app=express();

console.log('Folderul proiectului: ', __dirname);
console.log('Calea fisierului index.js: ', __filename);
console.log('Folderul curent de lucru: ', process.cwd());

app.set('view engine', 'ejs');

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, 'resurse/scss'),
    folderCss: path.join(__dirname, 'resurse/css'),
    folderBackup: path.join(__dirname, 'backup'),
};

function initErori() {
    let continut = fs
        .readFileSync(path.join(__dirname, 'resurse/json/erori.json'))
        .toString('utf-8');
    console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    console.log(obGlobal.obErori);

    obGlobal.obErori.eroare_default.imagine = path.join(
        obGlobal.obErori.cale_baza,
        obGlobal.obErori.eroare_default.imagine
    );
    for (let eroare of obGlobal.obErori.info_erori) {
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine);
    }
    console.log(obGlobal.obErori);
}

initErori();

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
        //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom,
    });
}

vect_foldere = ['temp', 'backup', 'temp1'];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss) {
    console.log('cale:', caleCss);
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss); // "folder1/folder2/ceva.txt" -> "ceva.txt"
        let numeFis = numeFisExt.split('.')[0]; /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + '.css'; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, 'resurse/css');
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(
            caleCss,
            path.join(obGlobal.folderBackup, 'resurse/css', numeFisCss)
        ); // +(new Date()).getTime()
    }
    rez = sass.compile(caleScss, { sourceMap: true });
    fs.writeFileSync(caleCss, rez.css);
    // console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");

//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == '.scss') {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (eveniment == 'change' || eveniment == 'rename') {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});

app.use('/resurse', express.static(path.join(__dirname, 'resurse')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(__dirname, 'resurse/imagini/favicon/favicon.ico'));
});

app.get(['/', '/index', '/home'], function (req, res) {
    res.render('pagini/index', {
        ip: req.ip,
    });
});

app.get('/despre', function (req, res) {
    res.render('pagini/despre');
});

app.get('/index/a', function (req, res) {
    res.render('pagini/index');
});

app.get('/cerere', function (req, res) {
    res.send("<p style='color:blue'>Buna ziua</p>");
});

app.get('/fisier', function (req, res, next) {
    res.sendfile(path.join(__dirname, 'package.json'));
});

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

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function (req, res, next) {
    afisareEroare(res, 403);
});

app.get(/^\/.*\.ejs$/, function (req, res, next) {
    afisareEroare(res, 400);
});

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

app.listen(8080);
console.log('Serverul a pornit');


