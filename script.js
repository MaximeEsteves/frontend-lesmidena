//  import stockArticles from './stock-article.js';
  const focusableSelector = 'a, textarea, button, i[tabindex], input, select';
  let focusables = [];
  let previousActiveElement = null;
// Fonction utilitaire fetchData
async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return await res.json();
    } else {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
  } catch (error) {
    console.error("fetchData error:", error);
    throw error;
  }
}
 document.addEventListener('DOMContentLoaded', () => {
    document
      .getElementById('file-upload-couverture')
      .addEventListener('change', previewFileCouverture);

    // document
    //   .getElementById('file-upload-images')
    //   .addEventListener('change', previewFilesProduit);
  });
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const productsData = await fetchData("http://localhost:3000/api/produits");

    // Appeler projets() et filtres() avec les données récupérées
    projets(productsData);
    filtres(productsData);

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des produits :", error);
  }
});

// Fonction d'affichage des filtres (adaptée pour recevoir les données)
 function filtres(worksData) {

  const titre = document.querySelector(".titre-projet");
  let zoneBtn = document.querySelector(".zone-btn");
  if (zoneBtn) zoneBtn.remove();

  zoneBtn = document.createElement("div");
  zoneBtn.classList.add("zone-btn");

  // Récupérer les catégories uniques
  const categoriesSet = new Set();
  worksData.forEach(article => {
    categoriesSet.add(article.categorie);
  });

  // Bouton "Tous"
  const btnTous = document.createElement("button");
  btnTous.innerText = "Tous";
  btnTous.classList.add("btn-categorie", "click-btn");
  btnTous.addEventListener("click", function () {
    const allBtns = document.querySelectorAll(".btn-categorie");
    allBtns.forEach(b => b.classList.remove("click-btn"));

    document.getElementById("portfolio").innerHTML = "";
    projets(worksData);

    btnTous.classList.add("click-btn");
  });
  zoneBtn.appendChild(btnTous);

  // Création dynamique des boutons de filtre
  categoriesSet.forEach(category => {
    const btn = document.createElement("button");
    btn.innerText = category;
    btn.classList.add("btn-categorie");
    btn.addEventListener("click", function () {
      const allBtns = document.querySelectorAll(".btn-categorie");
      allBtns.forEach(b => b.classList.remove("click-btn"));

      document.getElementById("portfolio").innerHTML = "";
      const filtered = worksData.filter(article => article.categorie === category);
      projets(filtered);

      btn.classList.add("click-btn");
    });
    zoneBtn.appendChild(btn);
  });

  titre.appendChild(zoneBtn);
}

// Fonction d'affichage des projets avec lazy loading
 function projets(worksData) {
  const portfolio = document.getElementById("portfolio");
  portfolio.classList.add("gallery");
   portfolio.innerHTML = ""; // Nettoyer le conteneur avant d'ajouter les projets

  // Si l'utilisateur est connecté, ajouter le bouton "Modifier" une seule fois
  if (localStorage.getItem("token")) {
    const h2 = document.querySelector(".titre-projet");
    // Vérifie si le bouton modifier existe déjà
    if (!h2.querySelector(".div-modification")) {
      const divModification = document.createElement("button");
      const pModification = document.createElement("span");
      const iModification = document.createElement("i");
      
      pModification.innerHTML = "Modifier";
      iModification.classList.add("fa-solid", "fa-pen-to-square");
      divModification.classList.add("div-modification");
      
      divModification.appendChild(iModification);
      divModification.appendChild(pModification);
      h2.appendChild(divModification);
    }
  }

  const imgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { threshold: 0.1 });

  worksData.forEach(produit => {
    const figure = document.createElement("figure");
  figure.dataset.id = produit._id;
    const img = document.createElement("img");
const baseURL = "http://localhost:3000/";
  worksData.forEach(produit => {
    const raw = Array.isArray(produit.image) 
      ? produit.image[0] 
      : produit.image || "";
    const clean = raw.replace(/\\/g, "/").trim();

    let src;
    if (/^https?:\/\//i.test(clean)) {
      src = clean;
    } else if (clean.startsWith("/")) {
      src = baseURL + clean.slice(1);
    } else {
      src = baseURL + clean;
    }

    img.dataset.src = src;
    img.alt = `image de ${produit.nom}`;
});
    const figcaption = document.createElement("h3");
    figcaption.textContent = produit.nom;

    const description = document.createElement("p");
    description.classList.add("description-carte");
    description.textContent = produit.description;

    const prix = document.createElement("p");
    prix.textContent = `${produit.prix}€`;

    const bouton = document.createElement("button");
    bouton.textContent = "Acheter";
    bouton.classList.add("btn-acheter");

    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(description);
    figure.appendChild(prix);
    figure.appendChild(bouton);
    portfolio.appendChild(figure);

  // Boutons pour utilisateur connecté
  if (localStorage.getItem("token")) {
    // Bouton supprimer déjà présent...
    const btnSupprimer = document.createElement("button");
    btnSupprimer.classList.add("icone-supprimer");
    const iconSupprimer = document.createElement("i");
    iconSupprimer.classList.add("fa-solid", "fa-trash-can");
    btnSupprimer.appendChild(iconSupprimer);
    btnSupprimer.addEventListener("click", () => {
      deletePhoto(figure);
    });
    figure.appendChild(btnSupprimer);
    
    // Bouton modifier : ouvre la modale de modification
    const btnModifier = document.createElement("button");
    btnModifier.classList.add("icone-modifier");
    const iconModifier = document.createElement("i");
    iconModifier.classList.add("fa-solid", "fa-pen-to-square");
    btnModifier.appendChild(iconModifier);
    btnModifier.addEventListener("click", () => {
      openModificationModal(produit);
    });
    figure.appendChild(btnModifier);
  }

    portfolio.appendChild(figure);
    imgObserver.observe(img);

    imgObserver.observe(img);

    img.addEventListener("click", () => {
      window.location.href = `produit.html?ref=${produit.reference}`;
    });
  });
}
  const editors = {
      descriptionComplete: new Quill('#editor-descriptionComplete', { theme: 'snow' })
    };
