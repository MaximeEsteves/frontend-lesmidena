import {
  getAllProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  avis,
  deleteAvis,
  validateAvis,
  API_BASE,
} from './api/apiClient.js';
import {
  initPageListeFavoris,
  updateFavorisCount,
  initPageListePanier,
  mettreAJourBoutonsPanier,
} from './global/addFavorisPanier.js';
import { initCustomSwiper } from '../global/initCustomSwiper.js';
const baseURL = API_BASE + '/';
async function init() {
  try {
    const productsData = await getAllProducts();
    const isConnected = !!localStorage.getItem('token');

    if (isConnected) {
      displayConnectedView(productsData);
    } else {
      displayDisconnectedView(productsData);
    }

    mettreAJourBoutonsPanier();
    updateFavorisCount();
  } catch (error) {
    console.error('Erreur lors du chargement des produits :', error);
  }
}
function enterEditModeUI() {
  const userOpen = document.getElementById('user-open');
  if (userOpen) {
    userOpen.textContent = 'log out';
    userOpen.style.fontWeight = '700';
  }
  if (!document.querySelector('.mode-edition')) {
    const body = document.body;
    const modeEdition = document.createElement('div');
    modeEdition.classList.add('mode-edition');
    modeEdition.innerHTML =
      '<i class="fa-solid fa-pen-to-square"></i><p>Mode édition</p>';
    body.style.marginTop = '59px';
    body.appendChild(modeEdition);
  }
}

// Ajoute le bouton "Ajouter un produit" dans la section titre
function addAddProductButton() {
  const h2 = document.querySelector('.titre-projet');
  if (h2 && !h2.querySelector('.div-modification')) {
    const btnAdd = document.createElement('button');
    const btnAvis = document.createElement('button');
    btnAvis.classList.add('div-avis');
    btnAvis.innerHTML =
      '<i class="fa-solid fa-pen-to-square"></i><span>Voir les avis</span>';
    btnAvis.addEventListener('click', () => verifAvis());
    btnAdd.classList.add('div-modification');
    btnAdd.innerHTML =
      '<i class="fa-solid fa-pen-to-square"></i><span>Ajouter un produit</span>';
    btnAdd.addEventListener('click', () => initProductModal('add'));
    h2.appendChild(btnAdd);
    h2.appendChild(btnAvis);
  }
}
// on transmet isConnected à totalProduits !
function displayConnectedView(productsData) {
  addAddProductButton();
  totalProduits(productsData, true);
  enterEditModeUI();
}

function displayDisconnectedView(productsData) {
  projets(productsData);
  filtres(productsData);
  initPageListeFavoris(productsData);
  initPageListePanier(productsData);
}

// Appel depuis init : totalProduits(productsData, isConnected);
function totalProduits(worksData, isConnected = false) {
  const portfolio = document.getElementById('portfolio');
  portfolio.classList.add('gallery');
  portfolio.innerHTML = '';

  // Observer pour lazy loading
  const imgObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );

  worksData.forEach((produit) => {
    if (!produit._id || produit.stock <= 0) return;

    // Construction de la carte produit
    const figure = createProductFigure(produit, imgObserver);

    // Actions admin si connecté
    if (isConnected) {
      addAdminActions(figure, produit);
    }

    portfolio.appendChild(figure);
  });
}

function createProductFigure(produit, imgObserver) {
  const figure = document.createElement('figure');
  figure.dataset.id = produit._id;

  // Image + lazy-loading
  const divBg = document.createElement('div');
  divBg.classList.add('div-bg-card');
  const img = document.createElement('img');
  const raw = Array.isArray(produit.image)
    ? produit.image[0]
    : produit.image || '';
  img.dataset.src = baseURL + raw;
  img.alt = `image de ${produit.nom}`;
  img.classList.add('img-carousel');
  imgObserver.observe(img);
  divBg.appendChild(img);

  // Titre + prix
  const divPrix = document.createElement('div');
  divPrix.classList.add('div-titre-prix');
  divPrix.innerHTML = `<h3>${produit.nom}</h3><span>${produit.prix}€</span>`;

  // Description
  const description = document.createElement('p');
  description.classList.add('description-carte');
  description.textContent = produit.description;

  // Bouton favoris
  const btnFav = document.createElement('button');
  btnFav.classList.add('btn-fav-article');
  btnFav.dataset.id = produit._id;
  btnFav.innerHTML = '<i class="fa-regular fa-heart"></i>';
  btnFav.ariaLabel = 'Ajouter aux favoris';

  // Clic sur l’image
  img.addEventListener('click', () => {
    window.location.href = `/produit/${produit.reference}`;
  });

  figure.append(divBg, divPrix, description, btnFav);
  return figure;
}

