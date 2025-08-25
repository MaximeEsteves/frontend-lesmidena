import {
  updateFavorisCount,
  mettreAJourBoutonsPanier,
  initPageListePanier,
} from '../../global/addFavorisPanier.js';
import { getAllProducts, API_BASE } from '../../api/apiClient.js';

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  const productsData = await getAllProducts();
  getProduitFavoris();
  initPageListePanier(productsData);
  mettreAJourBoutonsPanier();
  updateFavorisCount();
});

const baseURL = API_BASE + '/';

// Fonction principale d'affichage des favoris
function getProduitFavoris() {
  const container = document.querySelector('.favoris-container');
  const messageVide = document.getElementById('message-vide');
  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];

  if (favoris.length === 0) {
    messageVide.style.display = 'block';
    return;
  }

  favoris.forEach((produit) => {
    const image = document.createElement('img');
    const nom = document.createElement('h2');
    const description = document.createElement('p');
    const prix = document.createElement('p');
    const btnAjouter = document.createElement('button');
    const btnSupprimer = document.createElement('button');
    const card = document.createElement('div');
    const divBtn = document.createElement('div');
    const divInfoCard = document.createElement('div');
    const divTextCard = document.createElement('div');

    divTextCard.classList.add('div-text-card');
    divInfoCard.classList.add('div-info-card');
    divBtn.classList.add('div-btn');
    card.classList.add('favori-card');

    image.src = baseURL + produit.image[0];
    image.alt = produit.nom;
    image.addEventListener('click', () => {
      window.location.href = `/produit/${encodeURIComponent(
        produit.reference
      )}`;
    });
    nom.textContent = produit.nom;
    description.textContent = produit.description;
    prix.textContent = `Prix : ${produit.prix} €`;

    btnAjouter.textContent = 'Ajouter au panier';
    btnAjouter.classList.add('btn-ajout-panier-favoris');
    btnAjouter.dataset.id = produit._id;

    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.classList.add('btn-supprimer-panier-favoris');
    btnSupprimer.onclick = () => supprimerFavoris(produit, card, messageVide);

    divInfoCard.appendChild(image);

    divTextCard.appendChild(nom);
    divTextCard.appendChild(description);
    divTextCard.appendChild(prix);

    divBtn.appendChild(btnAjouter);
    divBtn.appendChild(btnSupprimer);

    divInfoCard.appendChild(divTextCard);
    card.appendChild(divInfoCard);
    card.appendChild(divBtn);

    container.appendChild(card);
  });
}

// Supprime un produit des favoris
function supprimerFavoris(produit, card, messageVide) {
  let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  favoris = favoris.filter((fav) => fav._id !== produit._id);
  localStorage.setItem('favoris', JSON.stringify(favoris));

  card.remove();
  updateFavorisCount();

  if (favoris.length === 0) {
    messageVide.style.display = 'block';
  }
}
