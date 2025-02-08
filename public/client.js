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

upForm.addEventListener('submit', async (event) => {
    const formData = new FormData(event.target);
    const file = formData.get('pdf');
    event.target.reset();

    const title = file.name;
    const hash = 7;
    await uploadPDF(title, file);
    await signPaper(window.keys.public, title, hash);
});

downForm.addEventListener('submit', async (event) => {
    const formData = new FormData(event.target);
    const title = formData.get('paperTitle');
    event.target.reset();

    const pdf = await getPDF(title);
    const signature = await getSignature(title);
    await validatePaper(title, window.keys.private, signature);
});

walletForm.addEventListener('submit', (event) => {
    const formData = new FormData(event.target);
    const publicKey = formData.get('publicKey');
    const privateKey = formData.get('privateKey');
    event.target.reset();

    window.keys = {public: publicKey, private: privateKey};
    //document.cookie = `key=${key.value}; max-age=3600`;
});
