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

const baseURL = API_BASE.endsWith('/') ? API_BASE : API_BASE + '/';

// Variables globales
let produit = null;
let allProducts = [];
let currentImageIndex = 0;
let shareData = { title: '', text: '', url: window.location.href };
let swiperInstance = null;

// ---- utilitaires ----
function buildImageUrl(src) {
  if (!src) return '';
  // Déjà une URL absolue
  if (/^https?:\/\//i.test(src)) return src;
  // commence par slash => API_BASE + src
  if (src.startsWith('/')) return API_BASE + src;
  // sinon considère comme chemin relatif côté uploads (baseURL + src)
  return baseURL + src;
}

// ---- Images / galerie ----
function updateMainImage(index) {
  currentImageIndex = index;

  // Si swiper est actif, laisse swiper gérer l'affichage
  if (swiperInstance) {
    try {
      swiperInstance.slideTo(index, 300);
    } catch (e) {
      /* ignore */
    }
  }

  const mainImage = document.getElementById('image-principale');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const altText = `${produit?.categorie || ''} ${produit?.nom || ''} ${
    produit?.reference || ''
  }`.trim();

  if (mainImage) mainImage.alt = altText;
  if (!produit || !Array.isArray(produit.image) || produit.image.length === 0) {
    if (mainImage) mainImage.src = '';
    if (fullscreenImage) fullscreenImage.src = '';
    return;
  }

  const src = produit.image[index] || produit.image[0];
  const url = buildImageUrl(src);

  if (!swiperInstance && mainImage) mainImage.src = url;
  if (fullscreenImage) fullscreenImage.src = url;

  document.querySelectorAll('.thumbnail').forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });
}