function addAdminActions(figure, produit) {
  // Supprimer
  const btnSupprimer = document.createElement('button');
  btnSupprimer.classList.add('icone-supprimer');
  btnSupprimer.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  btnSupprimer.addEventListener('click', () => deletePhoto(figure));

  // Modifier
  const btnModifier = document.createElement('button');
  btnModifier.classList.add('icone-modifier');
  btnModifier.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  btnModifier.addEventListener('click', () =>
    initProductModal('edit', produit)
  );

  figure.append(btnSupprimer, btnModifier);
}

// Fonction d'affichage des filtres (adaptée pour recevoir les données)
function filtres(worksData) {
  // Si l'utilisateur est connecté, on ne montre pas les filtres
  if (localStorage.getItem('token')) {
    return;
  }
  const titre = document.querySelector('.titre-projet');

  // Si un ancien conteneur existe, on le supprime
  let oldZoneBtn = document.querySelector('.zone-btn');
  if (oldZoneBtn) oldZoneBtn.remove();

  // Si un ancien bouton toggle existe, on le supprime aussi
  let oldToggle = document.querySelector('.btn-toggle-filtres');
  if (oldToggle) oldToggle.remove();

  // Création du bouton toggle
  const btnToggle = document.createElement('button');
  btnToggle.type = 'button';
  btnToggle.innerText = 'Filtres';
  btnToggle.classList.add('btn-toggle-filtres');
  btnToggle.ariaLabel = 'Afficher les filtres';
  // État initial non ouvert
  btnToggle.classList.remove('open');

  // Création du conteneur des boutons de catégories
  const zoneBtn = document.createElement('div');
  zoneBtn.classList.add('zone-btn');
  // Ne pas ajouter la classe 'open' => est caché

  // Récupérer les catégories uniques
  const categoriesSet = new Set();
  worksData.forEach((article) => {
    categoriesSet.add(article.categorie);
  });

  // Bouton "Tous"
  const btnTous = document.createElement('button');
  btnTous.type = 'button';
  btnTous.innerText = 'Tous';
  btnTous.ariaLabel = 'Afficher tous les articles';
  btnTous.classList.add('btn-categorie', 'click-btn');
  btnTous.addEventListener('click', function () {
    // Retirer l'état click de tous, ajouter sur celui-ci
    document
      .querySelectorAll('.btn-categorie')
      .forEach((b) => b.classList.remove('click-btn'));
    document.getElementById('portfolio').innerHTML = '';
    projets(worksData);
    mettreAJourBoutonsPanier();
    btnTous.classList.add('click-btn');
  });
  zoneBtn.appendChild(btnTous);

  // Création dynamique des boutons de filtre par catégorie
  categoriesSet.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = category;
    btn.classList.add('btn-categorie');
    btn.addEventListener('click', function () {
      document
        .querySelectorAll('.btn-categorie')
        .forEach((b) => b.classList.remove('click-btn'));
      document.getElementById('portfolio').innerHTML = '';
      const filtered = worksData.filter(
        (article) => article.categorie === category
      );
      totalProduits(filtered);
      mettreAJourBoutonsPanier();
      btn.classList.add('click-btn');
    });
    zoneBtn.appendChild(btn);
  });

  titre.appendChild(btnToggle);
  titre.appendChild(zoneBtn);

  // Gestion du clic sur toggle : afficher/masquer
  btnToggle.addEventListener('click', () => {
    const isOpen = zoneBtn.classList.toggle('open');
    if (isOpen) {
      btnToggle.classList.add('open');
    } else {
      btnToggle.classList.remove('open');
    }
  });
}

