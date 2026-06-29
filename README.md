# 🧵 JOKANDA — Tissus de Prestige
## Guide d'installation et de configuration

---

## 📁 Structure des fichiers

```
jokanda/
├── index.html              ← Site principal (vitrine)
├── css/
│   ├── style.css           ← Styles du site
│   └── admin.css           ← Styles du dashboard admin
├── js/
│   ├── firebase-config.js  ← Config Firebase (à remplir)
│   ├── main.js             ← JS du site vitrine
│   └── admin.js            ← JS du dashboard admin
└── admin/
    └── index.html          ← Dashboard admin
```

---

## 🔥 Étape 1 — Configurer Firebase

1. Aller sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Créer un nouveau projet (ex: `jokanda-store`)
3. Activer **Firestore Database** (mode production ou test)
4. Dans Paramètres du projet → Vos applications → **Web** → copier la config
5. Ouvrir **`js/firebase-config.js`** et remplacer :

```javascript
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId:         "VOTRE_PROJECT_ID",
  storageBucket:     "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId:             "VOTRE_APP_ID"
};
```

### Règles Firestore (mode développement)
Dans Firebase Console → Firestore → Règles :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{doc} {
      allow read: if true;
      allow write: if true; // À sécuriser en production
    }
  }
}
```

---

## ☁️ Étape 2 — Configurer Cloudinary

1. Créer un compte sur [https://cloudinary.com](https://cloudinary.com) (gratuit)
2. Dans le Dashboard → copier votre **Cloud Name**
3. Aller dans **Settings → Upload → Upload presets** → créer un preset **Unsigned**
4. Ouvrir **`js/admin.js`** et remplacer :

```javascript
const CLOUDINARY_CLOUD  = "votre_cloud_name";
const CLOUDINARY_PRESET = "votre_preset_name";
```

---

## 🔐 Étape 3 — Changer le mot de passe admin

Dans **`js/admin.js`**, ligne 12 :

```javascript
const ADMIN_PASSWORD = "votre_nouveau_mot_de_passe";
```

⚠️ **Important** : En production, utiliser Firebase Authentication plutôt qu'un mot de passe en clair.

---

## 🚀 Étape 4 — Mise en ligne

### Option A — Firebase Hosting (recommandé, gratuit)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option B — Netlify / Vercel
Glisser-déposer le dossier `jokanda/` sur [netlify.com](https://netlify.com)

---

## 📱 Accès

| URL | Description |
|-----|-------------|
| `index.html` | Site vitrine clients |
| `admin/index.html` | Dashboard administration |

---

## 📞 Liens sociaux à configurer

Dans `index.html`, chercher et remplacer :
- `https://wa.me/21600000000` → votre numéro WhatsApp
- `https://facebook.com/jokanda` → votre page Facebook
- `https://instagram.com/jokanda` → votre compte Instagram

---

## 🎨 Personnalisation des couleurs

Dans `css/style.css`, modifier les variables CSS :
```css
:root {
  --cream:  #F8F4EE;    /* Fond principal */
  --gold:   #C4A96B;    /* Couleur or */
  --charcoal: #1C1A18;  /* Noir charbon */
}
```