// ---- initImageGallery ----
function initImageGallery() {
  const thumbsContainer =
    document.getElementById('thumbs-container') ||
    document.querySelector('.thumbs');
  const imageWrapper = document.querySelector('.image-wrapper');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Destroy previous swiper if exists
  if (swiperInstance && typeof swiperInstance.destroy === 'function') {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }

  if (!thumbsContainer || !imageWrapper) return;
  thumbsContainer.innerHTML = '';

  if (!produit || !Array.isArray(produit.image) || produit.image.length === 0) {
    const mainImage = document.getElementById('image-principale');
    if (mainImage) mainImage.src = '';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  const multipleImages = produit.image.length > 1;
  if (prevBtn) prevBtn.style.display = multipleImages ? '' : 'none';
  if (nextBtn) nextBtn.style.display = multipleImages ? '' : 'none';

  // DETECTION VIA MEDIA QUERY: swiper active if viewport <= 1024px
  const useSwiper =
    window.matchMedia('(max-width: 1024px)').matches && multipleImages;

  if (useSwiper) {
    // build Swiper structure in imageWrapper
    imageWrapper.innerHTML = `
      <div class="swiper produit-swiper">
        <div class="swiper-wrapper">
          ${produit.image
            .map(
              (src) =>
                `<div class="swiper-slide"><img class="slide-img" src="${buildImageUrl(
                  src
                )}" alt=""></div>`
            )
            .join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    `;

    // init Swiper (assumes Swiper is loaded globally)
    swiperInstance = new Swiper('.produit-swiper', {
      spaceBetween: 10,
      slidesPerView: 1,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '#next-btn', prevEl: '#prev-btn' },
      loop: false,
      grabCursor: true,
      touchRatio: 1,
      lazy: { loadPrevNext: true },
    });

    if (swiperInstance) {
      // update currentImageIndex automatiquement (déjà fait) and sync fullscreen if open
      swiperInstance.on('slideChange', () => {
        currentImageIndex = swiperInstance.activeIndex;
        // mettre à jour les miniatures actives
        document
          .querySelectorAll('.thumbnail')
          .forEach((img, i) =>
            img.classList.toggle('active', i === currentImageIndex)
          );
        // si la modale est ouverte, actualiser l'image fullscreen
        const fullscreenModal = document.getElementById('fullscreen-modal');
        const fullscreenImage = document.getElementById('fullscreen-image');
        if (
          fullscreenModal &&
          fullscreenModal.classList.contains('show') &&
          fullscreenImage
        ) {
          fullscreenImage.src = buildImageUrl(produit.image[currentImageIndex]);
        }
      });

      // Attacher le clic sur chaque image Swiper pour ouvrir la modale et régler l'index
      const slideImgs = document.querySelectorAll('.produit-swiper .slide-img');
      slideImgs.forEach((img, idx) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
          currentImageIndex = idx;
          // synchroniser swiper (au cas où)
          try {
            swiperInstance.slideTo(idx, 0);
          } catch (e) {}
          // ouvrir la modale et mettre l'image fullscreen
          const fullscreenModal = document.getElementById('fullscreen-modal');
          const fullscreenImage = document.getElementById('fullscreen-image');
          if (fullscreenImage)
            fullscreenImage.src = buildImageUrl(
              produit.image[currentImageIndex]
            );
          if (fullscreenModal) fullscreenModal.classList.add('show');
        });
      });
    }

    // create thumbnails
    produit.image.forEach((src, idx) => {
      const thumb = document.createElement('img');
      thumb.src = buildImageUrl(src);
      thumb.alt = `${produit.categorie || ''} ${produit.nom || ''} ${
        produit.reference || ''
      }`.trim();
      thumb.classList.add('thumbnail');
      thumb.loading = 'lazy';
      thumb.width = 80;
      thumb.height = 80;
      thumb.addEventListener('click', () => swiperInstance.slideTo(idx));
      thumbsContainer.appendChild(thumb);
    });

    swiperInstance.slideTo(0);
  } else {
    // desktop behavior (image + thumbnails)
    // ensure imageWrapper contains the main img + nav buttons if needed
    if (!imageWrapper.querySelector('#image-principale')) {
      imageWrapper.innerHTML = `
        <button id="next-btn" class="nav-btn" aria-label="Image suivante"><i class="fa-solid fa-chevron-right"></i></button>
        <img id="image-principale" src="" alt="">
        <button id="prev-btn" class="nav-btn" aria-label="Image précédente"><i class="fa-solid fa-chevron-left"></i></button>
      `;
    }

    produit.image.forEach((src, idx) => {
      const thumb = document.createElement('img');
      thumb.src = buildImageUrl(src);
      thumb.alt = `${produit.categorie || ''} ${produit.nom || ''} ${
        produit.reference || ''
      }`.trim();
      thumb.classList.add('thumbnail');
      thumb.loading = 'lazy';
      thumb.width = 80;
      thumb.height = 80;
      if (idx === 0) thumb.classList.add('active');
      thumb.addEventListener('click', () => updateMainImage(idx));
      thumbsContainer.appendChild(thumb);
    });

    // rebind prev/next
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    if (prev) {
      prev.style.display = multipleImages ? '' : 'none';
      prev.onclick = () => {
        if (!produit?.image?.length) return;
        updateMainImage(
          (currentImageIndex - 1 + produit.image.length) % produit.image.length
        );
      };
    }
    if (next) {
      next.style.display = multipleImages ? '' : 'none';
      next.onclick = () => {
        if (!produit?.image?.length) return;
        updateMainImage((currentImageIndex + 1) % produit.image.length);
      };
    }

    updateMainImage(0);
  }
}

// ---- initFullScreenModal ----
function initFullScreenModal() {
  const mainImage = document.getElementById('image-principale');
  const fullscreenModal = document.getElementById('fullscreen-modal');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const closeFullscreenBtn = document.getElementById('close-fullscreen');
  const fullscreenPrev = document.getElementById('fullscreen-prev');
  const fullscreenNext = document.getElementById('fullscreen-next');
  const modalImageContainer = document.querySelector('.contenair-image-modal');

  if (mainImage && fullscreenModal)
    mainImage.onclick = () => fullscreenModal.classList.add('show');
  if (closeFullscreenBtn && fullscreenModal)
    closeFullscreenBtn.onclick = () => fullscreenModal.classList.remove('show');

  if (fullscreenModal) {
    fullscreenModal.onclick = (e) => {
      if (e.target === fullscreenModal)
        fullscreenModal.classList.remove('show');
    };
  }

  document.onkeydown = (e) => {
    if (e.key === 'Escape' && fullscreenModal)
      fullscreenModal.classList.remove('show');
  };

  const multipleImages =
    produit && Array.isArray(produit.image) && produit.image.length > 1;
  if (fullscreenPrev)
    fullscreenPrev.style.display = multipleImages ? '' : 'none';
  if (fullscreenNext)
    fullscreenNext.style.display = multipleImages ? '' : 'none';

  if (fullscreenPrev)
    fullscreenPrev.onclick = () => {
      if (!produit?.image?.length) return;
      updateMainImage(
        (currentImageIndex - 1 + produit.image.length) % produit.image.length
      );
    };
  if (fullscreenNext)
    fullscreenNext.onclick = () => {
      if (!produit?.image?.length) return;
      updateMainImage((currentImageIndex + 1) % produit.image.length);
    };

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

// ---- affichage détails ----
function displayProductDetails() {
  if (!produit) return;
  const boutonAcheter = document.querySelector('.btn-ajout-panier');
  if (boutonAcheter) boutonAcheter.dataset.id = produit._id || '';

  const boutonFavoris = document.querySelector('.btn-fav-article');
  if (boutonFavoris) boutonFavoris.dataset.id = produit._id || '';

  const titreBoutique = document.querySelector('.titre-produit-boutique');
  if (titreBoutique) titreBoutique.textContent = produit.categorie || '';

  const titreProduit = document.querySelector('.titre-produit');
  if (titreProduit)
    titreProduit.textContent = `${produit.categorie || ''} - ${
      produit.nom || ''
    }`;

  const prixEl = document.getElementById('prix-produit');
  if (prixEl)
    prixEl.textContent = produit.prix !== undefined ? `${produit.prix} €` : '';

  const refEl = document.getElementById('ref-produit');
  if (refEl)
    refEl.textContent = produit.reference
      ? `Référence : ${produit.reference}`
      : '';

  const titreDesc = document.getElementById('titre-produit-description');
  if (titreDesc) titreDesc.textContent = produit.titreDescription || '';

  const descEl = document.getElementById('desc-produit');
  if (descEl) descEl.innerHTML = produit.descriptionComplete || '';

  const matEl = document.getElementById('materiaux-produit');
  if (matEl) matEl.textContent = produit.materiaux || '';

  const coverImg = document.getElementById('image-couverture-boutique');
  if (coverImg && produit.imageCouverture) {
    coverImg.src = buildImageUrl(produit.imageCouverture);
  }

  // shareData
  shareData.title = produit.nom || '';
  shareData.text = (produit.descriptionComplete || '').slice(0, 120) + '…';
  shareData.url = window.location.href;
}

// ---- stock selector ----
function initStockSelector() {
  const select = document.getElementById('stock-produit');
  if (!select) return;
  select.innerHTML = '';
  const stock = Number(produit?.stock) || 1;
  for (let i = 1; i <= Math.max(1, stock); i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    select.appendChild(opt);
  }
}

// ---- avis ----
function renderAvis(list, targetEl) {
  if (!targetEl) return;
  targetEl.innerHTML = '';
  if (!list || list.length === 0) {
    targetEl.innerHTML = '<p>Aucun avis pour le moment.</p>';
    return;
  }
  list.forEach((av) => {
    const div = document.createElement('div');
    div.classList.add('avis');
    const note = Number(av.note) || 0;
    div.innerHTML = `
      <h4>${av.nom} <span class="note">${'★'.repeat(note)}${'☆'.repeat(
      5 - note
    )}</span></h4>
      <p>${av.commentaire}</p>
      <small>${new Date(av.date).toLocaleDateString()}</small>
    `;
    targetEl.appendChild(div);
  });
}

function initReviewForm() {
  const formAvis = document.getElementById('form-avis');
  const messageAvis = document.getElementById('avis-message');
  const listeAvisBloc = document.getElementById('liste-avis');

  if (!formAvis) return;

  const key = `avis_${produit?.reference || 'unknown'}`;
  let avisList = JSON.parse(localStorage.getItem(key)) || [];
  renderAvis(avisList, listeAvisBloc);

  formAvis.removeEventListener('submit', handleReviewSubmit); // safe: no-op si pas attaché
  formAvis.addEventListener('submit', handleReviewSubmit);

  function handleReviewSubmit(e) {
    e.preventDefault();
    const nom = document.getElementById('avis-nom').value.trim();
    const note = document.getElementById('avis-note').value;
    const com = document.getElementById('avis-commentaire').value.trim();
    if (!nom || !note || !com) return;
    const nouvel = {
      nom,
      note,
      commentaire: com,
      date: new Date().toISOString(),
    };
    avisList.unshift(nouvel);
    localStorage.setItem(key, JSON.stringify(avisList));
    renderAvis(avisList, listeAvisBloc);
    formAvis.reset();
    if (messageAvis) {
      messageAvis.textContent = 'Merci pour votre avis !';
      setTimeout(() => (messageAvis.textContent = ''), 3000);
    }
  }
}

// ---- produits similaires ----
function produitSupplementaire() {
  const titreProduitSupp = document.getElementById('titre-produit-similaire');
  if (!titreProduitSupp || !allProducts?.length || !produit) return;
  titreProduitSupp.innerHTML = '';
  const similaires = allProducts
    .filter(
      (p) =>
        p.categorie === produit.categorie && p.reference !== produit.reference
    )
    .slice(0, 8);
  similaires.forEach((p) => {
    const carte = document.createElement('div');
    carte.classList.add('carte-produit');
    const imgSrc = buildImageUrl(p.image?.[0] || '');
    carte.innerHTML = `
      <img src="${imgSrc}" alt="Image ${
      produit.categorie + ' ' + produit.nom + ' ' + produit.reference
    }">
      <div class="nom-produit">${p.nom}</div>
    `;
    carte.addEventListener('click', (e) => {
      e.preventDefault();
      loadProduct(p.reference);
    });
    titreProduitSupp.appendChild(carte);
  });
}

function produitSupplementaireAutres() {
  const titreAutres = document.getElementById('titre-produit-similaire-autres');
  if (!titreAutres || !allProducts?.length || !produit) return;
  titreAutres.innerHTML = '';
  const titre = document.createElement('h2');
  titre.textContent =
    "Découvre d'autres mignonneries qui vont te faire craquer !";
  const cont = document.createElement('div');
  cont.classList.add('produits-similaire-container-autres');

  const produitsAutres = allProducts.filter(
    (p) => p.categorie !== produit.categorie
  );
  const produitsParCategorie = {};
  produitsAutres.forEach((p) => {
    if (!produitsParCategorie[p.categorie])
      produitsParCategorie[p.categorie] = [];
    produitsParCategorie[p.categorie].push(p);
  });

  const produitsSelectionnes = Object.values(produitsParCategorie)
    .map((arr) => arr[Math.floor(Math.random() * arr.length)])
    .slice(0, 5);

  produitsSelectionnes.forEach((p) => {
    const c = document.createElement('div');
    c.classList.add('carte-produit-autres');
    c.innerHTML = `
      <img src="${buildImageUrl(p.image?.[0] || '')}" alt="${p.categorie} - ${
      p.nom
    }">
      <h3>${p.nom}</h3>
      <p>${(p.prix || 0).toFixed(2)} €</p>
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

