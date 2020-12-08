---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 7 - Handy Haversacks
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 7
date: '2020-12-08'
cover_image: /assets/img/covers/xmas_bags.jpg
cover_image_thumbnail: /assets/img/covers/xmas_bags_thumbnail.jpg
cover_image_author: Sebastian Coman Travel
cover_image_author_username: sebcomantravel
---

{% include aoc_header %}

La data provista para el séptimo desafío describe las capacidades de almacenaje de diversas bolsas de distintos colores. Hay bolsas que pueden aceptar una cantidad determinada de bolsas de uno o varios colores en específico. Igualmente hay bolsas que simplement no pueden contener otras bolsas dentro de ellas.

Nuestra misión es determinar la cantidad de bolsas de distintos colores que podrían contener una bolsa de color `shiny gold`.

Consideremos la siguiente data:

```text
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
```

Por ejemplo: si las bolsas de color `bright white` contienen al menos una bolsa `shiny gold`, también debemos buscar qué otras bolsas contienen bolsas `bright white`. En este caso corresponde a las bolsas `light red` y `dark orange`. Así debemos repetir este ejercicio hasta encontrar todas las bolsas que pueden contener (ya sea directamente o dentro de otras bolsas) nuestra bolsa `shiny gold`.

Si representaramos las relaciones entre las bolsas en un sistema de nodos, básicamente tenemos que encontrar todos los nodos ancestros de un nodo en particular.

Pues como ya es costumbre, lo primero que haremos es representar nuestra data en una estructura de datos que nos facilite manipularla.

```javascript
// Retorna una tupla donde el primer elemento tiene el color de la bolsa en cuestión
// y el segundo es un arreglo con todas las bolsas que puede contener
const serializeBag = entry =>
  entry
    .split('bags contain')
    .map((entry, index) => {
      if (index === 0) return entry.trim();

      return entry
        .trim()
        .split(', ')
        .reduce((bagList, bag) => {
          if (bag.includes("no other bags")) return bagList;

          const [ quantity, ...name ] = bag.split(' ');

          return bagList.concat({
            quantity: +quantity,
            name: name.slice(0, -1).join(' ')
          });
        }, []);
    });
```

Con esto es lugar, ya podemos iterar nuestro listado de bolsas e indexar las bolsas padre de cada bolsa:

```javascript
const input =
`light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`;

function indexParentsByBag(input) {
  const indexedBags = new Map(); // Este Map irá desde "nombre de bolsa" a un Set
                                 // de nombres de bolsas padre

  for (let entry of input) {
    const [ bagName, contents ] = serializeBag(entry);

    for (let bag of contents) {
      // Si la bolsa ya está en el Map
      if (indexedBags.has(bag.name)) {
          // Añadimos la bolsa padre al Set
          indexedBags.get(bag.name).add(bagName);
      } else {
          // Si no, creamos el Set
          indexedBags.set(bag.name, new Set([ bagName ]));
      }

    }
  }

  return indexedBags;
}

indexParentsByBag(input.split("\n")); /*

  Map(7) {
    'bright white' => Set(2) { 'light red', 'dark orange' },
    'muted yellow' => Set(2) { 'light red', 'dark orange' },
    'shiny gold' => Set(2) { 'bright white', 'muted yellow' },
    'faded blue' => Set(3) { 'muted yellow', 'dark olive', 'vibrant plum' },
    'dark olive' => Set(1) { 'shiny gold' },
    'vibrant plum' => Set(1) { 'shiny gold' },
    'dotted black' => Set(2) { 'dark olive', 'vibrant plum' }
  }

*/
```

Y luego solo basta con recorrer de manera recursiva nuestro `Map` hasta llegar a los nodos hojas (que no se encuentran en el Map pues no pueden contener bolsas): 

```text
shiny gold => bright white => light red
                           => dark orange
           => muted yellow => light red
                           => dark orange
```

Si contamos los nodos únicos, obtenemos como respuesta 4 bolsas. Nuestra solución final quedaría así:

