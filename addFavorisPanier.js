
export function updateFavorisCount() {
  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  const panier = JSON.parse(localStorage.getItem('panier')) || [];
  const compteur = document.getElementById('favoris-count');
  const iconeFavoris = document.querySelector('#favoris i')
  const compteurPanier = document.getElementById('panier-count');
  if (compteur) {
    compteur.textContent = favoris.length;
    compteur.style.display = favoris.length > 0 ? "inline-block" : "none";
    iconeFavoris.style.color = favoris.length > 0 ? "red" : "";
  }
  if (panier) {
    compteurPanier.textContent = panier.length;
    compteurPanier.style.display = panier.length > 0 ? "inline-block" : "none";
  }
}

export async function initPageListeFavoris(produits) {
  
  // Utilisation de la délégation : un seul écouteur sur le conteneur
  document.addEventListener('click', event => {
    const btn = event.target.closest('.btn-fav-article[data-id]');
    if (!btn) return;
  
    let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
    const id = btn.dataset.id;
    const icon = btn.querySelector('i');
    const index = favoris.findIndex(f => f._id === id);
  
    if (index === -1) {
      const produit = produits.find(p => p._id === id);
      if (produit) {
        favoris.push(produit);
        icon.style.color = "red";
      }
    } else {
      favoris.splice(index, 1);
      icon.style.color = "";
    }
  
    localStorage.setItem('favoris', JSON.stringify(favoris));
    updateFavorisCount();
  });
}
export async function initPageListePanier(produits) {
  let panier = JSON.parse(localStorage.getItem('panier')) || [];
  
  // Utilisation d'un seul écouteur sur le document pour capter tous les clics
  document.addEventListener('click', (event) => {
    // Bouton "btn-acheter"
    const btnAcheter = event.target.closest('.btn-acheter[data-id]');
    if (btnAcheter) {
      const id = btnAcheter.dataset.id;
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(p => p._id === id);
      
      if (index === -1) {
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btnAcheter.textContent = 'Retirer du panier';
          btnAcheter.style.backgroundColor = 'transparent';
          btnAcheter.style.color = '#3a5151';
          btnAcheter.style.borderColor = '#3a5151';
        }
      } else {
        panier.splice(index, 1);
        btnAcheter.textContent = 'Ajouter';
        btnAcheter.style.backgroundColor = '';
        btnAcheter.style.color = '';
        btnAcheter.style.borderColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
      mettreAJourBoutonsPanier();
      return;
    }
    
    // Bouton "btn-ajout-panier"
    const btnAjouterPanier = event.target.closest('.btn-ajout-panier[data-id]');
    if (btnAjouterPanier) {
      const id = btnAjouterPanier.dataset.id;
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(p => p._id === id);
      
      if (index === -1) {
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btnAjouterPanier.textContent = 'Retirer du panier';
          btnAjouterPanier.style.backgroundColor = 'transparent';
          btnAjouterPanier.style.color = '#3a5151';
          btnAjouterPanier.style.borderColor = '#3a5151';
        }
      } else {
        panier.splice(index, 1);
        btnAjouterPanier.textContent = 'Ajouter au panier';
        btnAjouterPanier.style.backgroundColor = '';
        btnAjouterPanier.style.color = '';
        btnAjouterPanier.style.borderColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
      mettreAJourBoutonsPanier();
      return;
    }

    // Bouton "btn-ajout-panier-favoris" (pour la page favoris.html)
    const btnAjouterPanierFavoris = event.target.closest('.btn-ajout-panier-favoris[data-id]');
    if (btnAjouterPanierFavoris) {
      const id = btnAjouterPanierFavoris.dataset.id;
      panier = JSON.parse(localStorage.getItem('panier')) || [];
      const index = panier.findIndex(p => p._id === id);
      
      if (index === -1) {
        const produit = produits.find(p => p._id === id);
        if (produit) {
          panier.push(produit);
          btnAjouterPanierFavoris.textContent = 'Retirer du panier';
          btnAjouterPanierFavoris.style.backgroundColor = 'green';
        }
      } else {
        panier.splice(index, 1);
        btnAjouterPanierFavoris.textContent = 'Ajouter au panier';
        btnAjouterPanierFavoris.style.backgroundColor = '';
      }
      
      localStorage.setItem('panier', JSON.stringify(panier));
      updateFavorisCount();
      mettreAJourBoutonsPanier();
      return;
    }
  });
}

// Met à jour les boutons en fonction de l'état du panier
export function mettreAJourBoutonsPanier() {
  const panier = JSON.parse(localStorage.getItem('panier')) || [];

  const boutons = document.querySelectorAll('.btn-ajout-panier[data-id]');

  boutons.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = '#3a5151';
      btn.style.borderColor = '#3a5151';
    } else {
      btn.textContent = 'Ajouter au panier';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });
  const boutonsAcheter = document.querySelectorAll('.btn-acheter[data-id]');

  boutonsAcheter.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = '#3a5151';
      btn.style.borderColor = '#3a5151';
    } else {
      btn.textContent = 'Ajouter';
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  const boutonsPanier = document.querySelectorAll('.btn-ajout-panier-favoris[data-id]');

  boutonsPanier.forEach(btn => {
    const id = btn.dataset.id;
    const estDansPanier = panier.some(p => p._id === id);

    if (estDansPanier) {
      btn.textContent = 'Retirer du panier';
      btn.style.backgroundColor = 'green';
    } else {
      btn.textContent = 'Ajouter au panier';
      btn.style.backgroundColor = '';
    }
  });

  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];
  const btnFavs = document.querySelectorAll('.btn-fav-article[data-id]');
  btnFavs.forEach(btn => {
    const id = btn.dataset.id;
    const icon = btn.querySelector('i');
    if (favoris.find(f => f._id === id)) {
      icon.style.color = "red";
    } else {
      icon.style.color = "";
    }
  });
}
