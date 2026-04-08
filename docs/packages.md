# Packages `@benjos`

Deux packages internes sont installés dans le projet : `@benjos/cookware` et `@benjos/spices`. Ils fournissent une boîte à outils TypeScript partagée (managers, tools, utils et constantes DOM/clavier).

> `@benjos/cookware` dépend de `@benjos/spices`. Prérequis : TypeScript ≥ 5.0.

---

## `@benjos/cookware`

Collection d'outils TypeScript (managers singletons, classes instanciables, utilitaires).

Import générique :

```ts
import { /* ... */ } from '@benjos/cookware';
```

### Managers (singletons)

Tous les managers sont des singletons : appeler `.init()` une seule fois au bootstrap de l'app.

#### `DomKeyboardManager`

Gère les événements clavier globaux.

```ts
import { DomKeyboardManager } from '@benjos/cookware';

DomKeyboardManager.init();
DomKeyboardManager.onKeyDown.add((e) => { /* ... */ });
DomKeyboardManager.onKeyUp.add((e) => { /* ... */ });
```

API disponible :
- `onKeyDown` / `onKeyUp` — `Action` déclenchées sur les events clavier.
- `isKeyDown(name: string): boolean` — état d'une touche (par nom ou code).
- `isAnyKeyDown(names: string[]): boolean` — au moins une des touches pressée.
- `areAllKeysDown(names: string[]): boolean` — toutes les touches pressées.

À combiner avec `KeyboardConstant` de `@benjos/spices` pour éviter les strings magiques.

#### `DomPointerManager`

Gestion unifiée des entrées pointeur (souris, touch, stylet) via `PointerEvent`.

```ts
import { DomPointerManager } from '@benjos/cookware';

DomPointerManager.init();
DomPointerManager.onPointerMove.add(() => {
  // DomPointerManager.x / y / normalizedX / normalizedY / centralX / centralY
});
```

API disponible :
- `onPointerMove`, `onPointerDown`, `onPointerUp` — `Action`.
- `x`, `y` — position en pixels.
- `normalizedX`, `normalizedY` — position normalisée (0 → 1).
- `centralX`, `centralY` — position centrée (-1 → 1), utile pour shaders / effets.

#### `DomResizeManager`

Détection du resize de la fenêtre.

```ts
import { DomResizeManager } from '@benjos/cookware';

DomResizeManager.init();
DomResizeManager.onResize.add(() => {
  const { width, height } = DomResizeManager;
});
```

API disponible : `onResize`, `width`, `height`.

#### `TickerManager`

Boucle d'animation basée sur `requestAnimationFrame`.

```ts
import { TickerManager } from '@benjos/cookware';

TickerManager.init();
TickerManager.add((dt) => {
  // dt = delta time en secondes
});

// callback actif même quand la boucle est en pause
TickerManager.add(fn, { alwaysActive: true });
```

Contrôle : `start()`, `stop()`, `pause()`, `play()`.
Getters : `startTime`, `currentTime`, `elapsedTime`, `deltaTime`.

### Tools (classes à instancier)

#### `Action<T extends any[]>`

Système d'événements type-safe (observer pattern). Brique de base utilisée par les managers.

```ts
import { Action } from '@benjos/cookware';

const onUserLogin = new Action<[string, number]>();
onUserLogin.add((username, id) => { /* ... */ });
onUserLogin.execute('John', 42);
```

À privilégier à `EventEmitter` ou aux callbacks custom pour les events inter-modules.

#### `Point`

Point 3D avec méthodes de manipulation.

```ts
import { Point } from '@benjos/cookware';

const p = new Point(10, 20, 30);
const c = p.clone();
p.set(5, 15, 25);
```

#### `Pool<T>`

Pattern object pool générique (réutilisation d'instances). La classe poolée doit exposer `init()` et `reset()`.

```ts
import { Pool, Point } from '@benjos/cookware';

const pool = new Pool(Point, 10); // pré-remplit avec 10 instances
const p = pool.get();
pool.release(p);
```

À utiliser pour tout objet créé/détruit en masse par frame (particules, projectiles, etc.) pour éviter la pression GC.

### Utils (singletons prêts à l'emploi)

#### `AssetUtils`

Gestion centralisée des chemins d'assets avec base path configurable.

```ts
import { AssetUtils } from '@benjos/cookware';

AssetUtils.Init('./myAssetsFolder/'); // optionnel
const path = AssetUtils.GetPath('logo.png'); // "./myAssetsFolder/logo.png"
```

Point d'entrée unique pour tous les chemins d'assets — à utiliser partout plutôt que de hardcoder les chemins.

#### `DomUtils`

Helpers DOM.

```ts
import { DomUtils } from '@benjos/cookware';

const app = DomUtils.GetApp();       // récupère ou crée #app / #root
const loader = DomUtils.GetLoader(); // récupère ou crée #loader
```

---

## `@benjos/spices`

Collection de constantes TypeScript typées (events DOM, touches clavier). Aucune logique, uniquement des enums/constantes.

```ts
import { DomEvent, KeyboardConstant } from '@benjos/spices';
// Types :
import type { DomEventType, KeyboardConstantType } from '@benjos/spices';
```

### `DomEvent`

Constantes typées pour les noms d'events DOM, à utiliser à la place des strings magiques dans `addEventListener` :

- **Mouse** : `CLICK`, `DOUBLE_CLICK`, `MOUSE_DOWN`, `MOUSE_UP`, `MOUSE_MOVE`, …
- **Pointer** : `POINTER_DOWN`, `POINTER_MOVE`, `POINTER_UP`, …
- **Touch** : `TOUCH_START`, `TOUCH_MOVE`, `TOUCH_END`, …
- **Keyboard** : `KEY_DOWN`, `KEY_UP`, `KEY_PRESS`
- **Focus** : `FOCUS`, `BLUR`, `FOCUS_IN`, `FOCUS_OUT`
- **Form** : `CHANGE`, `INPUT`, `SUBMIT`, `RESET`
- **Drag & Drop** : `DRAG`, `DRAG_START`, `DROP`, …
- **Media** : `PLAY`, `PAUSE`, `ENDED`, …
- **Animation** : `ANIMATION_START`, `ANIMATION_END`, …
- **Transition** : `TRANSITION_START`, `TRANSITION_END`, …

### `KeyboardConstant`

Constantes typées pour les codes de touches clavier, à utiliser avec `DomKeyboardManager` :

- Lettres : `A` → `Z`
- Chiffres : `DIGIT_0` → `DIGIT_9`
- Fonctions : `F1` → `F12`
- Navigation : `ARROW_UP`, `ARROW_DOWN`, `ARROW_LEFT`, `ARROW_RIGHT`
- Spéciales : `ENTER`, `ESCAPE`, `TAB`, `BACKSPACE`, …
- Modificateurs : `SHIFT`, `CONTROL`, `ALT`

Exemple combiné :

```ts
import { DomKeyboardManager } from '@benjos/cookware';
import { KeyboardConstant } from '@benjos/spices';

DomKeyboardManager.init();
if (DomKeyboardManager.isKeyDown(KeyboardConstant.SPACE)) {
  // ...
}
```