function openModificationModal(produit) {
  const modal        = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");
  const titreModal   = modal.querySelector(".titre-modal");
  const form         = modal.querySelector("#product-form");
  const baseURL      = "http://localhost:3000/";

  // ─── 0) Normalisation des chemins : on retire tout préfixe http(s)://domaine/
  if (produit.imageCouverture) {
    produit.imageCouverture = produit.imageCouverture
      .replace(/^https?:\/\/[^/]+\//, "");
  }
  if (Array.isArray(produit.image)) {
    produit.image = produit.image.map(img =>
      img.replace(/^https?:\/\/[^/]+\//, "")
    );
  }

  // ─── 1) Afficher la modale
  titreModal.textContent      = "Modifier le produit";
  modal.style.display         = "flex";
  modalContent.style.display  = "flex";

  // ─── 2) Préremplissage des champs texte
  form.elements["categorie"].value        = produit.categorie;
  form.elements["nom"].value              = produit.nom;
  form.elements["titreDescription"].value = produit.titreDescription;
  form.elements["description"].value      = produit.description;
  form.elements["materiaux"].value        = produit.materiaux;
  form.elements["prix"].value             = produit.prix;
  form.elements["reference"].value        = produit.reference;
  form.elements["stock"].value            = produit.stock;

  // Préremplir Quill
  editors.descriptionComplete.clipboard.dangerouslyPasteHTML(
    produit.descriptionComplete
  );

  // ─── 3) Image de couverture
  const couverturePreview = document.getElementById("preview-couverture");
  if (produit.imageCouverture) {
    const urlCover = baseURL + produit.imageCouverture;
    couverturePreview.src     = urlCover;
    couverturePreview.alt     = "Image de couverture";
    couverturePreview.style.display = "block";
  } else {
    couverturePreview.style.display = "none";
  }

  // ─── 4) Images multiples existantes
  const gallery = document.getElementById("preview-multi-images");
  gallery.innerHTML = "";
  const imagesASupprimer = [];

  produit.image.forEach((relPath, idx) => {
    const figure = document.createElement("figure");
    figure.classList.add("image-wrapper");

    const img = document.createElement("img");
    img.src = baseURL + relPath;
    img.alt = `Image ${idx + 1}`;
    img.classList.add("image-preview");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("icone-supprimer-modal");
    btn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    btn.addEventListener("click", e => {
      const fig = e.currentTarget.closest("figure");
      imagesASupprimer.push(relPath);
      fig.remove();
    });

    figure.append(btn, img);
    gallery.appendChild(figure);
  });

  // ─── 5) Preview des nouvelles images
  const inputMulti = document.getElementById("file-upload-images");
  inputMulti.value = "";
  inputMulti.onchange = () => {
    Array.from(inputMulti.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const figure = document.createElement("figure");
        figure.classList.add("image-wrapper");

        const img = document.createElement("img");
        img.src = reader.result;
        img.alt = file.name;
        img.classList.add("image-preview");

        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("icone-supprimer-modal");
        btn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
         btn.addEventListener("click", e => {
      const fig = e.currentTarget.closest("figure");
      imagesASupprimer.push(relPath);
      fig.remove();
    });

        figure.append(btn, img);
        gallery.appendChild(figure);
      };
      reader.readAsDataURL(file);
    });
  };

  // ─── 6) Soumission du formulaire
  form.onsubmit = async e => {
    e.preventDefault();
    const token = window.localStorage.getItem("token");

    // a) Mettre le HTML de Quill dans le hidden input
    document.getElementById("input-descriptionComplete").value =
      editors.descriptionComplete.root.innerHTML;

    // b) Construire FormData
    const formData = new FormData(form);
    imagesASupprimer.forEach(path => {
      formData.append("imagesASupprimer", path);
    });

    // c) Envoyer
    try {
      const res = await fetch(
        `http://localhost:3000/api/produits/${produit._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Erreur:", res.status, text);
        return;
      }
      closeModal();
      const data = await fetchData("http://localhost:3000/api/produits");
      projets(data);
    } catch (err) {
      console.error("Erreur fetch:", err);
    }
  };
}


// Preview image de couverture
function previewFileCouverture() {
  const input = document.getElementById("file-upload-couverture");
  const file = input.files[0];
  const preview = document.getElementById("preview-couverture");
  const error = input.closest(".custom-file-upload").querySelector(".text-error-add-photo");

  if (!file) return;

  if (file.size > 4 * 1024 * 1024) {
    error.textContent = "Le fichier dépasse 4 Mo.";
    error.style.color = "red";
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    error.textContent = "Seuls JPG, WEBP et PNG sont autorisés.";
    error.style.color = "red";
    return;
  }

  error.textContent = "";

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}


// Preview images produit multiples
// function previewFilesProduit() {
//   const input = document.getElementById("file-upload-images");
//   const files = input.files;
//   const gallery = document.getElementById("preview-multi-images");
//   const error = input.closest(".custom-file-upload").querySelector(".text-error-add-photo");

//   if (!files.length) return;

//   [...files].forEach(file => {
//     if (file.size > 4 * 1024 * 1024) {
//       error.textContent = "Un fichier dépasse 4 Mo.";
//       error.style.color = "red";
//       return;
//     }

//     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//     if (!allowedTypes.includes(file.type)) {
//       error.textContent = "Seuls JPG, WEBP et PNG sont autorisés.";
//       error.style.color = "red";
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       const figure = document.createElement("figure");
//       figure.classList.add("image-wrapper");

//       const img = document.createElement("img");
//       img.src = reader.result;
//       img.classList.add("image-preview");
//       img.alt = "Nouvelle image";

//       const btnSupprimer = document.createElement("button");
//       btnSupprimer.classList.add("icone-supprimer");
//       btnSupprimer.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
//       btnSupprimer.style.cssText = "width: 25px; height: 25px; font-size: 15px; opacity: 1";
//       btnSupprimer.onclick = () => figure.remove();

//       figure.appendChild(btnSupprimer);
//       figure.appendChild(img);
//       gallery.appendChild(figure);
//     };
//     reader.readAsDataURL(file);
//   });
// input.value = "";
// }


//* fonction contenu de la modale Galarie Photo */
//  async function modal(){
//      const gallery = document.querySelector(".ajout-galerie");
//      const worksData = await fetchData("http://localhost:3000/api/produits");
//      worksData.forEach(article => {
//          const figure = document.createElement("figure");
//          figure.dataset.id = article.id;
//          const img = document.createElement("img");
//          img.src = article.imageUrl;
//          img.alt = `image de ${article.title}`;
//          figure.appendChild(img);
//          const btnSupprimer = document.createElement("button");
//          btnSupprimer.classList.add("icone-supprimer");
//          const icon = document.createElement("i");
//          icon.classList.add("fa-solid", "fa-trash-can");
//          btnSupprimer.appendChild(icon);
//          figure.appendChild(btnSupprimer);
//          gallery.appendChild(figure);
//      });
  
//      // Mise à jour de la liste des éléments focusables dans la modale
//      const modal = document.querySelector(".modal");
//      focusables = Array.from(modal.querySelectorAll(focusableSelector));
  
//  }

// /* fonction affichage de la modale d'ajout de photo */
 async function modalAjoutPhoto() {
     const textTitreModal = document.querySelector(".modal h2");
     const textBtn = document.querySelector(".btnp");
     const gallery = document.querySelector(".ajout-galerie");
     // Nettoyage et configuration
     gallery.innerHTML = "";
     textTitreModal.innerHTML = "Ajout photo";
     textBtn.style.display = "none";
     gallery.classList.add("ajout-projet");
     // Formulaire
     const form = document.createElement("form");
     form.setAttribute("id", "form-ajout-photo");
     form.setAttribute("enctype", "multipart/form-data");
     // Conteneur du formulaire
     const divForm = document.createElement("div");
     divForm.classList.add("formulaire-photo");
     // Label custom file upload
     const labelFile = document.createElement("label");
     labelFile.classList.add("custom-file-upload");
     // Image preview
     const imgPreview = document.createElement("img");
     imgPreview.id = "preview";
     imgPreview.style.display = "none";
     imgPreview.alt = "aperçu";
     labelFile.appendChild(imgPreview);
     // Icône image
     const icone = document.createElement("i");
     icone.classList.add("fa-solid", "fa-image", "picture-file");
     labelFile.appendChild(icone);
     // Texte bouton
     const spanBtnText = document.createElement("span");
     spanBtnText.classList.add("btn-text");
     spanBtnText.textContent = "+ Ajouter une photo";
     labelFile.appendChild(spanBtnText);
     // Infos fichier
     const spanFileInfo = document.createElement("span");
     spanFileInfo.classList.add("file-info");
     spanFileInfo.textContent = "jpg, png : 4 Mo max";
     labelFile.appendChild(spanFileInfo);
     // Input file
     const inputFile = document.createElement("input");
     inputFile.id = "file-upload";
     inputFile.name = "image";
     inputFile.type = "file";
     inputFile.required = true;
     inputFile.onchange = previewFile;
     labelFile.appendChild(inputFile);
     divForm.appendChild(labelFile);
     // Titre
     const pTitle = document.createElement("p");
     const labelTitle = document.createElement("label");
     labelTitle.setAttribute("for", "title");
     labelTitle.textContent = "Titre";
     const inputTitle = document.createElement("input");
     inputTitle.type = "text";
     inputTitle.id = "title";
     inputTitle.name = "title";
     inputTitle.maxLength = 32;
     inputTitle.required = true;
     labelTitle.appendChild(inputTitle);
     pTitle.appendChild(labelTitle);
     divForm.appendChild(pTitle);
     // Catégorie
     const pCategory = document.createElement("p");
     const labelCategory = document.createElement("label");
     labelCategory.setAttribute("for", "category");
     labelCategory.textContent = "Catégorie";
     const selectCategory = document.createElement("select");
     selectCategory.id = "category";
     selectCategory.name = "category";
     selectCategory.required = true;
     labelCategory.appendChild(selectCategory);
     pCategory.appendChild(labelCategory);
     divForm.appendChild(pCategory);
     form.appendChild(divForm);
     // Ligne bouton valider
     const pBtnLine = document.createElement("p");
     pBtnLine.classList.add("btnp-line");
     const inputSubmit = document.createElement("input");
     inputSubmit.type = "submit";
     inputSubmit.classList.add("btn-valider-ajout");
     inputSubmit.value = "Valider";
     pBtnLine.appendChild(inputSubmit);
     textError = document.createElement("span")
     textError.classList.add("text-error-add-photo")
     pBtnLine.appendChild(textError);
     form.appendChild(pBtnLine);
     gallery.appendChild(form);
     // Remplir les catégories
     try {
         const response = await fetchData("http://localhost:3000/api/produits");
         response.forEach(categories => {
             const option = document.createElement("option");
             option.value = categories.id;
             option.textContent = categories.name;
             selectCategory.appendChild(option);
         });
     } catch (error) {
     }
    }

//     // Validation en temps réel du formulaire
     function validatePhotoForm() {
         if ( inputTitle.value.trim() !== "" && inputFile.files.length > 0 && selectCategory.value !== "") {
             inputSubmit.classList.add("active");
             textError.textContent = ""
         } else {
             inputSubmit.classList.remove("active");
         }
     
     form.addEventListener("input", validatePhotoForm);
     form.addEventListener("change", validatePhotoForm);
     inputSubmit.addEventListener("click",() => {
         if ( inputTitle.value.trim() !== "" && inputFile.files.length > 0 && selectCategory.value !== "") {
             return
         } else{
             textError.textContent = "Veuillez remplir tout les champs"
             textError.style.color = "red"
         }
         })
     updateFocusables();
 }

// //* Fonction fermeture de la modale */
 function closeModal() {
         const modal = document.querySelector(".modal");
         const modalContent = document.querySelector(".modal-content");
         modal.style.display = "none";
         modalContent.style.display = "none";
 }
 
// /* fonction de suppression de la photo, reçoit la figure à supprimer */
async function deletePhoto(figure) {
  const id = figure.dataset.id;
  if (!id) {
    console.error("Aucun ID n'est associé à ce produit.");
    return;
  }
  
  const token = window.localStorage.getItem("token");
  try {
    const response = await fetch(`http://localhost:3000/api/produits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Supprimez seulement l'élément du DOM
      figure.remove();
    } else {
      console.error("Erreur lors de la suppression, statut:", response.status);
    }
  } catch (error) {
    console.error("Erreur pendant la suppression :", error);
  }
  
  updateFocusables();
}

 // fonction ajout d'un nouveau projet
 async function addPhoto(){
     const formEl = document.querySelector('#form-ajout-photo');
     const token = window.localStorage.getItem("token");
     const formData = new FormData(formEl);
     const response = await fetch('http://localhost:3000/api/produits/', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`
         },
         body: formData
     })
         if (response) {
         //
         closeModal();
         const portfolio = document.getElementById("portfolio");
         portfolio.innerHTML = ""
         projets();
         // ajouter si on souhaite réouvrir la modale sur 'ajout photo'
         //modalAjoutPhoto()
         } 
 }

 // eventListener "click"
 document.body.addEventListener("click", function(e) {
     if (e.target.closest("#user-open")) {
         if (window.localStorage.getItem("token")) {
             const userOpen = document.querySelector("#user-open")
             userOpen.innerHTML = "login"
             window.localStorage.clear()
             window.location.href = "index.html";
         } else {
             const userOpen = document.querySelector("#user-open")
             userOpen.classList.toggle("click");
         }
     }
     if (e.target.closest(".btn-ajout")) {
         // Afficher la modale ajout photo
         modalAjoutPhoto();
     }
     if (e.target.closest(".btn-close")) {
         closeModal();
     }
     const modalContent = document.querySelector(".modal-content");
     if (e.target === modalContent) {
         // au clic en dehors de la modale, ferme la modale
       closeModal();
     }
     if (e.target.closest(".icone-supprimer")) {
         const figure = e.target.closest("figure");
         // Suppression d'une photo 
         deletePhoto(figure);
     }
     if (e.target.closest(".div-modification")) {
         // Affichage de la modale de la galerie photo
         const modal = document.querySelector(".modal");
         const modalContent = document.querySelector(".modal-content");
         modal.style.display = "flex";
         modalContent.style.display = "flex";
     }
 });

 /* eventListener "keydown" */
 window.addEventListener("keydown", function(e) {
     const modal = document.querySelector(".modal");
     if (e.key === "Escape" || e.key === "Esc") {
         closeModal();
     }
     // Exécuter le focus trap uniquement si la modale est visible
     if (e.key === "Tab") {
         // Vérifier si la modale est ouverte (par exemple, mode flex ou autre)
         if (window.getComputedStyle(modal).display !== "none") {
             e.preventDefault();
             focusInModal(e);
         }
     }
 });
 /* focus tab */
 const focusInModal = function (e) {
     const modal = document.querySelector(".modal");
     e.preventDefault();
     let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
     if (e.shiftKey) {
         index--;
     }
     else {
         index++;
     }
     if (index >= focusables.length) {
         index = 0;
     }
     if (index < 0) {
         index = focusables.length - 1;
     }
     focusables[index].focus();
  
 }
function updateFocusables() {
     const modal = document.querySelector(".modal");
     focusables = Array.from(modal.querySelectorAll(focusableSelector))
         .filter(el => !el.disabled && el.offsetParent !== null);
 }
 if (window.localStorage.getItem("token")) {
     const userOpen = document.getElementById("user-open");
     userOpen.innerHTML = "log out";
     userOpen.style.fontWeight = "700"
     const modeEdition = document.createElement("div");
     const iconeEdition = document.createElement("i");
     const texteEdition = document.createElement("p");
     const body = document.querySelector("body");
     modeEdition.classList.add("mode-edition");
     iconeEdition.classList.add("fa-solid", "fa-pen-to-square");
     texteEdition.textContent = "Mode édition";
     body.style.marginTop = "59px";
     modeEdition.appendChild(iconeEdition);
     modeEdition.appendChild(texteEdition);
     body.appendChild(modeEdition);
 }
 function survolNav() {
     const btnNav = document.querySelectorAll(".btn-nav li")
     btnNav.forEach(btn => {
         if (btn) {
             btn.style.color = "", "important"
          
         }
     })
 }
 survolNav()

