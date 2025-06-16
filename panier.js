import { updateFavorisCount } from "./addFavorisPanier.js";
import { createStripeCheckoutSession } from './api/apiClient.js';
const baseURL = "http://localhost:3000/";
const panierContainer = document.getElementById("panier-container");
const totalAmount = document.getElementById("total-amount");
const formLivraison = document.getElementById("form-livraison");

function getPanier() {
  return JSON.parse(localStorage.getItem('panier')) || [];
}

function savePanier(panier) {
  localStorage.setItem('panier', JSON.stringify(panier));
}

function calculerTotal(panier) {
  let total = 4.99;
  panier.forEach(p => {
    total += ((p.prix * (p.quantite || 1)));
  });
  totalAmount.textContent = `${total.toFixed(2)} €`;
}

function renderPanier() {
  const panier = getPanier();
  panierContainer.innerHTML = '';

  if (panier.length === 0) {
    panierContainer.innerHTML = '<p>Votre panier est vide.</p>';
    totalAmount.textContent = '0 €';
    return;
  }

  panier.forEach(produit => {
    const card = document.createElement('div');
    card.classList.add('panier-card');

    const image = document.createElement('img');
    image.src = baseURL + produit.image;
    image.alt = produit.nom;
    image.addEventListener("click", () => {
      window.location.href = `/produit.html/${produit.reference}`;
    });

    const nom = document.createElement('h3');
    nom.textContent = produit.nom;

    const prix = document.createElement('p');
    prix.textContent = `Prix unitaire : ${produit.prix} €`;

    const quantiteLabel = document.createElement('label');
    quantiteLabel.textContent = 'Quantité : ';
    quantiteLabel.setAttribute('for', `quantite-${produit._id}`);

    const quantiteInput = document.createElement('input');
    quantiteInput.type = 'number';
    quantiteInput.min = `1`;
    quantiteInput.max = `${produit.stock}`;
    quantiteInput.value = produit.quantite || 1;
    quantiteInput.id = `quantite-${produit._id}`;
    quantiteInput.addEventListener('change', (e) => {
      const panier = getPanier();
      const index = panier.findIndex(p => p._id === produit._id);
      if (index !== -1) {
        panier[index].quantite = parseInt(e.target.value, 10);
        savePanier(panier);
        calculerTotal(panier);
      }
    });

    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = "Supprimer";
    btnSupprimer.classList.add("btn-supprimer");
    btnSupprimer.addEventListener('click', () => {
      let panier = getPanier();
      panier = panier.filter(p => p._id !== produit._id);
      savePanier(panier);
      renderPanier();
      updateFavorisCount();
    });

    card.appendChild(image);
    card.appendChild(nom);
    card.appendChild(prix);
    card.appendChild(quantiteLabel);
    card.appendChild(quantiteInput);
    card.appendChild(btnSupprimer);

    panierContainer.appendChild(card);
  });

  calculerTotal(panier);
}

function completeFormulaire() {
  const inputAdresse = document.getElementById('adresse');
  const dataList = document.getElementById('suggestions');
  const inputVille = document.getElementById('ville');
  const inputCodePostal = document.getElementById('code-postal');

  inputAdresse.addEventListener('input', async () => {
    const query = inputAdresse.value;
    if (query.length < 3) return;

    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      dataList.innerHTML = '';

      data.features.forEach(feature => {
        const option = document.createElement('option');
        option.value = feature.properties.label;
        option.dataset.city = feature.properties.city;
        option.dataset.postcode = feature.properties.postcode;
        dataList.appendChild(option);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des adresses :", error);
    }
  });

  inputAdresse.addEventListener('change', () => {
    const selected = [...dataList.options].find(opt => opt.value === inputAdresse.value);
    if (selected) {
      inputVille.value = selected.dataset.city || '';
      inputCodePostal.value = selected.dataset.postcode || '';
    }
  });
}

function formulairePanier(){
// Soumission du formulaire avec appel Stripe
formLivraison.addEventListener("submit", async (e) => {
  e.preventDefault();

  const panier = getPanier();
  if (panier.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  const nom = formLivraison.nom.value.trim();
  const adresse = formLivraison.adresse.value.trim();
  const ville = formLivraison.ville.value.trim();
  const cp = formLivraison['code-postal'].value.trim();
  const email = formLivraison.email.value.trim();
  const telephone = formLivraison.telephone.value.trim();

  if (!nom || !adresse || !ville || !cp || !email || !telephone) {
    alert("Merci de remplir tous les champs obligatoires.");
    return;
  }

  // Tu peux ici envoyer les infos à ton backend si besoin, mais Stripe ne les prend pas directement
  const lignes = panier.map(p => ({
    id: p._id,
    quantite: p.quantite || 1
  }));

   // On prépare l'objet customer
    const customer = { nom, adresse, ville, cp, email, telephone };

  try {

  const session = await createStripeCheckoutSession(lignes,customer);

    window.location.href = session.url;
  } catch (err) {
    console.error("Erreur de paiement :", err);
    alert("Erreur lors du paiement.");
  }
});
}
function init() {
  renderPanier();
  completeFormulaire();
  updateFavorisCount();
  formulairePanier();
}

document.addEventListener('DOMContentLoaded', init);