// Fonction d'affichage des projets avec lazy loading
function projets(worksData) {
  const portfolio = document.getElementById('portfolio');
  portfolio.classList.add('gallery');
  portfolio.innerHTML = ''; // Vide le conteneur

  // 1) Regrouper les produits valides par catégorie
  const produitsParCat = new Map();
  for (const produit of worksData) {
    if (!produit._id) continue; // <- on garde uniquement les produits valides, même stock 0
    const cat = produit.categorie;
    if (!produitsParCat.has(cat)) {
      produitsParCat.set(cat, [produit]);
    } else {
      produitsParCat.get(cat).push(produit);
    }
  }

  // 2) Pour chaque catégorie, créer la figure avec carousel Swiper
  for (const [cat, produits] of produitsParCat.entries()) {
    const urls = produits.map((prod) => {
      const raw = Array.isArray(prod.image) ? prod.image[0] : prod.image || '';
      return baseURL + raw;
    });

    const figure = document.createElement('figure');
    figure.dataset.id = produits[0]._id;

    // --- Swiper Container ---
    const swiperContainer = document.createElement('div');
    swiperContainer.classList.add('swiper');

    const swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');

    // Slides
    produits.forEach((prod, i) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const divBg = document.createElement('div');
      divBg.classList.add('div-bg-card');

      const imgEl = document.createElement('img');
      imgEl.src = urls[i];
      imgEl.alt = `Image de ${prod.nom || cat}`;
      imgEl.classList.add('img-carousel');

      // Clic sur l'image => redirection produit
      imgEl.addEventListener('click', () => {
        if (prod.reference) {
          window.location.href = `/produit/${prod.reference}`;
        }
      });

      // Badge "Rupture de stock"
      if (prod.stock <= 0) {
        const badge = document.createElement('div');
        badge.classList.add('badge-rupture');
        badge.textContent = 'Rupture de stock';
        divBg.appendChild(badge);
      }
      divBg.appendChild(imgEl);
      slide.appendChild(divBg);
      swiperWrapper.appendChild(slide);
    });

    swiperContainer.appendChild(swiperWrapper);

    // Boutons Prev / Next
    if (urls.length > 1) {
      const btnPrev = document.createElement('div');
      btnPrev.classList.add('swiper-button-prev');
      const btnNext = document.createElement('div');
      btnNext.classList.add('swiper-button-next');
      swiperContainer.appendChild(btnPrev);
      swiperContainer.appendChild(btnNext);
    }

    figure.appendChild(swiperContainer);

    // --- Détails (titre, prix, desc, favoris) ---
    const divPrix = document.createElement('div');
    divPrix.classList.add('div-titre-prix');
    const figcaption = document.createElement('h3');
    figcaption.textContent = cat;
    const prix = document.createElement('span');
    prix.textContent = `${produits[0].prix}€`;

    divPrix.appendChild(figcaption);
    divPrix.appendChild(prix);
    figure.appendChild(divPrix);

    const description = document.createElement('p');
    description.classList.add('description-carte');
    description.textContent = produits[0].description;
    figure.appendChild(description);

    const btnFav = document.createElement('button');
    btnFav.classList.add('btn-fav-article');
    btnFav.dataset.id = produits[0]._id;
    btnFav.ariaLabel = 'Ajouter aux favoris';
    const iconFav = document.createElement('i');
    iconFav.classList.add('fa-regular', 'fa-heart');
    btnFav.appendChild(iconFav);
    figure.appendChild(btnFav);

    portfolio.appendChild(figure);

    // --- Initialisation Swiper ---
    const swiper = initCustomSwiper(
      swiperContainer,
      {
        navigation: {
          nextEl: swiperContainer.querySelector('.swiper-button-next'),
          prevEl: swiperContainer.querySelector('.swiper-button-prev'),
        },
      },
      produits,
      {
        onSlideChange: (prod) => {
          prix.textContent = `${prod.prix}€`;
          description.textContent = prod.description;
          btnFav.dataset.id = prod._id;
          // update favoris
          const favoris = JSON.parse(localStorage.getItem('favoris')) || [];
          const isFav = favoris.some((f) => f._id === prod._id);
          if (isFav) {
            iconFav.style.color = '#fce4da';
            iconFav.classList.replace('fa-regular', 'fa-solid');
          } else {
            iconFav.style.color = '';
            iconFav.classList.replace('fa-solid', 'fa-regular');
          }
        },
      }
    );
  }
}

