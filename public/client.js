console.log("Hello world!");

const [upButton, downButton, walletButton] = document.querySelectorAll('header .button');
const [upDialog, downDialog, walletDialog] = document.querySelectorAll('dialog');
const [upForm, downForm, walletForm] = document.querySelectorAll('dialog form');

upButton.addEventListener('click', (event) => {
    upDialog.showModal();
});

downButton.addEventListener('click', (event) => {
    downDialog.showModal();
});

walletButton.addEventListener('click', (event) => {
    walletDialog.showModal();
});

upForm.addEventListener('submit', (event) => {
    const formData = new FormData(event.target);
    formData.forEach((v, k) => {
        console.log(k);
        console.log(v);
        console.log();
    });
    event.target.reset();
});

downForm.addEventListener('submit', (event) => {
    const formData = new FormData(event.target);
    formData.forEach((v, k) => {
        console.log(k);
        console.log(v);
        console.log();
    });
    event.target.reset();
});

walletForm.addEventListener('submit', (event) => {
    const formData = new FormData(event.target);
    formData.forEach((v, k) => {
        console.log(k);
        console.log(v);
        console.log();
    });
    event.target.reset();
    //document.cookie = `key=${key.value}; max-age=3600`;
});
