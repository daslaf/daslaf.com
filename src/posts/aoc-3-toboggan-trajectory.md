---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 3 - Toboggan Trajectory
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 3
date: '2020-12-04'
cover_image: /assets/img/covers/mountain.jpg
cover_image_thumbnail: /assets/img/covers/mountain_thumbnail.jpg
cover_image_author: Tamas Tuzes-Katai
cover_image_author_username: tamas_tuzeskatai
---

{% include aoc_header %}

El enunciado de este problema es bastane largo por lo que intentaré explicarlo de forma concisa. El desafío consta en recorrer una matriz de `n` filas por `m` columnas (el mapa de un bosque, compuesto de senderos y árboles), partiendo desde la esquina superior izquierda. Dada la naturaleza generativa de los bosques, el patrón se repite horizontalmente hacia el infinito.

Consideremos la siguiente data de entrada:

```
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
```

Los puntos (`.`) marcan los senderos y los signos gato (`#`) señalan donde hay árboles.

Recorreremos el patrón de forma constante, moviéndonos desde el punto de partida `3` espacios a la derecha y `1` hacia abajo. Dicho esto, podemos marcar todos los puntos que forman nuestra trayectoria en un diagrama, señalando con una `O` donde hay sendero (`.`) y con una `X` donde hay un árbol (`#`).

```
|- rep 1 -||- rep 2 -||- rep 3 -||-  etc  -|
O.##.........##.........##....... -------->
#..O#...#..#...#...#..#...#...#..
.#....X..#..#....#..#..#....#..#.
..#.#...#O#..#.#...#.#..#.#...#.#
.#...##..#..X...##..#..#...##..#.
..#.##.......#.X#.......#.##..... -------->
.#.#.#....#.#.#.#.O..#.#.#.#....#
.#........#.#........X.#........#
#.##...#...#.##...#...#.X#...#...
#...##....##...##....##...#X....#
.#..#...#.#.#..#...#.#.#..#...X.# -------->
```

Debemos contar la cantidad de árboles que nos encontramos en nuestro recorrido hacia el final del mapa. Para este mapa, la cantidad de árboles es 7.

En esta ocasión utilizaremos recursión para recorrer nuestro mapa.

#### Una palabrita sobre recursividad

Una función recursiva es una función que se llama así misma. Cualquier proceso iterativo se puede describir por medio de recursividad. Por ejemplo podemos implementar una versión de `Array.prototype.map` utilizando solamente recursividad:

```javascript
function reallyInefficcientMap(projectionFn, collection) {
  const [ first, ...rest ] = collection;

  return [
    projectionFn(first),
    ...(
      rest.length === 0
        ? []
        : reallyInefficcientMap(projectionFn, rest)
    )
  ];
}

reallyInefficcientMap(n => n + 1, [1, 2, 3, 4]); // [2, 3, 4, 5]
```

Si bien esta función cumple su acometido, es extremandamente ineficiente. Podemos comprobarlo haciendo un pequeño benchmark entre `Array.prototype.map` y nuestro `map`, y ver la diferencia en el tiempo de ejecución de ambas funciones.

```javascript
// Generamos un set de datos con diez mil entradas
const data = Array(10000)
  .fill('')
  .map((_, i) => i);

console.time('Native map');
data.map((n) => n + 1);
console.timeEnd('Native map');
// ⏰  Native map: 0.344970703125 ms

console.time('Really inefficient map');
reallyInefficcientMap(n => n + 1, data);
console.timeEnd('Really inefficient map');
// ❌ |> Uncaught RangeError: Maximum call stack size exceeded -> Oopsie 🙊
```

Nuestra función es tan ineficiente que de hecho el navegador colapsa porque la pila de llamadas se llenó y nos hemos quedado sin memoria.

El problema de nuestra implementación de `reallyInefficcientMap` es que cada vez que asignamos una variable dentro del cuerpo de la función, estamos distribuyendo memoria que se mantendrá ocupada hasta que la función recursiva haya terminado de ejecutarse y el motor de JavaScript pueda hacer *garbage collection* (o en otras palabras liberar la memoria que estaba siendo ocupada). 

Por ejemplo:

