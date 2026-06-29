// ═══════════════════════════════════════════════════
// JOKANDA — Admin Dashboard JS
// Sécurité : Firebase Authentication (email + mdp)
// ═══════════════════════════════════════════════════

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { db, auth } from "../js/firebase-config.js";

// ─────────────────────────────────────────────────────
// ⚠️  CLOUDINARY — REMPLACER PAR VOS VRAIES VALEURS
// ─────────────────────────────────────────────────────
const CLOUDINARY_CLOUD  = "dqctuug18";
const CLOUDINARY_PRESET = "Jokanda_preset";

const CATEGORY_LABELS = {
  satin:        "Satin",
  mousseline:   "Mousseline",
  dentelle:     "Dentelle",
  tulle_brodee: "Tulle Brodée",
  tulle_uni:    "Tulle Uni",
  contil:       "Contil",
  galon:        "Galon",
  velours:      "Velours",
  crepe:        "Crêpe",
  organza:      "Organza",
  qamariya:     "Qamariya",
  acetate:      "Acétate",
  taffetas:     "Taffetas",
};

// ══════════════════════════════════════════════════════
// AUTH — Firebase Authentication
// ══════════════════════════════════════════════════════

// Surveille l'état de connexion en temps réel
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Utilisateur connecté → afficher le panel admin
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminPanel").style.display  = "flex";
    document.getElementById("adminUserEmail").textContent = user.email;
    loadProducts();
  } else {
    // Non connecté → afficher l'écran de login
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminPanel").style.display  = "none";
  }
});

// Connexion avec email + mot de passe Firebase
window.login = async function () {
  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const errorDiv = document.getElementById("loginError");
  const btnText  = document.getElementById("loginBtnText");
  const btn      = document.getElementById("loginBtn");

  errorDiv.style.display = "none";

  if (!email || !password) {
    errorDiv.textContent   = "Veuillez remplir l'email et le mot de passe.";
    errorDiv.style.display = "block";
    return;
  }

  btn.disabled   = true;
  btnText.textContent = "Connexion en cours…";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged prend le relais et affiche l'admin
  } catch (err) {
    btn.disabled   = false;
    btnText.textContent = "Connexion";

    // Messages d'erreur clairs en français
    const messages = {
      "auth/invalid-email":          "Adresse email invalide.",
      "auth/user-not-found":         "Aucun compte trouvé avec cet email.",
      "auth/wrong-password":         "Mot de passe incorrect.",
      "auth/invalid-credential":     "Email ou mot de passe incorrect.",
      "auth/too-many-requests":      "Trop de tentatives. Réessayez dans quelques minutes.",
      "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion internet.",
    };

    errorDiv.textContent   = messages[err.code] || `Erreur : ${err.message}`;
    errorDiv.style.display = "block";
  }
};

// Déconnexion
window.logout = async function () {
  await signOut(auth);
};

// Touche Entrée sur les champs
document.getElementById("passwordInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") window.login();
});
document.getElementById("emailInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("passwordInput")?.focus();
});

// ══════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════
window.showTab = function (tabName) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById(`tab-${tabName}`)?.classList.add("active");
  document.querySelectorAll(`.nav-item[onclick*="${tabName}"]`).forEach(btn => btn.classList.add("active"));
  if (tabName === "add" && !document.getElementById("editProductId").value) resetForm();
};

// ══════════════════════════════════════════════════════
// PRODUITS — Lecture
// ══════════════════════════════════════════════════════
let productsCache = [];

async function loadProducts() {
  const wrap = document.getElementById("productsTable");
  wrap.innerHTML = `<div class="loading-msg">Chargement des produits…</div>`;
  try {
    const q    = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    productsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable(productsCache);
  } catch (err) {
    console.error(err);
    wrap.innerHTML = `<div class="loading-msg">Erreur : ${err.message}</div>`;
  }
}

