console.log("Hello world!");

const dialog = document.querySelector('dialog');
//dialog.showModal();

const form = document.querySelector('dialog form');
const key = document.querySelector('#key');
form.addEventListener('submit', (event) => {
    document.cookie = `key=${key.value}; max-age=3600`;
});
