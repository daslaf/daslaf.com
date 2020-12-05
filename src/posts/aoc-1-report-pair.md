---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 1 - Report Repair
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 1
date: '2020-12-01'
cover_image: /assets/img/covers/aoc.jpg
cover_image_thumbnail: /assets/img/covers/aoc_thumbnail.jpg
cover_image_author: JESHOOTS.COM
cover_image_author_username: jeshoots
---

{% include aoc_header %}

El primer desafío de AOC consiste en calcular el producto de dos números en un listado cuya suma sea `2020`. Por ejemplo, consideremos el siguiente listado de números:

```javascript
const nums = [ 1721, 979, 366, 299, 675, 1456 ];
```

En este caso `1721` y `979` suman `2020`. El resultado esperado es el producto de ambos números, `1721 * 299 = 514579`, por lo tanto `514579` es nuestro resultado.

La forma más simple de resolver el ejercicio sería implementando una función que itere el listado, partiendo por el primer número (índice 0) y buscar la diferencia de `2020` con este en el resto de los números (a partir del índice 1).

De encontrar dicho número, nuestra función retorna el producto de ambos números.

De no encontrarlo, pasamos al siguiente número del listado (índice 1) y repetimos el proceso, esta vez a partir del número contiguo (índice 2). Así seguimos buscando la diferencia del número en el índice `n` a partir del índice `n + 1` hasta que demos con el número indicado.

Una implementación imperativa puede lucir así:

```javascript
function getProduct(list) {
    for (let i = 0; i < list.length; i++) {
        const target = 2020 - list[i];

        for (let j = i + 1; j < list.length ; j++) {
            if (target === list[j]) return list[i] * list[j];
        }
    }
}
```

Si bien esta implementación es correcta tiene un problema de *performance*. Para hacer visible este problema, vamos a tener un contador con la cantidad iteraciones que realiza nuestra función para encontrar el resultado.

```javascript
function getProduct(list) {
    let iter = 0;

    for (let i = 0; i < list.length; i++) {
        const target = 2020 - list[i];

        for (let j = i + 1; j < list.length ; j++) {
            iter++;

            if (target === list[j]) {
                console.log(`Total iterations : ${iter}`)
                return list[i] * list[j];
            }
        }
    }
}
```

Si ejecutamos nuestro ejemplo con el set de datos del ejemplo, podemos ver que nuestro código toma tres iteraciones:

```javascript
const nums = [ 1721, 979, 366, 299, 675, 1456 ];

getProduct(nums);
// Total iterations : 3
```

Pero esto cambia drásticamente si ahora nuestros números se encontraran al final de la lista:

```javascript
const nums = [ 979, 366, 675, 1456, 1721, 299 ];

getProduct(nums);
// Total iterations : 15
```

Esto se conoce como Complejidad de Computo. Si alguna vez has oído sobre *Big O Notation* pues bien, de esto se trata. *Big O* no es más que un sistema para medir la tasa de crecimiento de un algoritmo.

Según [este excelente artículo](https://jarednielsen.com/big-o-quadratic-time-complexity/), nuestra implementación tiene complejidad cuadrática, es decir, que la cantidad de cómputos que realice nuestro algoritmo, va a crecer al cuadrado según crezca la cantidad de elementos la lista.

> Si ejecutaramos nuestro algoritmo con una lista de 200 entradas y sucediera que los números que buscamos están ambos al final de la lista, nuestro algoritmo iteraría 19.900 veces 🤯.

#### Mejorando performance

Para reducir la complejidad de computo de nuestro algoritmo, podemos replantear como resolver nuestro problema fiándonos en el hecho de que al iterar la colección sabemos efectivamente cuál es el complemento que estamos buscando. La diferencia es que ahora en vez de buscarlo en el resto de la colección, sólo lo buscaremos dentro de los números que ya hayamos visitado.

La gracia es que si no encontramos el complemento `m` de un número `n` en el registro de números que ya hemos visitado, cuando sea turno de `m` en nuestra interación, ya tendremos a `n` en nuestro registro y por lo tanto podemos retornar el producto de `n * m`.

Igualmente para hacer de esta búsqueda más rápida, indexaremos nuestros números en una estructura de datos que nos permita acceder a ellos en tiempo constante, como por ejemplo en un objeto. No importa a cuál de sus propiedades de un objeto queramos acceder, la operación siempre va a tener una complejidad constante.

Nuestra implementación se vería así:

```javascript
function getProduct(list) {
    const nums = {};

    for (let num of list) {
        const expected = 2020 - num;

        if (nums[expected]) return num * expected;

        nums[num] = num;
    }
}
```

Y voilá, ahora `getProduct` es eficiente y tiene complejidad lineal. Si aplicamos nuestra función con la [data de entrada](https://adventofcode.com/2020/day/1/input) del desafío, obtenemos `1018336` como respuesta.

#### Segunda parte

La segunda parte del desafío añade un poco más de complejidad, ya que ahora debemos encontrar tres números que cumplan con la regla, por ejemplo: 979, 366 y 675. Esto significa que el complemento para `n` ya no es un número `m` que podemos encontrar en la lista, sino que la suma de `l` y `m`, o sea dos números del listado.

Para conseguir nuestro acometido podemos implementar una función auxiliar (muy similar a `getProduct`) que nos retorne una tupla de números cuya suma sea igual al complemento de `n`:

```javascript
function getAdditionFactors(target, list, nums) {
    for (let num of list) {
        const expected = target - num;

        if (nums[expected]) return [ num, expected ];

        nums[num] = num;
    }

    return null;
}
```

Es posible que no encontremos un par de números cuya suma satisfaga el valor que esperamos, en ese caso retornaremos `null`.

La función `getAdditionFactors` igualmente va a aceptar como último argumento un diccionario donde irá guardando los números a los que ya hemos accedido, así podemos reducir ciclos de iteración si es que nuestro número esperado ya fue almacenado en iteraciones previas.

Con esto dicho, implementaremos nuestra nueva función:

```javascript
function getThreeWayProduct(list) {
    const nums = {};

    for (let num of list) {
        const expectedSum = 2020 - num;
        const factors = getAdditionFactors(expectedSum, list, nums);

        if (factors) return num * factors[0] * factors[1];
    }
}
```

Y listo, con esto hemos resuelto el primer día de desafíos de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode). Si aplicamos nuestra función con la [data de entrada](https://adventofcode.com/2020/day/1/input) del desafío, obtenemos `288756720` como respuesta.

---

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
