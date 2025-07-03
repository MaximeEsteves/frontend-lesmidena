// produitDetail.js

import {
  getAllProducts,
  getProductByRef,
  API_BASE,
} from '../../api/apiClient.js';
import {
  initPageListeFavoris,
  initPageListePanier,
  mettreAJourBoutonsPanier,
  updateFavorisCount,
} from '../../global/addFavorisPanier.js';

const baseURL = API_BASE + '/';

// Variables globales
let produit, allProducts;
let currentImageIndex = 0;

// Données de partage
let shareData = {
  title: '',
  text: '',
  url: window.location.href,
};

// Met à jour l'image principale et la modale fullscreen
function updateMainImage(index) {
  currentImageIndex = index;
  const mainImage = document.getElementById('image-principale');
  const fullscreenImage = document.getElementById('fullscreen-image');
  if (!produit.image || !mainImage || !fullscreenImage) return;
  mainImage.src = baseURL + produit.image[index];
  fullscreenImage.src = baseURL + produit.image[index];
  document.querySelectorAll('.thumbnail').forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

// Initialisation de la galerie d'images (thumbnails, prev/next)
function initImageGallery() {
  const thumbsContainer = document.querySelector('.thumbs');
  if (!thumbsContainer || !produit.image) return;
  currentImageIndex = 0;
  thumbsContainer.innerHTML = '';
  // Si pas d'images, on vide ou on met un placeholder
  if (!Array.isArray(produit.image) || produit.image.length === 0) {
    const mainImage = document.getElementById('image-principale');
    if (mainImage) mainImage.src = '';
    return;
  }

  // Mettre à jour la première image
  updateMainImage(0);

  // Créer les thumbnails
  produit.image.forEach((src, idx) => {
    const thumb = document.createElement('img');
    thumb.src = baseURL + src;
    thumb.classList.add('thumbnail');
    if (idx === 0) thumb.classList.add('active');
    thumb.addEventListener('click', () => updateMainImage(idx));
    thumbsContainer.appendChild(thumb);
  });

  // Prev / Next boutons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (!produit.image || produit.image.length === 0) return;
      updateMainImage(
        (currentImageIndex - 1 + produit.image.length) % produit.image.length
      );
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (!produit.image || produit.image.length === 0) return;
      updateMainImage((currentImageIndex + 1) % produit.image.length);
    };
  }
}

// Initialisation de la modale plein écran (ouverture, fermeture, zoom)
function initFullScreenModal() {
  const mainImage = document.getElementById('image-principale');
  const fullscreenModal = document.getElementById('fullscreen-modal');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const closeFullscreenBtn = document.getElementById('close-fullscreen');
  const fullscreenPrev = document.getElementById('fullscreen-prev');
  const fullscreenNext = document.getElementById('fullscreen-next');
  const modalImageContainer = document.querySelector('.contenair-image-modal');

  if (mainImage && fullscreenModal) {
    mainImage.onclick = () => fullscreenModal.classList.add('show');
  }
  if (closeFullscreenBtn && fullscreenModal) {
    closeFullscreenBtn.onclick = () => fullscreenModal.classList.remove('show');
  }
  if (fullscreenModal) {
    fullscreenModal.onclick = (e) => {
      if (e.target === fullscreenModal)
        fullscreenModal.classList.remove('show');
    };
  }
  // Échap pour fermer
  document.onkeydown = (e) => {
    if (e.key === 'Escape' && fullscreenModal) {
      fullscreenModal.classList.remove('show');
    }
  };
  if (fullscreenPrev) {
    fullscreenPrev.onclick = () => {
      if (!produit.image || produit.image.length === 0) return;
      updateMainImage(
        (currentImageIndex - 1 + produit.image.length) % produit.image.length
      );
    };
  }
  if (fullscreenNext) {
    fullscreenNext.onclick = () => {
      if (!produit.image || produit.image.length === 0) return;
      updateMainImage((currentImageIndex + 1) % produit.image.length);
    };
  }
  if (modalImageContainer && fullscreenImage) {
    modalImageContainer.style.overflow = 'hidden';
    fullscreenImage.style.transition = 'transform 0.2s ease-out';
    fullscreenImage.style.transformOrigin = 'center center';
    modalImageContainer.onmousemove = (e) => {
      const rect = fullscreenImage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      fullscreenImage.style.transformOrigin = `${x}% ${y}%`;
      fullscreenImage.style.transform = 'scale(2)';
    };
    modalImageContainer.onmouseleave = () => {
      fullscreenImage.style.transform = 'scale(1)';
    };
  }
}