// ---- loadProduct (dynamique, safe) ----
async function loadProduct(ref, addToHistory = true) {
  if (!ref) {
    console.warn('loadProduct appelé sans ref');
    return;
  }
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
    window.scrollTo(0, 0);

    // Mise à jour DOM / modules
    displayProductDetails();
    initImageGallery();
    initFullScreenModal();
    initStockSelector();
    initReviewForm();
    produitSupplementaire();
    produitSupplementaireAutres();
    // Favoris / panier
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
function updateMetas(prod) {
  if (!prod) return;
  try {
    document.title = `${prod.categorie || ''} ${
      prod.nom || ''
    } – Mignonneries de Nathalie`;
    const desc =
      prod.description ||
      (prod.descriptionComplete && prod.descriptionComplete.slice(0, 160)) ||
      '';
    const img = buildImageUrl(
      prod.imageCouverture || prod.image?.[0] || '/assets/images/preview.webp'
    );

    const setIf = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setIf('meta[name="description"]', 'content', desc);
    setIf(
      'meta[property="og:title"]',
      'content',
      `${prod.categorie || ''} ${prod.nom || ''} – Mignonneries de Nathalie`
    );
    setIf('meta[property="og:description"]', 'content', desc);
    setIf('meta[property="og:image"]', 'content', img);
    setIf(
      'meta[property="og:url"]',
      'content',
      prod.url || window.location.href
    );
    setIf(
      'meta[name="twitter:title"]',
      'content',
      `${prod.categorie || ''} ${prod.nom || ''} – Mignonneries de Nathalie`
    );
    setIf('meta[name="twitter:description"]', 'content', desc);
    setIf('meta[name="twitter:image"]', 'content', img);
    setIf(
      'link[rel="preload"]',
      'href',
      buildImageUrl(
        prod.imageCouverture || prod.image?.[0] || '/assets/images/preview.webp'
      )
    );
  } catch (e) {
    console.warn('updateMetas failed', e);
  }
}

// Gestion popstate
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.ref) {
    loadProduct(event.state.ref, false);
  }
});

