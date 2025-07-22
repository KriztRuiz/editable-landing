fetch('admin/config.yml')
    .then(res => res.text())
    .then(text => {
        console.log("Netlify CMS cargado correctamente.");
    });