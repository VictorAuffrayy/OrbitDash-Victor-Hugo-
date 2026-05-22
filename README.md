# 🛸 OrbitDash — Tableau de Bord Dynamique

> Interface de monitoring ultra-personnalisable avec widgets interactifs, zone de focus centrale et espace d'administration.

---

## 👥 Composition de l'équipe

| Nom & Prénom 
| Victor Auffray
| Hugo Deschamps


---

## 📋 Qui a fait quoi

### Victor — Architecture & Système de Widgets
- Mise en place de l'architecture générale du projet (Vite, React Router, structure des dossiers)
- Création des composants UI génériques : `Button`, `Input`, `Card`, `Badge`
- Développement du `WidgetShell` (conteneur générique gérant les 3 modes d'affichage)
- Développement du `WidgetRenderer` (routing vers le bon widget selon le type)
- Implémentation du système de **Focus** : `FocusContext`, `FocusZone`, `FullscreenOverlay`
- Widgets : `CryptoWidget` (cours en temps réel), `WeatherWidget` (météo)
- Services : `cryptoService.js`, `weatherService.js`
- Gestion du store Zustand (`widgetStore.js`) et du `widgetService.js` (API JSON-Server)

### Hugo — Admin, Widgets Métier & Layout
- Développement de la page **Admin** avec les éditeurs de configuration par widget
- Système d'authentification/rôles (`AuthContext`) avec toggle Admin / Visiteur
- Implémentation du **Drag & Swap** (admin uniquement) via `@dnd-kit` dans `WidgetGrid`
- Widgets : `PollWidget` (sondage interactif), `YoutubeWidget`, `MarmitonWidget` (recettes), `MorpionWidget` (jeu), `Game2048Widget` (jeu 2048)
- Service `mealService.js` pour l'intégration de l'API Marmiton/MealDB
- Mise en place de la configuration `vite.config.js` avec proxy vers JSON-Server
- Stylisation globale (`globals.css`, `index.css`) et CSS Modules de chaque composant

---

## 🚀 Lancer le projet

### Prérequis

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/<votre-repo>/OrbitDash.git
cd OrbitDash
npm install
```

### Démarrage

```bash
npm run dev
```

Cette commande lance **en parallèle** :
- Le serveur Vite (React) sur `http://localhost:5173`
- Le backend JSON-Server sur `http://localhost:3001`

> Le proxy Vite redirige automatiquement `/api/*` vers JSON-Server.

---

## 🗂️ Architecture du projet

```
src/
├── components/
│   ├── layout/          # Navbar, WidgetGrid, FocusZone, FullscreenOverlay
│   ├── ui/              # Composants génériques (Button, Input, Card, Badge)
│   └── widgets/         # WidgetShell, WidgetRenderer + tous les widgets
├── contexts/
│   ├── AuthContext.jsx  # Gestion des rôles (admin / user)
│   └── FocusContext.jsx # Gestion du widget en focus
├── pages/
│   ├── Dashboard.jsx    # Page principale
│   └── Admin.jsx        # Interface d'administration
├── services/            # Couche d'accès aux données (API)
│   ├── widgetService.js
│   ├── cryptoService.js
│   ├── weatherService.js
│   └── mealService.js
└── stores/
    └── widgetStore.js   # Store Zustand (état global des widgets)
```

### Circulation des données

```
Admin (page) → widgetService → JSON-Server (db.json)
                                      ↓
                               widgetStore (Zustand)
                                      ↓
                    Dashboard → WidgetGrid → WidgetShell → Widget
```

---

## 🧩 Widgets disponibles

| Widget | Description | Focusable |
|---|---|---|
| 📊 Sondage | Vote interactif, résultats en focus | Oui |
| 💹 Crypto | Cours BTC/ETH/SOL en direct | Oui |
| 🌤️ Météo | Conditions météo par ville | Oui |
| 🎥 YouTube | Lecteur vidéo embarqué | Oui |
| 🍽️ Marmiton | Recette aléatoire du jour | Oui |
| ❌⭕ Morpion | Jeu Tic-Tac-Toe local | Oui |
| 🎮 2048 | Jeu 2048 interactif | Oui |

---

## ⚙️ Fonctionnalités

### Modes d'affichage des widgets

Chaque widget supporte trois modes :

- **In-place (grille)** — vue compacte avec interaction rapide (ex. voter dans un sondage)
- **Focus (zone centrale)** — vue détaillée chargée au clic, sans quitter le dashboard
- **Fullscreen** — mode plein écran depuis la zone focus

### Espace Administration

Accessible via le bouton **Admin** dans la navbar (toggle de rôle).

L'admin peut :
- Modifier la question et les options d'un sondage
- Réinitialiser les votes
- Changer l'URL d'une vidéo YouTube
- Modifier la ville du widget météo
- **Réorganiser la grille** par Drag & Swap (exclusif admin)

Toutes les modifications sont persistées dans `db.json` et reflétées immédiatement côté utilisateur.

### Drag & Swap (Admin uniquement)

Implémenté avec `@dnd-kit`. En mode admin, les widgets de la grille sont draggables. Déposer un widget sur un autre échange leurs positions. Cette fonctionnalité est verrouillée pour les utilisateurs standards.

---

## 🛠️ Stack technique

| Technologie | Usage |
|---|---|
| React 19 + Vite | Framework et bundler |
| React Router v6 | Navigation (Dashboard / Admin) |
| Zustand | Gestion d'état global (widgets) |
| CSS Modules | Stylisation composant par composant |
| JSON-Server | Backend REST léger (persistance locale) |
| @dnd-kit | Drag & Drop pour le layout admin |
| lucide-react | Icônes |

---

## 📐 Schéma d'architecture des composants

```
App
├── AuthProvider (Context: rôle user/admin)
│   └── FocusProvider (Context: widget focalisé)
│       ├── Navbar
│       ├── Routes
│       │   ├── Dashboard
│       │   │   ├── WidgetGrid
│       │   │   │   └── WidgetShell × N  (mode: inplace)
│       │   │   │       └── <Widget />
│       │   │   └── FocusZone
│       │   │       └── WidgetShell      (mode: focus)
│       │   │           └── <Widget />
│       │   └── Admin
│       │       └── Éditeurs par type de widget
│       └── FullscreenOverlay
│           └── WidgetShell              (mode: fullscreen)
│               └── <Widget />
```

---
