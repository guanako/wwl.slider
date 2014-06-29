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
<div class="slider"
	id="slider"
	data-autoplay="true"
	data-transition-delay="1.0"
	data-transition-effect="slide"
>
	<div class="slide">
		<div class="layer z1 image image-cover" style="background-image: url('hello.jpeg')"></div>
		<div class="layer z2 mytext" data-transition-in-effect="fade">Hi! This is a text</div>
	</div>
	<div class="slide">
		<!-- ... -->
	</div>
</div>
```

```javascript
/* The OO way */
var slider = new wwl.slider.Slider(document.getElementById("slider"));

/* The procedural way */
var slider = wwl.slide.create(document.getElementById("slider"));

/* The jQuery way */
var slider = $("#slider").wwlSlider();

/* You can then, if you want... */
slider.next();  /* Nice for an arrow navigation */
slider.show(4); /* Nice for a bullet navigation */
slider.pause();
slider.play();

$("#slider").trigger("next");
$("#slider").trigger("pause");
$("#slider").trigger("play");
```

Documentation
-------------

Notes
-----
