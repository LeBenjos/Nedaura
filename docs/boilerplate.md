# Boilerplate — Guide rapide

## Vue d'ensemble

| Élément | Rôle |
|---|---|
| **`Vue.js`** | UI devant le `LoaderThreeApp` en `HTML` |
| **`LoaderThreeApp`** | View du Loader en `three.js` |
| **`Vue.js`** | UI entre le `LoaderThreeApp` et le `MainThreeApp` en `HTML` |
| **`MainThreeApp`** | View de la scène en `three.js` |

```
        ▲  front (z-index haut)
        │
   ┌────┴──────────────────────────┐
   │   Vue.js  (UI sur Loader)     │
   ├───────────────────────────────┤
   │   LoaderThreeApp  (canvas)    │
   ├───────────────────────────────┤
   │   Vue.js  (UI sur Main)       │
   ├───────────────────────────────┤
   │   MainThreeApp  (canvas)      │
   └────┬──────────────────────────┘
        │
        ▼  back  (z-index bas)
```

---

## 🏁 Start

Tout commence dans `index.html`, qui intègre `main.ts`. Ce dernier initialise l'`Experience`, qui monte à son tour la partie `vue` (pour le `HTML`) et la partie `three`.

Tous les **utils**, **proxies**, **managers** et **assets** doivent être déclarés dans `InitCommand.ts`, qui est instancié **avant** les parties `html` et `three`.

```
index.html
    └── main.ts
            └── Experience
                    ├── InitCommand.ts    ← utils · proxies · managers · assets
                    ├── Vue.js            ← HTML / UI
                    └── Three.js          ← WebGL
```

---

## 🖼️ Vue.js

Le framework `Vue.js` est utilisé pour gérer la partie `HTML` du site. Dans notre expérience il va principalement servir à afficher l'`UI` du site.

**Point d'entrée :** `MainVue.vue`

### 📁 Structure

```
src/experiences/view/vues/[monDossier]
├── MaView.vue              ← la "page"
└── components/
    └── MonComponent.vue    ← éléments composant la "page"
```

Pour créer de nouveaux éléments, on crée des **`view`** (équivalent à des `pages`). Les views possèdent des **`components`**.

> 💡 **Exemple**  
> - Pour une page `loader`, on fait une `view`. 
> - Pour la barre de chargement en `HTML` à l'intérieur, on fait un `component`.

---

## 🎨 Three.js

La librairie `Three.js` est utilisée pour gérer la partie `webgl` du site. Dans notre expérience elle va servir à afficher les scènes et éléments 3D du site.

### 🧱 Les Three App

Une **`ThreeApp`** est une application qui contient :

- une `scene`
- un `renderer`
- une ou plusieurs `camera(s)`
- un ou plusieurs `object3D`

On peut avoir plusieurs `ThreeApp` pour pouvoir superposer les canvas et les gérer séparément.

> 💡 **Exemple**
> - **`LoaderThreeApp`** → pour le loader, afin d'avoir un plane devant tout notre `HTML` en `three.js`, dans un canvas tout au-dessus du `DOM`.
> - **`MainThreeApp`** → pour notre scène principale, avec tous nos `objets3D` à l'intérieur.

### 📦 Ajouter des assets

Dans notre cas, comme on ne dispose que d'une `view` `three.js`, on peut charger les assets dans `InitCommand.ts` avec la méthode `_initThreeSharedAssets()`, en utilisant le `ThreeAssetsManager`.

```
InitCommand.ts
    └── _initThreeSharedAssets()
            └── ThreeAssetsManager
```

### ➕ Ajouter des éléments à la scène

> 📍 **ICI on est dans `MainThreeApp.ts`**

Comme avec `vue.js` on garde le même principe de `view` qui possède des `component`, cette fois-ci appelés `actor`. Dans notre expérience on n'utilisera que **1 `view`** pour `three.js` : **`WorldThreeView.ts`**. On crée les `actors` dans la méthode `_generateActors()` de la `view`.

```
src/experiences/view/threes/
└── WorldThreeView.ts          ← la "view"
        └── _generateActors()
                ├── MonActor            (ThreeActorBase)
                ├── MonModele           (ThreeModelBase)
                └── MonModeleAnime      (ThreeAnimatedModelBase)
```

| Besoin | Classe à utiliser |
|---|---|
| 🎭 Ajouter un objet à la scène | `ThreeActorBase` |
| 📐 Importer un modèle 3D | `ThreeModelBase` |
| 🏃 Importer un modèle 3D animé | `ThreeAnimatedModelBase` |

---

### 🧩 Modules annexes liés à Three

| Module | Rôle | Fichier |
|---|---|---|
| 🎥 **Caméra** | Gère la caméra de l'expérience | `MainThreeCameraController.ts` |
| 🖥️ **Renderer** | Gère le rendu WebGL | `MainThreeRenderer.ts` |
| ✨ **Post-processing** | Ajoute des effets visuels | `MainThreeEffectComposer.ts` |

> ⚠️ **WARNING — Post-processing**
> Pour voir les effets de post-processing, il faut penser à activer `_isPostProcessingActive` dans le `MainThreeRenderer.ts`.

---

## 📏 Autres règles

### 🏷️ Nommage

| Élément | Convention | Exemple |
|---|---|---|
| 📄 Fichier | Toujours au **pluriel** | `components/`, `loaders/` |
| 🔹 Variable / méthode | `camelCase` — `_` si protected/private | `myVar`, `_privateVar` |
| 🔸 Variable / méthode `static` | `PascalCase` — `_` si protected/private | `MyStatic`, `_PrivateStatic` |

### 🏗️ Architecture

- 🧱 **Séparer** au maximum les responsabilités dans le code.
- 📁 **Ranger** au mieux les fichiers dans les bons dossiers.
- 🎛️ Créer et utiliser des **Managers** → éviter les variables / objets globaux.
- 🔒 Créer et utiliser des **constantes & variable `static`** → éviter les *magic strings* / *magic numbers*.

---

## 🐛 Debug Mode

**Activation :**

```
http://localhost:5173/#debug
```

**Raccourcis :**

| Raccourci | Effet |
| --- | --- |
| ⌨️ `Shift + H` | Toggle debug UI + perf monitor |
| 🎥 `Shift + C` | Toggle debug camera (`OrbitControls`) |
| 🕸️ `Shift + W` | Toggle wireframe |
| 🎯 `Ctrl + Click` | Center camera on object |