function renderTable(products) {
  const wrap = document.getElementById("productsTable");
  if (!products.length) {
    wrap.innerHTML = `<div class="loading-msg">Aucun produit. <button onclick="showTab('add')" style="color:var(--gold);background:none;border:none;cursor:pointer;font-size:inherit;">Ajouter le premier →</button></div>`;
    return;
  }

  const rows = products.map(p => {
    const imgCell = p.imageUrl
      ? `<img class="table-img" src="${p.imageUrl}" alt="${p.name}" />`
      : `<div class="table-img-placeholder"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>`;
    const catLabel = CATEGORY_LABELS[p.category] || p.category || "—";
    const desc     = p.description ? p.description.substring(0, 60) + (p.description.length > 60 ? "…" : "") : "—";
    return `
      <tr>
        <td>${imgCell}</td>
        <td><strong>${p.name}</strong></td>
        <td><span class="table-cat">${catLabel}</span></td>
        <td style="max-width:220px;color:var(--charcoal-soft);font-size:0.82rem">${desc}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" title="Modifier" onclick="editProduct('${p.id}')">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <button class="btn-icon" title="Supprimer" onclick="openDeleteModal('${p.id}')" style="color:var(--danger)">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  wrap.innerHTML = `
    <div class="products-table-wrap">
      <table class="products-table">
        <thead>
          <tr>
            <th>Image</th><th>Nom</th><th>Catégorie</th><th>Description</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ══════════════════════════════════════════════════════
// PRODUITS — Édition
// ══════════════════════════════════════════════════════
window.editProduct = function (id) {
  const product = productsCache.find(p => p.id === id);
  if (!product) return;

  document.getElementById("editProductId").value   = id;
  document.getElementById("productName").value      = product.name || "";
  document.getElementById("productCategory").value  = product.category || "";
  document.getElementById("productDesc").value      = product.description || "";
  document.getElementById("imageUrl").value         = product.imageUrl || "";

  if (product.imageUrl) {
    document.getElementById("imagePreview").src           = product.imageUrl;
    document.getElementById("imagePreview").style.display = "block";
    document.getElementById("uploadPlaceholder").style.display = "none";
  }

  document.getElementById("formTitle").textContent   = "Modifier le Produit";
  document.getElementById("formSubtitle").textContent = "Mettez à jour les informations";
  document.getElementById("saveBtnText").textContent  = "Enregistrer les modifications";
  showTab("add");
};

window.resetForm = function () {
  document.getElementById("editProductId").value              = "";
  document.getElementById("productName").value                = "";
  document.getElementById("productCategory").value            = "";
  document.getElementById("productDesc").value                = "";
  document.getElementById("imageUrl").value                   = "";
  document.getElementById("imageFile").value                  = "";
  document.getElementById("imagePreview").style.display       = "none";
  document.getElementById("uploadPlaceholder").style.display  = "flex";
  document.getElementById("formError").style.display          = "none";
  document.getElementById("formSuccess").style.display        = "none";
  document.getElementById("formTitle").textContent            = "Ajouter un Produit";
  document.getElementById("formSubtitle").textContent         = "Remplissez les informations du nouveau tissu";
  document.getElementById("saveBtnText").textContent          = "Enregistrer le produit";
};

// ══════════════════════════════════════════════════════
// IMAGE — Prévisualisation & upload Cloudinary
// ══════════════════════════════════════════════════════
window.previewImage = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("imagePreview").src           = e.target.result;
    document.getElementById("imagePreview").style.display = "block";
    document.getElementById("uploadPlaceholder").style.display = "none";
  };
  reader.readAsDataURL(file);
};

const uploadArea = document.getElementById("uploadArea");
if (uploadArea) {
  uploadArea.addEventListener("dragover",  e => { e.preventDefault(); uploadArea.style.borderColor = "var(--gold)"; });
  uploadArea.addEventListener("dragleave", () => { uploadArea.style.borderColor = ""; });
  uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.style.borderColor = "";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const dt = new DataTransfer();
      dt.items.add(file);
      document.getElementById("imageFile").files = dt.files;
      window.previewImage(document.getElementById("imageFile"));
    }
  });
  uploadArea.addEventListener("click", () => document.getElementById("imageFile").click());
}

