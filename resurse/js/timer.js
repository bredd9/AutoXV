window.addEventListener('load', function () {
    let timerElement = document.getElementById("timer");
    if (!timerElement) return; // daca nu exista temporizatorul, iesim.

    // preluam data de finalizare din atributul custom
    let dataFinalizare = new Date(timerElement.getAttribute('data-finalizare'));

    function actualizeazaTimer() {
        let acum = new Date();
        let ramase = (dataFinalizare - acum) / 1000;

        if (ramase <= 0) {
            timerElement.innerText = "Expirata";
            location.reload(); // reincarca pagina pentru a prelua noua oferta
            return;
        }

        let ore = Math.floor(ramase / 3600);
        let minute = Math.floor((ramase % 3600) / 60);
        let secunde = Math.floor(ramase % 60);

        timerElement.innerText = `${ore}h ${minute}m ${secunde}s`;

        // schimbam culoarea in galben in ultimele 10 secunde
        if (ramase <= 10) {
            timerElement.classList.add("final-countdown");
        } else {
            timerElement.classList.remove("final-countdown");
        }
    }

    actualizeazaTimer();
    setInterval(actualizeazaTimer, 1000);
});
