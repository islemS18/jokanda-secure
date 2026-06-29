// ═══════════════════════════════════════════
// JOKANDA — Main Storefront JS
// ═══════════════════════════════════════════

import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy, limit, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── CATEGORIES DATA ──────────────────────────
const CATEGORIES = [
  { ar: "ساتان",    fr: "Satin",         id: "satin" },
  { ar: "موسلين",   fr: "Mousseline",    id: "mousseline" },
  { ar: "دانتيل",   fr: "Dentelle",      id: "dentelle" },
  { ar: "تول مطروز",fr: "Tulle Brodée",  id: "tulle_brodee" },
  { ar: "تول سادة", fr: "Tulle Uni",     id: "tulle_uni" },
  { ar: "كونتيل",   fr: "Contil",        id: "contil" },
  { ar: "حرج",      fr: "Galon",         id: "galon" },
  { ar: "فلور",     fr: "Velours",       id: "velours" },
  { ar: "كريب",     fr: "Crêpe",         id: "crepe" },
  { ar: "اوركنزا",  fr: "Organza",       id: "organza" },
  { ar: "قمريا",    fr: "Qamariya",      id: "qamariya" },
  { ar: "اسيتات",   fr: "Acétate",       id: "acetate" },
  { ar: "تفتة",     fr: "Taffetas",      id: "taffetas" },
];

// ── HEADER SCROLL ────────────────────────────
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
});

// ── MOBILE MENU ──────────────────────────────
const burgerBtn  = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
burgerBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
window.closeMobileMenu = () => mobileMenu.classList.remove("open");

// ── REVEAL ANIMATIONS ────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// ── RENDER CATEGORIES ────────────────────────
function renderCategories() {
  const grid = document.getElementById("categoriesGrid");
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="cat-card" onclick="filterByCategory('${cat.id}')">
      <span class="cat-name-ar">${cat.ar}</span>
      <span class="cat-name-fr">${cat.fr}</span>
    </div>
  `).join("");
}

// ── FILTER BAR ───────────────────────────────
function renderFilterBar() {
  const bar = document.getElementById("filterBar");
  const btns = CATEGORIES.map(cat =>
    `<button class="filter-btn" data-cat="${cat.id}" onclick="filterByCategory('${cat.id}')">${cat.fr}</button>`
  ).join("");
  bar.innerHTML = `<button class="filter-btn active" data-cat="all" onclick="filterByCategory('all')">Tous</button>${btns}`;
}

window.filterByCategory = function(catId) {
  // scroll to products
  document.getElementById("produits").scrollIntoView({ behavior: "smooth" });
  // update buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === catId);
  });
  // filter shown products
  document.querySelectorAll("#allProductsGrid .product-card").forEach(card => {
    const show = catId === "all" || card.dataset.category === catId;
    card.style.display = show ? "" : "none";
  });
};

// ── PRODUCT CARD HTML ─────────────────────────
function productCardHTML(product, badge = "") {
  const imgContent = product.imageUrl
    ? `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy" />`
    : `<div class="product-img-placeholder">
         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
         <span>Image à venir</span>
       </div>`;

  const cat = CATEGORIES.find(c => c.id === product.category);
  const catLabel = cat ? cat.fr : product.category || "";

  return `
    <div class="product-card" data-category="${product.category || ''}" onclick="openLightbox('${product.id}')">
      <div class="product-img-wrap">
        ${imgContent}
        ${badge ? `<span class="product-badge">${badge}</span>` : ""}
      </div>
      <div class="product-info">
        <p class="product-cat">${catLabel}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description || ""}</p>
      </div>
    </div>
  `;
}

// ── LOAD NEW ARRIVALS ─────────────────────────
async function loadNewArrivals() {
  const grid = document.getElementById("newArrivalsGrid");
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
    const snap = await getDocs(q);
    if (snap.empty) {
      grid.innerHTML = `<div class="loading-msg">Aucun produit disponible pour le moment.</div>`;
      return;
    }
    grid.innerHTML = snap.docs.map(doc =>
      productCardHTML({ id: doc.id, ...doc.data() }, "Nouveau")
    ).join("");
  } catch (err) {
    console.error("Error loading new arrivals:", err);
    grid.innerHTML = `<div class="loading-msg">Erreur de chargement. Vérifiez la configuration Firebase.</div>`;
  }
}

// ── LOAD ALL PRODUCTS ─────────────────────────
let allProducts = [];

async function loadAllProducts() {
  const grid = document.getElementById("allProductsGrid");
  try {
    const snap = await getDocs(collection(db, "products"));
    if (snap.empty) {
      grid.innerHTML = `<div class="loading-msg">Aucun produit disponible pour le moment.</div>`;
      return;
    }
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    grid.innerHTML = allProducts.map(p => productCardHTML(p)).join("");
  } catch (err) {
    console.error("Error loading products:", err);
    grid.innerHTML = `<div class="loading-msg">Erreur de chargement. Vérifiez la configuration Firebase.</div>`;
  }
}

// ── LIGHTBOX ─────────────────────────────────
const lightbox        = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxClose   = document.getElementById("lightboxClose");

window.openLightbox = function(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const cat = CATEGORIES.find(c => c.id === product.category);
  const catLabel = cat ? `${cat.fr} — ${cat.ar}` : product.category || "";

  const imgHTML = product.imageUrl
    ? `<img class="lightbox-img" src="${product.imageUrl}" alt="${product.name}" />`
    : `<div class="lightbox-img-placeholder">
         <svg width="60" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.3"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
       </div>`;

  lightboxContent.innerHTML = `
    ${imgHTML}
    <div class="lightbox-details">
      <p class="lightbox-cat">${catLabel}</p>
      <h2 class="lightbox-name">${product.name}</h2>
      <div class="lightbox-divider"></div>
      <p class="lightbox-desc">${product.description || "Aucune description disponible."}</p>
    </div>
  `;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
};

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

// ── INIT ─────────────────────────────────────
renderCategories();
renderFilterBar();
loadNewArrivals();
loadAllProducts();
