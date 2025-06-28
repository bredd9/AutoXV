 // codul se executa dupa incarcarea paginii
window.onload = function () {

    fetch('/resurse/json/oferte.json')
    .then(response => response.json())
    .then(data => {
        let oferta = data.oferte[0];
        if (!oferta) return; // daca nu exista oferta, iesim

        let categorieOferta = oferta.categorie;
        let reducere = oferta.reducere;

        let produse = document.getElementsByClassName('produs');
        for (let prod of produse) {
            if (prod.getAttribute('data-categorie') === categorieOferta) {
                let pretElem = prod.querySelector('.val-pret');
                let pretInitial = parseFloat(pretElem.innerText.trim());

                let pretNou = pretInitial * (1 - reducere / 100);

                // afisam pretul nou langa cel initial
                pretElem.innerHTML = `
    <s>${pretInitial}€</s> 
    <span class="pret-redus">${pretNou.toFixed(2)}€</span>
`;

            }
        }
    })
    .catch(err => console.error("Eroare la preluarea ofertei:", err));

    // referinta la containerul modal pentru bonus 11 etapa 6
    // referinta la butonul de filtrare
    let btn = document.getElementById("filtrare");

    // colectam toate produsele de pe pagina
    let produse = document.getElementsByClassName("produs");

    // referinta la sectiunea cu produse
    let sectiuneProduse = document.getElementById("produse");

    // legam functia de filtrare la butonul de filtrare
    btn.onclick = filtreazaProduse;

    // functie care elimina diacriticele dintr-un text pentru bonus 7 etapa 6
function eliminaDiacritice(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// functie care filtreaza produsele in functie de inputuri
    function filtreazaProduse() {
        // luam textul introdus pentru nume
        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();

        // luam toate radio-urile pentru intervale de pret
        let vectRadio = document.getElementsByName("gr_rad");

        let inpPretRange = null;
        let minPret = null;
        let maxPret = null;

        // identificam radio-ul selectat
        for (let rad of vectRadio) {
            if (rad.checked) {
                inpPretRange = rad.value;
                if (inpPretRange != "toate") {
                    [minPret, maxPret] = inpPretRange.split(":");
                    minPret = parseInt(minPret);
                    maxPret = parseInt(maxPret);
                }
                break;
            }
        }

        // luam valoarea sliderului de pret minim
        let inpPret = parseInt(document.getElementById("inp-pret").value);

        // luam categoria selectata
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();

        // luam valoarea sliderului de putere minima
        let inpPutere = parseInt(document.getElementById("inp-putere").value);

        // luam tipul de masina selectat
        let inpTip = document.getElementById("inp-tip_masina").value.trim().toLowerCase();

        // verificam daca este bifata optiunea electrica
        let inpElectrica = document.getElementById("inp-electrica").checked;

        // colectam toate dotarile selectate
        let inpDotari = Array.from(document.getElementsByClassName("inp-dotare"))
            .filter(d => d.checked)
            .map(d => d.value.trim().toLowerCase());

        // contor pentru produse afisate
        let nrAfisate = 0;

        // parcurgem fiecare produs pentru filtrare
        

        // daca nu s-a afisat niciun produs, afisam mesajul de eroare
        if (nrAfisate == 0) {
            if (!document.getElementById("mesaj-eroare")) {
                let mesaj = document.createElement("p");
                mesaj.id = "mesaj-eroare";
                mesaj.innerHTML = "Nu exista masini care sa respecte criteriile selectate.";
                sectiuneProduse.parentNode.insertBefore(mesaj, sectiuneProduse.nextElementSibling);
            }
        } else {
            // daca mesajul de eroare exista si avem produse, il stergem
            if (document.getElementById("mesaj-eroare")) {
                document.getElementById("mesaj-eroare").remove();
            }
        }
        for (let prod of produse) {
            // ascundem produsul initial
            prod.style.display = "none";

            // extragem datele produsului
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let putere = parseInt(prod.getElementsByClassName("val-putere")[0].innerHTML.trim());
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();

            // extragem dotarile produsului si le curatam
            let dotariProd = prod.getAttribute("data-dotari").split(",").map(d => d.trim().toLowerCase());
            // verificam daca produsul are toate dotarile selectate
            let condDotari = inpDotari.every(d => dotariProd.includes(d));

            // verificam toate conditiile de filtrare
            // bonus 7 etapa 6 - comparam numele eliminand diacriticele
            let cond1 = eliminaDiacritice(nume).startsWith(eliminaDiacritice(inpNume));
            let cond2 = (inpPretRange == "toate" || (minPret <= pret && pret < maxPret));
            let cond3 = (inpPret <= pret);
            let cond4 = (inpCategorie == "toate" || inpCategorie == categorie);
            let cond5 = (putere >= inpPutere);
            let cond6 = (inpTip == "toate" || inpTip == tip);
            let cond7 = (!inpElectrica || categorie == "electrica");

            // daca produsul respecta toate conditiile, il afisam
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && condDotari) {
                prod.style.display = "block";
                nrAfisate++;
            }
        }
    }

    // legam filtrarea la inputul de nume
// bonus 4 etapa 6 - aplicam filtrarea la onchange fara sa apasam butonul
    document.getElementById("inp-nume").oninput = filtreazaProduse;

    // legam filtrarea la fiecare radio
// bonus 4 etapa 6 - aplicam filtrarea la onchange fara sa apasam butonul
    let radioBtns = document.getElementsByName("gr_rad");
    for (let rad of radioBtns) {
        rad.onchange = filtreazaProduse;
    }

    // actualizam afisarea sliderului si aplicam filtrarea la modificare
// bonus 4 etapa 6 - aplicam filtrarea la onchange fara sa apasam butonul
    document.getElementById("inp-pret").oninput = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filtreazaProduse();
    }

    // legam filtrarea la selectul de categorie
