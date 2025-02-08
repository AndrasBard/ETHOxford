// Wrappers for API calls to the backend

async function signPaper(privateKeyHex, title, hash) {
    const response = await fetch('/sign-paper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'privateKeyHex': privateKeyHex,
            'title': title,
            'hash': hash
        })
    });
    const data = response.json();
    return data;
}

async function uploadPDF(title, pdf) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('pdf', pdf);
    const response = await fetch('/upload-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formData
    });
    const data = await response.json();
    return data;
}

async function getSignature(title) {
    const response = await fetch(`/papers/${title}`);
    const data = await response.json();
    return data;
}

async function getPDF(title) {
    const response = await fetch(`/pdf/${title}`);
    const data = await response.json();
    return data;
}

async function validatePaper(title, publicKeyHex, signature) {
    const response = await fetch('/validate-paper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'title': title,
            'publicKeyHex': publicKeyHex,
            'signature': signature
        })
    });
    const data = await response.json();
    return data;
}
