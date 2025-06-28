window.addEventListener('load', function () {
    // preluam produsele comparate din localStorage sau initializam lista goala
    let comparare = JSON.parse(localStorage.getItem('comparare')) || [];
    let ultimaSelectie = parseInt(localStorage.getItem('ultimaSelectie')) || 0;

    const container = document.getElementById('container-comparare');

    // daca a trecut mai mult de o zi, stergem selectiile salvate
    let now = new Date().getTime();
    if (ultimaSelectie && (now - ultimaSelectie > 24 * 60 * 60 * 1000)) {
        comparare = [];
        localStorage.removeItem('comparare');
        localStorage.removeItem('ultimaSelectie');
    }

    afiseazaContainer();

    // adaugam eveniment click pe fiecare buton de comparare
    document.querySelectorAll('.btn-compara').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // oprim deschiderea modalului

            // daca deja sunt selectate doua produse, nu mai permitem adaugarea
            if (comparare.length >= 2) return;

            let produs = {
                id: this.getAttribute('data-id'),
                nume: this.getAttribute('data-nume')
            };

            comparare.push(produs);
            localStorage.setItem('comparare', JSON.stringify(comparare));
            localStorage.setItem('ultimaSelectie', new Date().getTime());

            afiseazaContainer();
        });
    });

    // afisam containerul de comparare si butoanele asociate
    function afiseazaContainer() {
        const lista = document.getElementById('lista-comparare');
        if (comparare.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        lista.innerHTML = '';

        comparare.forEach((prod, index) => {
            let li = document.createElement('li');
            li.innerText = prod.nume + ' ';

            let btnSterge = document.createElement('button');
            btnSterge.innerText = 'X';
            btnSterge.style.marginLeft = '5px';
            btnSterge.addEventListener('click', function () {
                comparare.splice(index, 1);
                localStorage.setItem('comparare', JSON.stringify(comparare));
                afiseazaContainer();
                activeazaButoane();
            });

            li.appendChild(btnSterge);
            lista.appendChild(li);
        });

        // daca sunt exact doua produse, afisam butonul de comparare
        if (comparare.length === 2 && !document.getElementById('btn-afiseaza')) {
            let btnAfiseaza = document.createElement('button');
            btnAfiseaza.id = 'btn-afiseaza';
            btnAfiseaza.innerText = 'Afiseaza compararea';
            btnAfiseaza.style.marginTop = '10px';
            btnAfiseaza.addEventListener('click', function () {
                window.open(`/comparare?ids=${comparare[0].id},${comparare[1].id}`, '_blank');
            });
            container.appendChild(btnAfiseaza);

            dezactiveazaButoane();
        }

        // daca avem mai putin de doua produse, ascundem butonul si reactivam butoanele
        if (comparare.length < 2) {
            let btnAfiseaza = document.getElementById('btn-afiseaza');
            if (btnAfiseaza) btnAfiseaza.remove();
            activeazaButoane();
        }
    }

    // functie pentru dezactivarea butoanelor de comparare
    function dezactiveazaButoane() {
        document.querySelectorAll('.btn-compara').forEach(btn => {
            btn.disabled = true;
            btn.title = 'Stergeti un produs din lista de comparare pentru a adauga altul.';
        });
    }

    // functie pentru activarea butoanelor de comparare
    function activeazaButoane() {
        document.querySelectorAll('.btn-compara').forEach(btn => {
            btn.disabled = false;
            btn.title = '';
        });
    }
});
