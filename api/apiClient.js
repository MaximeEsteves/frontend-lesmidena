export const API_BASE = 'https://backend-lesmidena-production.up.railway.app';
//export const API_BASE = 'http://localhost:3000'; // Pour le développement local

async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method,
    headers,
  };

  if (data && !(data instanceof FormData)) {
    config.body = JSON.stringify(data);
  } else if (data instanceof FormData) {
    delete headers['Content-Type']; // Let browser set it
    config.body = data;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  if (!res.ok) throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
  return res.status !== 204 ? await res.json() : null;
}

// ✅ Créer une session Stripe Checkout (lignes + client)
export async function createStripeCheckoutSession(lignes, customer) {
  // On envoie à l’API both “lignes” et “client”
  return apiRequest('/api/payment/create-checkout-session', 'POST', {
    lignes,
    customer,
  });
}

export async function getProductByRef(ref) {
  return apiRequest(`/api/produits/by-ref/${encodeURIComponent(ref)}`);
}

// === API spécifiques produits ===
export async function searchProducts(query) {
  return apiRequest(`/api/recherche?search=${encodeURIComponent(query)}`);
}

export async function getGalerie() {
  return apiRequest('/api/galerie');
}
export async function getAllProducts() {
  return apiRequest('/api/produits');
}

export async function deleteProduct(id, token) {
  return apiRequest(`/api/produits/${id}`, 'DELETE', null, token);
}

export async function createProduct(formData, token) {
  return apiRequest('/api/produits', 'POST', formData, token);
}

export async function updateProduct(id, formData, token) {
  return apiRequest(`/api/produits/${id}`, 'PUT', formData, token);
}

export async function loginAdmin(credentials) {
  return apiRequest('/api/auth/login', 'POST', credentials);
}
