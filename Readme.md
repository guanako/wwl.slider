WWL.Slider
==========

Un système de slides simple mais personnalisable faisant partie de la
collection des widgets web (Web Widget Library).

Le but de ce widget est de rester simple et flexible, vous permettant de
le personnaliser le plus possible.

Installation
------------

Il vous faut d'abord vous procurer une version compilée de ce widget. Le
plus simple est de télécharger la version précompilée, sinon vous devrez
le compiler vous même. L'assemblage des fichiers doit être réalisé en
utilisant JSPP.

Incluez simplement le code compilé dans votre source javascript, où en
incluant directement le fichier dans la page HTML.

Il vous faudra également des styles de base, le plus facile pour cela
est d'utiliser la feuille de styles fournie dans les resources
(n'hésitez pas à modifier le nom des classes).

```html
<head>
	<link rel="stylesheet" href="wwl.slider.css" />
	<script src="wwl.slider.js"></script>
</head>
```

Dépendances
-----------

WWL Slider nécessite un interprêteur JavaScript compabible au minimum
ECMAScript 5, et nécessite les Promises d'ECMAScript 6. Cependant, un
polyfill peut être utilisé, tel que celui-ci:

[https://github.com/jakearchibald/es6-promise](ES6 Promise on Github)

Première utilisation
--------------------

Une fois installé, l'utilisation est très facile :

```html
<div class="wwl-slider">
	<div class="slide"></div>
	<div class="slide"></div>
	<!-- ... -->
</div>
```

Les classes CSS peuvent être changées, en revanche il vous foudra
redéfinir les styles (position absolute, etc.).

```javascript
var slider = wwl.slider.create(document.querySelector(".wwl-slider"));

slider.next();
slider.play();
```

Documentation
-------------

### Concept

Le principe est d'avoir un « Slider » (conteneur HTML), dans lequel se
trouvent des « Slides » qui seront animées.

Dans chacun de ces Slides, vous pouvez rajouter (selon vos souhaits) des
« Layers », c'est à dire des couches que vous pourrez animer séparément
et de manière personnalisée.

La philosophie du Slider WWL est d'avoir un impact minimal sur le DOM et
le reste du code, de faire le minimum fonctionnel, et de vous laisser la
possibilité de personnalier au maximum les animations.

### Instantiation du Slider

Pour voir les paramètres des fonctions, le plus simple et de regarder
directement dans la source.

Toutes les méthodes et propriétés publiques sont celles décrites dans
cette documentation. Les méthodes et propriétés non documentées doivent
être considérées privées.

Vous pouvez instantier le Slider de manière orientée objet :

```javascript
/* Instantiation OO */
var element = document.querySelector(".wwl-slider");
var slider = new wwl.slider.Slider(element);
```

Ou de manière procédurale, grâce au helper qui permet également
d'instantier plusieurs Sliders en une commande :

```javascript
/* querySelector() renvoit un HTMLElement */
var oneElement = document.querySelector(".wwl-slider");
var oneSlider = wwl.slider.create(oneElement);

/* querySelectorAll() renvoit un NodeList<HTMLElement> */
var allElements = document.querySelectorAll(".wwl-slider");
var allSliders = wwl.slider.create(allElements);

allSliders.forEach(function(slider) {
	slider.next();
});
```

Lors de la création, vous pouvez passer un tableau d'options en deuxième
argument (chaque option est facultative) :

```javascript
var slider = wwl.slider.create(element, {
	slideSelector: ".slide",                      /* Le selecteur CSS utilisé pour sélectionner les Slides */
	slideStateClasses: {                          /* Le nom des classes attibuées aux Layers lors des changements d'état de la Slide */
		incoming: "is-incoming",                      /* La Slide entre en scène */
		outgoing: "is-outgoing",                      /* La Slide sort de scène */
		present:  "is-present",                       /* La Slide est sur scène */
		behind:   "is-behind"                         /* La Slide est en coulisses */
	},
	attributes: {                                 /* Les noms des attributs utilisés pour configurer le Slider dans le DOM */
		autoplay:          "data-autoplay",           /* Attribut pour définir si oui ("true") ou non ("false") le slider doit passer les slides automatiquement (play) */
		delay:             "data-delay",              /* Attribut pour définir le temps que chaque Slide reste en scène (si appliqué sur le Slider, ça deviendra la valeur par défaut) */
		animationEffect:   "data-animation",          /* Attribut pour définir l'effet de l'animation (si appliqué sur le Slider, ça deviendra la valeur par défaut) */
		animationEasing:   "data-animation-easing",   /* Attribut pour définir la fonction temporelle de l'animation (si appliqué sur le Slider, ça deviendra la valeur par défaut) */
		animationDuration: "data-animation-duration", /* Attribut pour définir la durée de l'animation (si appliqué sur le Slider, ça deviendra la valeur par défaut) */
	},
	autoplay: false,                              /* Définit si oui ("true") ou non ("false") le slider doit passer les slides automatiquement (play) */
	defaultDelay:             2.0,                /* Définit le temps par défaut (en secondes) que chaque Slide reste en scène */
	defaultAnimationEffect:   "slide",            /* Définit l'effet par défaut de l'animation */
	defaultAnimationEasing:   "ease",             /* Définit la fonction temporelle par défaut de l'animation */
	defaultAnimationDuration: 0.5,                /* Définit la durée (en secondes) par défaut de l'animation */
});
```

Le Slider peut être parametré via des attributs HTML (note : les classes
du Slider peuvent être modifiées, mais il vous faudra alors manuellement
appliquer certains styles par défaut) :

```html
<div class="wwl-slider"
	data-autoplay="false"
	data-delay="2.0"
	data-animation="slide"
	data-animation-easing="ease"
	data-animation-duration="0.5"
><!-- ... --></div>
```

Chaque Slide peut également être parametrée via des attributs HTML :

```html
<div class="slide"
	data-delay="2.0"
	data-animation="slide"
	data-animation-easing="ease"
	data-animation-duration="0.5"
><!-- ... --></div>
```

Et enfin, les Layers au sein de chaque slide ne sont pas paramètrables
via l'HTML, car c'est à vous de leur appliquer les animations que vous
désirez grâce aux classes d'état appliquées au Slide parent.

Exemple d'un texte qui vient du côté droit 200 millisecondes après le
début de la transition de la slide :

```css
@keyframes fx-slide-left {
	0%   { left: 100% }
	100% { left:  50% }
}

.layer {
	display: block;
	position: absolute;
	top: 10%;
	left: 50%;
}

.slide.is-behind .layer {
	display: none;
}

.slide.is-incoming .layer {
	animation: fx-slide-left 0.3s ease-out;
	animation-delay: 0.2s;
}
```

À vous de jouer ensuite avec les animations CSS3, les delays et les
quatre états des Slides afin de créer vos propres animations.

### Commandes du slider

#### Fonctions de déplacement

Avancer/reculer à la slide suivante/précédente (si le nombre en argument
est trop grand ou trop petit, le comptage continue de l'autre côté) :

```javascript
/* Passer à la slide suivante */
slider.next();

/* Avancer de deux slides */
slider.next(3);

/* Passer à la slide précédente */
slider.previous();

/* Reculer de trois slides */
slider.previous(3);

/* Avancer de deux slides */
slide.go(+2);

/* Reculer de trois slides */
slide.go(-3);
```

Afficher une slide spécifique (si l'ID fourni en argument n'existe pas,
une exception sera levée) :

```javascript
/* Retourne le nombre de slides */
var n = slider.countSlides();

/* Retourne la liste ordonnées des ID des slides */
var ids = slider.getSlideIds();

/* Va à la troisième slide (ID = 2) */
slider.show(2);
```

Toutes les fonctions de déplacement sont inactives lors d'une transition
(afin de simplifier la gestion de l'affichage). Si vous désirez
néanmoins mettre un ordre de transition dans une file afin d'être
éxecuté à la fin de la transition en cours, vous devez utiliser les
évènements (ci-dessous). Une queue d'actions pourra être implémentée
dans une version ultérieure du Slider.

Les fonctions de déplacement retournent une Promise native
(ECMAScript 6), qui est résolue à la fin de la transition (ou dès le
début si la transition est nulle), et rejetée si une transition est déjà
en cours.

#### Gestion de l'avancement automatique (autoplay)

Démarrer et arrêter l'avancement automatique du slider :

```javascript
/* Démarrer l'avancement automatique. Si l'avancement automatique est
 * déjà demarré, cette fonction remet le compte à rebourd à zéro. */
slider.play();

/* Arrête l'avancement automatique */
slider.stop();
```

#### Évènements

Des évènements (CustomEvent) sont émis sur l'élement DOM du slider au
début et à la fin de chaque transition :

- SlideTransitionStart (annulable)
- SlideTransitionEnd

Vous pouvez récupérer des informations sur la transition effectuée dans
le détail des évènements (note : l'élément DOM du Slider est accessible via la propriété « dom ») :

```javascript
/* SlideTransitionStart */
slider.dom.addEventListener("SlideTransitionStart", function(event) {
	var currentSlideId = event.detail.currentSlideId;
	var nextSlideId    = event.detail.nextSlideId;
	var direction      = event.detail.direction;

	console.log(currentSlideId, nextSlideId, direction);
}, false);

/* SlideTransitionEnd */
slider.dom.addEventListener("SlideTransitionEnd", function(event) {
	var currentSlideId  = event.detail.currentSlideId;
	var previousSlideId = event.detail.previousSlideId;
	var direction       = event.detail.direction;

	console.log(currentSlideId, previousSlideId, direction);
}, false);
```

Et vous pouvez annuler une transition :

```javascript
slider.dom.addEventListener("SlideTransitionStart", function(event) {
	/* Cancels the transition */
	event.preventDefault();
}, false);
```

À faire
-------

- Traduire de la documentation en anglais

- Vérifier les fonctionnalités ECMAScript et CSS3 nécessaires au
  fonctionnement du slider dès la construction, et lancer une exception
  si ces fonctionnalités ne sont pas disponibles.

- Utiliser les MutationObservers pour gérer l'ajout à chaud de nouvelles
  slides

- Ajout d'une fonction delayUntil() permettant de bloquer l'état en
  cours tant qu'une action n'est pas terminées (utilisant une Promise)