async function uploadToCloudinary(file) {
  const progressWrap = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const uploadStatus = document.getElementById("uploadStatus");

  progressWrap.style.display = "block";
  progressFill.style.width   = "0%";
  uploadStatus.textContent   = "Téléchargement en cours…";

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`);

    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        progressFill.style.width = `${pct}%`;
        uploadStatus.textContent = `Téléchargement… ${pct}%`;
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        progressFill.style.width = "100%";
        uploadStatus.textContent = "Image téléchargée ✓";
        resolve(data.secure_url);
      } else {
        reject(new Error("Erreur Cloudinary : " + xhr.statusText));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau lors du téléchargement."));
    xhr.send(formData);
  });
}

// ══════════════════════════════════════════════════════
// PRODUITS — Sauvegarde (création / mise à jour)
// ══════════════════════════════════════════════════════
window.saveProduct = async function () {
  const errorDiv  = document.getElementById("formError");
  const successDiv = document.getElementById("formSuccess");
  const saveBtn   = document.querySelector("#tab-add .btn-primary");

  errorDiv.style.display   = "none";
  successDiv.style.display = "none";

  const name      = document.getElementById("productName").value.trim();
  const category  = document.getElementById("productCategory").value;
  const desc      = document.getElementById("productDesc").value.trim();
  const editId    = document.getElementById("editProductId").value;
  const fileInput = document.getElementById("imageFile");

  if (!name)     { showError("Le nom du produit est requis.");       return; }
  if (!category) { showError("Veuillez choisir une catégorie.");     return; }

  saveBtn.disabled = true;
  document.getElementById("saveBtnText").textContent = "Enregistrement…";

  try {
    let imageUrl = document.getElementById("imageUrl").value;

    if (fileInput.files[0]) {
      imageUrl = await uploadToCloudinary(fileInput.files[0]);
    }

    const productData = { name, category, description: desc, imageUrl: imageUrl || "" };

    if (editId) {
      await updateDoc(doc(db, "products", editId), { ...productData, updatedAt: serverTimestamp() });
      showSuccess("✅ Produit mis à jour avec succès !");
    } else {
      await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
      showSuccess("✅ Produit ajouté avec succès !");
      resetForm();
    }

    await loadProducts();
  } catch (err) {
    console.error(err);
    showError("Erreur : " + err.message + (err.code ? ` [${err.code}]` : ""));
  } finally {
    saveBtn.disabled = false;
    document.getElementById("saveBtnText").textContent =
      document.getElementById("editProductId").value ? "Enregistrer les modifications" : "Enregistrer le produit";
    document.getElementById("uploadProgress").style.display = "none";
  }
};

function showError(msg) {
  const el = document.getElementById("formError");
  el.textContent   = msg;
  el.style.display = "block";
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showSuccess(msg) {
  const el = document.getElementById("formSuccess");
  el.textContent   = msg;
  el.style.display = "block";
}

// ══════════════════════════════════════════════════════
// SUPPRESSION
// ══════════════════════════════════════════════════════
let deleteTargetId = null;

window.openDeleteModal  = id  => { deleteTargetId = id; document.getElementById("deleteModal").style.display = "flex"; };
window.closeDeleteModal = ()  => { deleteTargetId = null; document.getElementById("deleteModal").style.display = "none"; };

window.confirmDelete = async function () {
  if (!deleteTargetId) return;
  try {
    await deleteDoc(doc(db, "products", deleteTargetId));
    closeDeleteModal();
    await loadProducts();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la suppression : " + err.message);
  }
};