// 1) Initialiser Quill (à faire une seule fois)
const editorDescriptionComplete = new Quill('#editor-descriptionComplete', {
  theme: 'snow',
});

// Placeholder for global validator
let validateCbGlobal;

// Écoute du Quill pour valider le formulaire lors de changements
editorDescriptionComplete.on('text-change', () => {
  if (typeof validateCbGlobal === 'function') validateCbGlobal();
});

// === Handlers séparés ===

// Validation du formulaire
function validateForm(
  form,
  gallery,
  coverErrorElem,
  multiErrorElem,
  btnSubmit,
  editor
) {
  const fields = [
    'categorie',
    'nom',
    'titreDescription',
    'description',
    'materiaux',
    'prix',
    'reference',
    'stock',
  ];
  let valid = fields.every(
    (name) => form.elements[name].value.trim().length > 0
  );
  // Vérifier contenu description complète
  const fullDesc = editor.root.innerText.trim();
  valid = valid && fullDesc.length > 0;
  // Vérifier qu'au moins une image multiple est présente
  valid = valid && gallery.querySelectorAll('img').length >= 1;
  // Aucune erreur sur les fichiers
  valid = valid && !coverErrorElem.textContent && !multiErrorElem.textContent;

  btnSubmit.disabled = !valid;
  if (valid) {
    btnSubmit.style.cssText =
      'background-color:#3a5151;cursor:pointer;border:1px solid white;color:white;';
  } else {
    btnSubmit.style.cssText =
      'background-color:gray;cursor:not-allowed;border:1px solid #3a5151;color:white;';
  }
}
let cropperInstance = null;
let cropperCallback = null;

function openCropper(file, callback) {
  const modal = document.getElementById('cropper-modal');
  const img = document.getElementById('cropper-image');
  const applyBtn = document.getElementById('cropper-apply');
  const cancelBtn = document.getElementById('cropper-cancel');

  cropperCallback = callback;
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    modal.style.display = 'flex';

    // Forcer la taille du cropper à celle du conteneur
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';

    if (cropperInstance) cropperInstance.destroy();
    cropperInstance = new Cropper(img, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 0.5,
      movable: true,
      zoomable: false,
      rotatable: true,
      scalable: true,
      background: true, // affiche la zone hors crop
      highlight: true, // met en évidence la zone crop
      cropBoxResizable: true,
      cropBoxMovable: true,
    });
  };

  reader.readAsDataURL(file);

  applyBtn.onclick = () => {
    if (!cropperInstance) return;
    cropperInstance.getCroppedCanvas().toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: file.type });
      cropperCallback(croppedFile);
      modal.style.display = 'none';
      cropperInstance.destroy();
      cropperInstance = null;
    }, file.type);
  };

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
  };
}

// Gestion preview couverture
function handleCoverUpload(
  couvertureInput,
  previewCover,
  coverErrorElem,
  validateCb
) {
  couvertureInput.value = '';
  couvertureInput.onchange = () => {
    coverErrorElem.textContent = '';
    const file = couvertureInput.files[0];
    if (!file) return validateCb();
    if (file.size > 4 * 1024 * 1024) {
      coverErrorElem.textContent = 'Le fichier dépasse 4 Mo.';
      return validateCb();
    }
    const types = ['image/jpeg', 'image/png', 'image/webp'];
    if (!types.includes(file.type)) {
      coverErrorElem.textContent = 'Seuls JPG, WEBP et PNG sont autorisés.';
      return validateCb();
    }
    const reader = new FileReader();
    reader.onload = () => {
      // Ouvre cropper pour couverture
      openCropper(file, (croppedFile) => {
        const croppedReader = new FileReader();
        croppedReader.onload = () => {
          previewCover.src = croppedReader.result;
          previewCover.alt = croppedFile.name;
          previewCover.style.display = 'block';

          // Remplacer le fichier original
        };
        croppedReader.readAsDataURL(croppedFile);
        couvertureInput.files = new DataTransfer().files; // créer un DataTransfer pour remplacer
        const dt = new DataTransfer();
        dt.items.add(croppedFile);
        couvertureInput.files = dt.files;
        validateCb();
      });
    };

    reader.readAsDataURL(file);
  };
}