```javascript
const input =
`light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`;

const serializeBag = entry =>
  entry
    .split('bags contain')
    .map((entry, index) => {
      if (index === 0) return entry.trim();

      return entry
        .trim()
        .split(', ')
        .reduce((bagList, bag) => {
          if (bag.includes("no other bags")) return bagList;

          const [ quantity, ...name ] = bag.split(' ');

          return bagList.concat({
            quantity: +quantity,
            name: name.slice(0, -1).join(' ')
          });
        }, []);
    });

function indexParentsByBag(input) {
  const indexedBags = new Map();

  for (let entry of input) {
    const [ bagName, contents ] = serializeBag(entry);

    for (let bag of contents) {
      if (indexedBags.has(bag.name)) {
          indexedBags.get(bag.name).add(bagName);
      } else {
          indexedBags.set(bag.name, new Set([ bagName ]));
      }

    }
  }

  return indexedBags;
}

const indexedBags = indexParentsByBag(input.split("\n"));

function countParents(bagName) {
  const parents = new Set();

  function iter(bagName) {
    const bags = indexedBags.get(bagName) || [];

    for (let bag of bags) {
      parents.add(bag);
      iter(bag);
    }

    return parents.size;
  }

  return iter(bagName);
}

countParents('shiny gold'); // 4
```

¡Perfecto! Para la data de entrada provista hemos llegado al resultado esperado.

#### Segunda parte

En la segunda parte del desafío tenemos que contar la cantidad concreta de bolsas que una bolsa en particular puede tener.

Por ejemplo, una bolsa `shiny gold` contiene **1** bolsa `dark olive` y **2** bolsas `vibrant plum`, o sea **3** bolsas en total. Pero estas bolsas contienen más bolsas, por ejemplo la bolsa `vibrant plum` contiene **5** bolsas `faded blue` y **6** bolsas `dotted black`, que serían **11** bolsas más, pero como nuestra `shiny gold` contiene 2 bolsas `vibrant plum`, entonces en total serían 22 bolsas en ese nodo. Hagamos un diagrama para entender esto más fácilmente:

```text
shiny gold x1 => dark olive x1   => faded blue   x3 => {}
                                 => dotted black x4 => {}
                                    total : 3 + 4
                 total : 1 + 1 * ( 3 + 4 )

              => vibrant plum x2 => faded blue   x5 => {}
                                 => dotted black x6 => {}
                                    total : 5 + 6
                 total : 2 + 2 * ( 5 + 6 )

total : 1 + 1 * ( 3 + 4 ) + 2 + 2 * ( 5 + 6 )
total : 32
```

Entonces una bolsa `shiny gold` puede contener hasta 32 bolsas dentro de ella.

El ejercicio acá es muy parecido al anterior, salvo que ahora debemos agrupar las bolsas por sus contenidos y recursivamente contar cuantas bolsas contiene cada bolsa.

Analicemos nuestra solución final:

```javascript
const input =
`light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`;

// El mismo serializeBag de la primera parte
const serializeBag = entry =>
  entry
    .split('bags contain')
    .map((entry, index) => {
      if (index === 0) return entry.trim();

      return entry
        .trim()
        .split(', ')
        .reduce((bagList, bag) => {
          if (bag.includes("no other bags")) return bagList;

          const [ quantity, ...name ] = bag.split(' ');

          return bagList.concat({
            quantity: +quantity,
            name: name.slice(0, -1).join(' ')
          });
        }, []);
    });

// Crea un diccionario con las bolsas y sus contenidos
const indexBags = input =>
  input
    .reduce((bagIndex, entry) => {
      const [ bagName, contents ] = serializeBag(entry);
      return Object.assign(
          bagIndex,
          { [bagName]: contents }
      )
    }, {});

const indexedBags = indexBags(input.split("\n"));

// Cuenta el total de bolsas
function countTotalChildrenBags(bagName) {
    let totalBags = 0;

    function iter(bagName) {
        const bags = indexedBags[bagName];
        let innerBags = 0;

        for (let bag of bags) {
            innerBags = innerBags + bag.quantity + bag.quantity * (iter(bag.name));
        }

        return totalBags + innerBags;
    }

    return iter(bagName);
}

countTotalChildrenBags('shiny gold'); // 32
```


Y listo, con esto hemos resuelto el desafío del séptimo día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