```javascript
reallyInefficcientMap(n => n + 1, data);
/**
 * Contexto de ejecución
 * 
 * reallyInefficcientMap
 *    args[0]: n => n + 1
 *    args[1]: [0, 1, 2, ... 9999]
 * 
 * La función `reallyInefficcientMap` es invocada. Internamente se crean las variables
 * `first` y `rest` dentro del contexto de ejecución, que almacenarán el
 * primer elemento de la colección y el resto de la colección respectivamente.
 */

const [ first, ...rest ] = collection;

/**
 * Luego retornamos un arreglo nuevo aplicando la función de proyección con
 * `first` como primer elemento e invocamos nuevamente a `reallyInefficcientMap`
 * con el resto de la colección (si quedan elementos en ella).
 */ 
return [
  projectionFn(first),
  ...(
    rest.length === 0
      ? []
      : reallyInefficcientMap(projectionFn, rest)
  )
];
```

Toda la memoria que hemos alocado antes de llamar a nuestra función nuevamente, estará ocupada. Como este proceso iterativo se repite hasta que termine la recursión, es entendible que nos quedemos sin memoria disponible antes de que termine la recursión.

En ciertos lenguajes de programación el compilador puede optimizar una función recursiva si es que esta es una función recursiva de cola. Es decir, si lo último que hace la función es llamarse a sí misma.

<p class="disclaimer">⚠️ Desafortunadamente los browsers y motores de JavaScript no implementan optimizaciones de recursividad de cola, por lo que debemos guardar mucho cuidado en la <em>performance</em> de nuestro programa al decidir resolver un problema utilizando recursividad.</p>

Dicho eso, sigamos con la resolución de nuestro problema. Utilizando lo que ya sabemos de recursión nuestra solución se vería así:

```javascript
const input =
`..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`;

const Point = {
  Empty: '.',
  Tree: '#',
  isTree: point => point === Point.Tree
}

const Slope = {
  Right: 3,
  Down: 1,
}

function run(input) {
  const rows = input.split('\n');
  const colWidth = rows[0].length;

  // Definimos una función que nos ayudará a recorrer fila por fila
  // nuestro mapa
  function goToNextRow(rows, colPosition, foundTrees) {
      // Si ya no quedan filas por recorrer, retornamos los árboles
      // encontrados
      if (!rows[0]) return foundTrees;

      const content = rows[0][colPosition];

      return goToNextRow(
        // Como debemos movernos hacia la siguiente fila, básicamente
        // estamos acortando el mapa por la cantidad determinada por Slope.Down
        rows.slice(Slope.Down),

        // Para calcular la posición de la columna en la que quedaremos,
        // podemos usar el operador módulo. Si `colPosition + Slope.Right`
        // es mayor o igual al ancho de la columna, significa que ya nos
        // hemos desbordado del mapa por la derecha. El módulo nos dice 
        // básicamente por cuantas casillas nos hemos desbordado.
        (colPosition + Slope.Right) % colWidth,

        // Si el sitio al que llegamos tenía un árbol, incrementamos la cantidad
        Point.isTree(content) ? foundTrees + 1 : foundTrees
      );
  }

  // Partimos en la posición en la esquina superior izquierda con 0 árboles encontrados
  return goToNextRow(rows, 0, 0);
}

run(input); // 7
```

Perfecto! Para la data de entrada provista hemos llegado al resultado esperado.

### Segunda parte

En la segunda parte del desafío debemos aplicar distintos *slopes* en los que nos podemos mover a través del map, y luego obtener el producto entre todos los árboles encontrados para cada *slope*.

Lo único que debemos cambiar en nuestra función `run` es que ahora le pasamos el slope como parámetro. El resto de nuestra función queda exactamente igual:

```javascript
function run(input, slope) {
  const rows = input.split('\n');
  const colWidth = rows[0].length;

  function goToNextRow(rows, colPosition, foundTrees) {
      if (!rows[0]) return foundTrees;

      const content = rows[0][colPosition];

      return goToNextRow(
        rows.slice(slope.Down),
        (colPosition + slope.Right) % colWidth,
        Point.isTree(content) ? foundTrees + 1 : foundTrees
      );
  }

  return goToNextRow(rows, 0, 0);
}
```

Para obtener el producto de los árboles, podríamos hacerlo igualmente (ya lo entendiste) con recursividad!

```javascript
function getProduct([ trees, ...rest ]) {
  if (rest.length === 0) return trees;

  return trees * getProduct(rest);
}

getProduct([
  run(input, { Right: 1, Down: 1}),
  run(input, { Right: 3, Down: 1}),
  run(input, { Right: 5, Down: 1}),
  run(input, { Right: 7, Down: 1}),
  run(input, { Right: 1, Down: 2}),
]); // 336
```

Y listo, con esto hemos resuelto el desafío del tercer día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

---

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