// Affichage des détails du produit courant dans le DOM
function displayProductDetails() {
  // Bouton "Ajouter au panier"
  const boutonAcheter = document.querySelector('.btn-ajout-panier');
  if (boutonAcheter) boutonAcheter.dataset.id = produit._id;
  // Bouton favoris
  const boutonFavoris = document.querySelector('.btn-fav-article');
  if (boutonFavoris) boutonFavoris.dataset.id = produit._id;
  // Catégorie / titre
  const titreBoutique = document.querySelector('.titre-produit-boutique');
  if (titreBoutique) titreBoutique.textContent = produit.categorie;
  const titreProduit = document.querySelector('.titre-produit');
  if (titreProduit)
    titreProduit.textContent = `${produit.categorie} - ${produit.nom}`;
  // Prix
  const prixEl = document.getElementById('prix-produit');
  if (prixEl) prixEl.textContent = `${produit.prix} €`;
  // Référence
  const refEl = document.getElementById('ref-produit');
  if (refEl) refEl.textContent = `Référence : ${produit.reference}`;
  // Description
  const titreDesc = document.getElementById('titre-produit-description');
  if (titreDesc) titreDesc.textContent = produit.titreDescription;
  const descEl = document.getElementById('desc-produit');
  if (descEl) descEl.innerHTML = produit.descriptionComplete;
  // Matériaux
  const matEl = document.getElementById('materiaux-produit');
  if (matEl) matEl.textContent = produit.materiaux;
  // Image de couverture
  const coverImg = document.getElementById('image-couverture-boutique');
  if (coverImg && produit.imageCouverture) {
    coverImg.src = baseURL + produit.imageCouverture;
  }
  // Mettre à jour shareData
  shareData.title = produit.nom;
  shareData.text = produit.descriptionComplete.slice(0, 100) + '…';
  shareData.url = window.location.href;
}

// Sélecteur de quantité (stock)
function initStockSelector() {
  const select = document.getElementById('stock-produit');
  if (!select) return;
  select.innerHTML = '';
  for (let i = 1; i <= produit.stock; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    select.appendChild(opt);
  }
}

// Gestion des avis
const formAvis = document.getElementById('form-avis');
const messageAvis = document.getElementById('avis-message');
const listeAvisBloc = document.getElementById('liste-avis');

function handleReviewSubmit(e) {
  e.preventDefault();
  const nom = document.getElementById('avis-nom').value.trim();
  const note = document.getElementById('avis-note').value;
  const com = document.getElementById('avis-commentaire').value.trim();
  if (!nom || !note || !com) return;
  const key = `avis_${produit.reference}`;
  let avisList = JSON.parse(localStorage.getItem(key)) || [];
  const nouvel = {
    nom,
    note,
    commentaire: com,
    date: new Date().toISOString(),
  };
  avisList.unshift(nouvel);
  localStorage.setItem(key, JSON.stringify(avisList));
  renderAvis(avisList);
  formAvis.reset();
  if (messageAvis) {
    messageAvis.textContent = 'Merci pour votre avis !';
    setTimeout(() => (messageAvis.textContent = ''), 3000);
  }
}

function initReviewForm() {
  if (!formAvis) return;
  formAvis.removeEventListener('submit', handleReviewSubmit);
  const key = `avis_${produit.reference}`;
  let avisList = JSON.parse(localStorage.getItem(key)) || [];
  renderAvis(avisList);
  formAvis.addEventListener('submit', handleReviewSubmit);
}

function renderAvis(list) {
  if (!listeAvisBloc) return;
  listeAvisBloc.innerHTML = '';
  if (list.length === 0) {
    listeAvisBloc.innerHTML = '<p>Aucun avis pour le moment.</p>';
    return;
  }
  list.forEach((av) => {
    const div = document.createElement('div');
    div.classList.add('avis');
    div.innerHTML = `
      <h4>${av.nom} <span class="note">${'★'.repeat(av.note)}${'☆'.repeat(
      5 - av.note
    )}</span></h4>
      <p>${av.commentaire}</p>
      <small>${new Date(av.date).toLocaleDateString()}</small>
    `;
    listeAvisBloc.appendChild(div);
  });
}

