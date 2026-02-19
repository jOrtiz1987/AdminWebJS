const crypto = require('crypto');
const fs = require('fs');

const files = [
    "Catedral_Basílica_de_Zacatecas_21.JPG",
    "Mina_El_Edén_Zacatecas_México.jpg",
    "Cerro_de_La_Bufa_Zacatecas,_ZAC,_Mexico_-_panoramio.jpg",
    "Teatro_Calderon_Zacatecas.JPG",
    "Museo_Rafael_Coronel_Zac.jpg",
    "MuseoPedroCoronel.JPG",
    "Plazuela_Miguel_Auza,_Zacatecas.JPG",
    "AlamedaZacatecas03.JPG",
    "Acueducto_de_Zacatecas.JPG",
    "Mercado_Gonzalez_Ortega_zacatecas.jpg",
    "Portal_de_Rosales.JPG",
    "Jardin_Juarez.JPG",
    "Centro_Zacatecas_Palacio_Gobierno_Plaza_de_Armas_México.jpg",
    "Casa_de_la_Zacatecana.jpg",
    "Ex_Templo_de_San_Agustín_Zacatecas.jpg"
];

let output = "";
files.forEach(filename => {
    const normalized = filename.replace(/ /g, '_');
    const hash = crypto.createHash('md5').update(normalized).digest('hex');
    const a = hash.substring(0, 1);
    const ab = hash.substring(0, 2);
    const url = `https://upload.wikimedia.org/wikipedia/commons/${a}/${ab}/${encodeURIComponent(normalized)}`;
    output += `${filename}: ${url}\n`;
});

fs.writeFileSync('urls_utf8.txt', output, 'utf8');
console.log("Done writing urls_utf8.txt");
