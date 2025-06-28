// cand pagina este incarcata complet
document.addEventListener('DOMContentLoaded', () => {

    // selectez butonul de schimbare tema
    const themeToggle = document.getElementById('theme-toggle');

    // selectez iconita din buton
    const icon = document.getElementById('theme-icon');

    // verific daca tema este salvata in localStorage
    const savedTheme = localStorage.getItem('theme');

    // daca tema salvata este dark, aplic clasa dark-mode si schimb iconita
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        icon.classList.remove('fa-moon', 'fa-regular');
        icon.classList.add('fa-sun', 'fa-solid');
    }

    // adaug eveniment de click pe buton
    themeToggle.addEventListener('click', () => {

        // schimb clasa dark-mode pe body
        document.body.classList.toggle('dark-mode');

        // daca tema curenta este dark, schimb iconita si salvez tema dark
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon', 'fa-regular');
            icon.classList.add('fa-sun', 'fa-solid');
            localStorage.setItem('theme', 'dark');
        } 
        // altfel, tema este light, schimb iconita si salvez tema light
        else {
            icon.classList.remove('fa-sun', 'fa-solid');
            icon.classList.add('fa-moon', 'fa-regular');
            localStorage.setItem('theme', 'light');
        }
    });
});