// Gestion preview images multiples
let selectedMultiFiles = [];

function handleMultiUpload(multiInput, gallery, multiErrorElem, validateCb) {
  multiInput.onchange = () => {
    multiErrorElem.textContent = '';
    const files = Array.from(multiInput.files);

    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        multiErrorElem.textContent = 'Chaque fichier doit être <4 Mo.';
        multiInput.value = '';
        return validateCb();
      }
      const types = ['image/jpeg', 'image/png', 'image/webp'];
      if (!types.includes(file.type)) {
        multiErrorElem.textContent = 'Seuls JPG, WEBP et PNG sont autorisés.';
        multiInput.value = '';
        return validateCb();
      }
    }

    // Pour chaque fichier, on ouvre le cropper puis on l'ajoute seulement à selectedMultiFiles après crop
    files.forEach((file) => {
      openCropper(file, (croppedFile) => {
        const reader = new FileReader();
        reader.onload = () => {
          const figure = document.createElement('figure');
          figure.classList.add('image-wrapper');
          figure.innerHTML = `
            <button type="button" class="icone-supprimer-modal">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            <img src="${reader.result}" alt="${croppedFile.name}" class="image-preview" />
          `;
          figure.querySelector('button').onclick = () => {
            figure.remove();
            selectedMultiFiles = selectedMultiFiles.filter(
              (f) => f !== croppedFile
            );
            validateCb();
          };
          gallery.appendChild(figure);
          // On ajoute le fichier cropper **UNE SEULE FOIS**
          selectedMultiFiles.push(croppedFile);
          validateCb();
        };
        reader.readAsDataURL(croppedFile);
      });
    });

    multiInput.value = ''; // reset pour permettre reupload
  };
}