// ---- init ----
async function init() {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Récupérer les éléments qui nécessitent d'exister
  const btnPartager = document.getElementById('btn-partager');

  try {
    allProducts = await getAllProducts();

    // Extraire la référence : supporte /produit/REF ou /produit.html?ref=REF
    let ref = null;
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts.pop() || pathParts.pop(); // robust
    if (lastPart && lastPart !== 'produit' && lastPart !== 'produit.html') {
      ref = decodeURIComponent(lastPart);
    }
    // fallback query param ?ref=...
    const params = new URLSearchParams(window.location.search);
    if (!ref && params.get('ref')) ref = params.get('ref');

    if (!ref) {
      console.warn("Aucune référence trouvée dans l'URL");
      document.querySelector('main').innerHTML =
        "<p>Référence du produit manquante dans l'URL.</p>";
      return;
    }

    await loadProduct(ref, false);

    if (btnPartager) {
      btnPartager.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (e) {
            // utilisateur annule : ignore
          }
        } else alert('Partage non supporté.');
      });
    }

    // Initialisation favoris/panier (sécurisé)
    initPageListeFavoris(allProducts);
    initPageListePanier(allProducts);
    mettreAJourBoutonsPanier();
    updateFavorisCount();
  } catch (err) {
    console.error('Erreur init page produit :', err);
    document.querySelector('main').innerHTML =
      '<p>Erreur lors du chargement.</p>';
  }
  updateMetas(produit);
}

document.addEventListener('DOMContentLoaded', init);

export { loadProduct };
