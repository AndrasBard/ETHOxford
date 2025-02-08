console.log("Hello world!");

const [upButton, downButton, walletButton] = document.querySelectorAll('header .button');
const [upDialog, downDialog, walletDialog] = document.querySelectorAll('dialog');

upButton.addEventListener('click', (event) => {
    upDialog.showModal();
});

downButton.addEventListener('click', (event) => {
    downDialog.showModal();
});

walletButton.addEventListener('click', (event) => {
    walletDialog.showModal();
});

const form = document.querySelector('dialog form');
const key = document.querySelector('#key');
form.addEventListener('submit', (event) => {
    document.cookie = `key=${key.value}; max-age=3600`;
});