// === Fonction principale ===
async function initProductModal(mode, produit = {}) {
  const overlay = document.querySelector('.modal-content');
  const modal = document.querySelector('.modal');
  const form = modal.querySelector('#product-form');
  const btnSubmit = form.querySelector('button[type=submit]');
  const couvertureInput = document.getElementById('file-upload-couverture');
  const multiInput = document.getElementById('file-upload-images');
  const previewCover = document.getElementById('preview-couverture');
  const gallery = document.getElementById('preview-multi-images');
  const hiddenDescInput = document.getElementById('input-descriptionComplete');
  // 🟢 IMPORTANT : reset des fichiers sélectionnés pour éviter les doublons
  selectedMultiFiles = [];

  // Setup initial button state
  btnSubmit.disabled = true;
  btnSubmit.style.cssText =
    'background-color:gray;cursor:not-allowed;border:1px solid #3a5151;color:white;';

  // Normalisation des URLs
  if (produit.imageCouverture)
    produit.imageCouverture = produit.imageCouverture.replace(
      /^https?:\/\/[^/]+\//,
      ''
    );
  if (Array.isArray(produit.image))
    produit.image = produit.image.map((img) =>
      img.replace(/^https?:\/\/[^/]+\//, '')
    );

  // Titre et texte du bouton
  const titreModal = modal.querySelector('.titre-modal');
  if (mode === 'add') {
    titreModal.textContent = 'Ajouter un produit';
    btnSubmit.textContent = 'Créer';
  } else {
    titreModal.textContent = 'Modifier le produit';
    btnSubmit.textContent = 'Mettre à jour';
  }

  // Images à supprimer
  const imagesASupprimer = [];

  // Afficher image de couverture existante en mode edit
  if (mode === 'edit' && produit.imageCouverture) {
    previewCover.src = baseURL + produit.imageCouverture;
    previewCover.alt = 'Image de couverture';
    previewCover.style.display = 'block';
  } else {
    previewCover.style.display = 'none';
  }

  // Remplissage autres champs
  if (mode === 'edit') {
    Object.entries({
      categorie: produit.categorie,
      nom: produit.nom,
      titreDescription: produit.titreDescription,
      description: produit.description,
      materiaux: produit.materiaux,
      prix: produit.prix,
      reference: produit.reference,
      stock: produit.stock,
    }).forEach(([key, val]) => (form.elements[key].value = val || ''));
    editorDescriptionComplete.clipboard.dangerouslyPasteHTML(
      produit.descriptionComplete || ''
    );
  } else {
    form.reset();
    editorDescriptionComplete.setContents([]);
  }

  // Galerie initiale
  gallery.innerHTML = '';
  if (mode === 'edit' && Array.isArray(produit.image)) {
    produit.image.forEach((relPath, idx) => {
      const figure = document.createElement('figure');
      figure.classList.add('image-wrapper');
      figure.innerHTML = `
        <button type="button" class="icone-supprimer-modal">
          <i class="fa-solid fa-trash-can"></i>
        </button>
        <img src="${baseURL + relPath}" alt="Image ${
        produit.categorie +
        ' ' +
        produit.nom +
        ' ' +
        produit.reference +
        ' ' +
        (idx + 1)
      }" class="image-preview" />
      `;
      figure.querySelector('button').onclick = () => {
        imagesASupprimer.push(relPath);
        figure.remove();
        selectedMultiFiles = selectedMultiFiles.filter(
          (f) => f.name !== relPath && f.name !== relPath.split('/').pop()
        );
        validateCbGlobal();
      };
      gallery.appendChild(figure);
    });
  }

  // Élément d'erreur
  const coverErrorElem = couvertureInput
    .closest('.custom-file-upload')
    .querySelector('.text-error-add-photo');
  const multiErrorElem = multiInput
    .closest('.custom-file-upload')
    .querySelector('.text-error-add-photo');

  // Init handlers & validation callback
  const validateCb = () =>
    validateForm(
      form,
      gallery,
      coverErrorElem,
      multiErrorElem,
      btnSubmit,
      editorDescriptionComplete
    );
  validateCbGlobal = validateCb;

  handleCoverUpload(couvertureInput, previewCover, coverErrorElem, validateCb);
  handleMultiUpload(multiInput, gallery, multiErrorElem, validateCb);

  // Écouteurs
  form.addEventListener('input', validateCb);

  // Affichage modal
  modal.style.display = 'flex';
  overlay.style.display = 'flex';
  // Soumission
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (btnSubmit.disabled) return;

    const token = localStorage.getItem('token');
    if (!token) return alert('Vous devez être connecté.');

    hiddenDescInput.value = editorDescriptionComplete.root.innerHTML;
    const formData = new FormData(form);

    // Ajouter les fichiers multiples stockés
    for (const file of selectedMultiFiles) {
      formData.append('image', file);
    }

    // Ajouter les images supprimées
    imagesASupprimer.forEach((path) =>
      formData.append('imagesASupprimer', path)
    );

    try {
      mode === 'add'
        ? await createProduct(formData, token)
        : await updateProduct(produit._id, formData, token);

      overlay.style.display = 'none';
      modal.style.display = 'none';

      const data = await getAllProducts();
      totalProduits(data, !!token);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };
}

// //* Fonction fermeture de la modale */
function closeModal() {
  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal-content');
  modal.style.display = 'none';
  modalContent.style.display = 'none';

  const modalavis = document.querySelector('.modal-content-avis');
  const modalContentavis = document.querySelector('.modal-avis');
  modalavis.style.display = 'none';
  modalContentavis.style.display = 'none';

  // Réinitialiser le formulaire
  const form = document.querySelector('#product-form');
  if (form) form.reset();

  // Réinitialiser le bouton
  const btnSubmit = form?.querySelector('button[type=submit]');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.style.cssText =
      'background-color:gray;cursor:not-allowed;border:1px solid #3a5151;color:white;';
  }

  // Réinitialiser les variables globales liées aux images
  selectedMultiFiles = [];
  validateCbGlobal = null;

  // Réinitialiser le contenu des prévisualisations
  const gallery = document.getElementById('preview-multi-images');
  if (gallery) gallery.innerHTML = '';
  const previewCover = document.getElementById('preview-couverture');
  if (previewCover) {
    previewCover.src = '';
    previewCover.style.display = 'none';
  }

  // Réinitialiser l'éditeur Quill
  if (window.editorDescriptionComplete) {
    editorDescriptionComplete.setContents([]);
  }
}