// bonus 4 etapa 6 - aplicam filtrarea la onchange fara sa apasam butonul
    document.getElementById("inp-categorie").onchange = filtreazaProduse;

    // actualizam afisarea sliderului de putere si aplicam filtrarea la modificare
    document.getElementById("inp-putere").oninput = function () {
        document.getElementById("infoPutere").innerHTML = `(${this.value})`;
        filtreazaProduse();
    }

    // legam filtrarea la selectul de tip masina
    document.getElementById("inp-tip_masina").onchange = filtreazaProduse;

    // legam filtrarea la checkbox-ul de electrica
    document.getElementById("inp-electrica").onchange = filtreazaProduse;

    // legam filtrarea la fiecare checkbox de dotare
// bonus 4 etapa 6 - aplicam filtrarea la onchange fara sa apasam butonul
    let dotari = document.getElementsByClassName("inp-dotare");
    for (let d of dotari) {
        d.onchange = filtreazaProduse;
    }

    // logica pentru resetare
    document.getElementById("resetare").onclick = function () {
        if (confirm("Sigur doriti sa resetati filtrele?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("i_rad4").checked = true;

            document.getElementById("inp-pret").value = 0;
            document.getElementById("infoRange").innerHTML = "(0)";

            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-putere").value = document.getElementById("inp-putere").min;
            document.getElementById("infoPutere").innerHTML = `(${document.getElementById("inp-putere").min})`;

            document.getElementById("inp-tip_masina").value = "toate";
            document.getElementById("inp-electrica").checked = false;

            for (let d of dotari) {
                d.checked = false;
            }

            for (let prod of produse) {
                prod.style.display = "block";
            }

            if (document.getElementById("mesaj-eroare")) {
                document.getElementById("mesaj-eroare").remove();
            }
        }
    }

    // butonul pentru sortare crescatoare
    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1);
    }

    // butonul pentru sortare descrescatoare
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1);
    }

    // functie care sorteaza produsele dupa pret si nume
    function sorteaza(semn) {
        let vProduse = Array.from(produse);
        vProduse.sort(function (a, b) {
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());
            if (pretA != pretB) {
                return semn * (pretA - pretB);
            }
            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            return semn * numeA.localeCompare(numeB);
        });
        for (let prod of vProduse) {
            prod.parentNode.appendChild(prod);
        }
    }

    // cand apasam alt+c calculam suma preturilor afisate
    // bonus 11 etapa 6 - afisam detalii produs in modal box la click pe produs
   let modal = document.getElementById('product-modal');
let modalContent = document.getElementById('modal-details');
let closeModal = document.getElementById('close-modal');

for (let prod of produse) {
    prod.addEventListener('click', function () {
        
        let nume = prod.querySelector('.val-nume').innerText.trim();
        let pret = prod.querySelector('.val-pret').innerText.trim();
        let putere = prod.querySelector('.val-putere').innerText.trim();
        let tip = prod.querySelector('.val-tip_masina').innerText.trim();
        let categorie = prod.querySelector('.val-categorie').innerText.trim();
        let imagine = prod.querySelector('img').src;

        let dotari = prod.getAttribute('data-dotari').split(',').map(d => d.trim());

        let listaDotari = "<ul>";
        for (let dotare of dotari) {
            listaDotari += `<li>${dotare}</li>`;
        }
        listaDotari += "</ul>";

        modalContent.innerHTML = `
            <h3>${nume}</h3>
            <img src="${imagine}" style="width:100%; max-height:300px; object-fit:cover; margin-bottom:15px;">
            <p><strong>Preț:</strong> ${pret}</p>
            <p><strong>Putere:</strong> ${putere}</p>
            <p><strong>Tip:</strong> ${tip}</p>
            <p><strong>Categorie:</strong> ${categorie}</p>
            <p><strong>Dotări:</strong> ${listaDotari}</p>
        `;

        modal.classList.remove('hidden');
    });
}

closeModal.addEventListener('click', function () {
    modal.classList.add('hidden');
});

window.addEventListener('click', function (event) {
    if (event.target == modal) {
        modal.classList.add('hidden');
    }
});




    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {
            let sumaPreturi = 0;
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
                    sumaPreturi += pret;
                }
            }
            if (!document.getElementById("suma_preturi")) {
                let pRezultat = document.createElement("p");
                pRezultat.innerHTML = sumaPreturi;
                pRezultat.id = "suma_preturi";
                let p = document.getElementById("p-suma");
                p.parentNode.insertBefore(pRezultat, p.nextElementSibling);
                setTimeout(function () {
                    let p1 = document.getElementById("suma_preturi");
                    if (p1) {
                        p1.remove();
                    }
                }, 2000);
            }
        }
    }
}