// Produits similaires même catégorie (affichage des petites cartes à cotés de la carte principale)
function produitSupplementaire() {
  const titreProduitSupp = document.getElementById('titre-produit-similaire');
  if (!titreProduitSupp) return;
  titreProduitSupp.innerHTML = '';
  const similaires = allProducts
    .filter(
      (p) =>
        p.categorie === produit.categorie && p.reference !== produit.reference
    )
    .slice(0, 99);
  similaires.forEach((p) => {
    const carte = document.createElement('div');
    carte.classList.add('carte-produit');
    carte.innerHTML = `
      <img src="${baseURL + p.image[0]}" alt="${p.nom}">
      <div class="nom-produit">${p.nom}</div>
    `;
    carte.addEventListener('click', (e) => {
      e.preventDefault();
      loadProduct(p.reference);
    });
    titreProduitSupp.appendChild(carte);
  });
}

// Produits d'autres catégories (en dessous de l'article principal - 5 cartes aléatoire d'un produit)
function produitSupplementaireAutres() {
  const titreAutres = document.getElementById('titre-produit-similaire-autres');
  if (!titreAutres) return;

  titreAutres.innerHTML = '';
  const titre = document.createElement('h2');
  titre.textContent =
    "Découvre d'autres mignonneries qui vont te faire craquer !";
  const cont = document.createElement('div');
  cont.classList.add('produits-similaire-container-autres');

  // Étape 1 : filtrer les produits hors de la catégorie actuelle
  const produitsAutres = allProducts.filter(
    (p) => p.categorie !== produit.categorie
  );

  // Étape 2 : regrouper par catégorie
  const produitsParCategorie = {};
  produitsAutres.forEach((p) => {
    if (!produitsParCategorie[p.categorie]) {
      produitsParCategorie[p.categorie] = [];
    }
    produitsParCategorie[p.categorie].push(p);
  });

  // Étape 3 : choisir un produit aléatoire par catégorie
  const produitsSelectionnes = Object.values(produitsParCategorie)
    .map((produits) => produits[Math.floor(Math.random() * produits.length)])
    .slice(0, 5); // max 5 produits

  // Étape 4 : affichage
  produitsSelectionnes.forEach((p) => {
    const c = document.createElement('div');
    c.classList.add('carte-produit-autres');
    c.innerHTML = `
      <img src="${baseURL + p.image[0]}" alt="${p.categorie} - ${p.nom}">
      <h3>${p.nom}</h3>
      <p>${p.prix.toFixed(2)} €</p>
    `;
    c.addEventListener('click', (e) => {
      e.preventDefault();
      loadProduct(p.reference);
    });
    cont.appendChild(c);
  });

  titreAutres.appendChild(titre);
  titreAutres.appendChild(cont);
}

// Chargement dynamique d'un produit par référence sans rechargement de page
async function loadProduct(ref, addToHistory = true) {
  try {
    const newProduit = await getProductByRef(ref);
    if (!newProduit) {
      document.querySelector('main').innerHTML = '<p>Produit non trouvé.</p>';
      return;
    }
    produit = newProduit;
    if (addToHistory) {
      history.pushState({ ref }, '', `/produit/${encodeURIComponent(ref)}`);
    }
    // Scroll en haut
    window.scrollTo(0, 0);

    // Mettre à jour le DOM
    displayProductDetails();
    initImageGallery();
    initFullScreenModal();
    initStockSelector();
    initReviewForm();
    produitSupplementaire();
    produitSupplementaireAutres();
    initPageListeFavoris(allProducts);
    initPageListePanier(allProducts);
    mettreAJourBoutonsPanier();
    updateFavorisCount();
    shareData.url = window.location.href;
  } catch (err) {
    console.error('Erreur loadProduct :', err);
    document.querySelector('main').innerHTML =
      '<p>Erreur lors du chargement du produit.</p>';
  }
}

// Gérer le bouton Retour/Avant du navigateur
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.ref) {
    loadProduct(event.state.ref, false);
  }
});

// Partage
const btnPartager = document.getElementById('btn-partager');

// Initialisation au chargement de la page
async function init() {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  try {
    allProducts = await getAllProducts();
    // Extraire la référence de l'URL
    const ref = window.location.pathname.split('/').pop();
    await loadProduct(ref, false);

    if (btnPartager) {
      btnPartager.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch {}
        } else alert('Partage non supporté.');
      });
    }

    // Initialisation favoris/panier
    initPageListeFavoris(allProducts);
    initPageListePanier(allProducts);
    mettreAJourBoutonsPanier();
    updateFavorisCount();
  } catch (err) {
    console.error('Erreur init page produit :', err);
    document.querySelector('main').innerHTML =
      '<p>Erreur lors du chargement.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