// /* fonction de suppression de la photo, reçoit la figure à supprimer */
async function deletePhoto(figure) {
  const id = figure.dataset.id;
  if (!id) {
    console.error("Aucun ID n'est associé à ce produit.");
    return;
  }

  const token = window.localStorage.getItem('token');
  try {
    deleteProduct(id, token);
    figure.remove();
  } catch (error) {
    console.error('Erreur pendant la suppression :', error);
  }
}

// eventListener "click"
document.body.addEventListener('click', function (e) {
  if (e.target.closest('#user-open')) {
    if (window.localStorage.getItem('token')) {
      const userOpen = document.querySelector('#user-open');
      userOpen.innerHTML = 'login';
      window.localStorage.clear();
      window.location.href = 'index.html';
    } else {
      const userOpen = document.querySelector('#user-open');
      userOpen.classList.toggle('click');
    }
  }
  if (e.target.closest('.btn-close')) {
    closeModal();
  }
  const modalContent = document.querySelector('.modal-content-avis');
  if (e.target === modalContent) {
    // au clic en dehors de la modale, ferme la modale
    closeModal();
  }
  if (e.target.closest('.div-modification')) {
    initProductModal('add');
  }
});

async function verifAvis() {
  const divAvis = document.querySelector('.modal-content-avis');
  const divAvisOverlay = document.querySelector('.modal-avis');
  divAvis.style.display = 'flex';
  divAvisOverlay.style.display = 'flex';

  const container = document.getElementById('table-container');
  container.innerHTML = '<p>Chargement des avis...</p>';

  try {
    const avisList = await avis();

    if (!avisList || avisList.length === 0) {
      container.innerHTML = '<p>Aucun avis trouvé.</p>';
      return;
    }

    let html = `
      <table class="avis-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Nom</th>
            <th>Note</th>
            <th>Commentaire</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;

    avisList.forEach((a) => {
      const date = new Date(a.date).toLocaleDateString('fr-FR');
      html += `
<tr data-id="${a._id}">
  <td>${a.productRef}</td>
  <td>${a.nom}</td>
  <td>${'⭐'.repeat(a.note)}</td>
  <td>
    <div class="comment-cell">${a.commentaire}</div>
  </td>
  <td>${date}</td>
  <td>
    ${
      a.validated
        ? ''
        : `<button class="btn-validate" data-id="${a._id}">✔</button>`
    }
    <button class="btn-delete" data-id="${a._id}">🗑️</button>
  </td>
</tr>
`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Ajout des listeners sur les boutons "Supprimer"
    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          await deleteAvis(id);
          // Retire la ligne supprimée du tableau
          document.querySelector(`tr[data-id="${id}"]`).remove();
        } catch (err) {
          alert('Erreur lors de la suppression de l’avis.');
          console.error(err);
        }
      });
    });
    document.querySelectorAll('.btn-validate').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          await validateAvis(id);
          // Supprime le bouton valider pour refléter le changement
          e.target.remove();
        } catch (err) {
          alert('Erreur lors de la validation de l’avis.');
          console.error(err);
        }
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Erreur lors du chargement des avis.</p>';
  }
}

// Lancement de l'init au chargement du DOM
document.addEventListener('DOMContentLoaded', init);
