---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 9 - Encoding Error
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 9
date: '2020-12-14'
cover_image: /assets/img/covers/cookies.jpg
cover_image_thumbnail: /assets/img/covers/cookies_thumbnail.jpg
cover_image_author: Miroslava
cover_image_author_username: miroslava
---

{% include aoc_header %}

La primera parte de este desafío consta en verificar la validez de una secuencia de números (nuestra data de entrada). Una secuencia es válida sólo si un número en la posición `n + 1` de la lista corresponde a la suma de exactamente dos números de los `n` números anteriores.

Consideremos la siguiente data:

```text
35
20
15
25
47
40
62
55
65
95
102
117
150
182
127
219
299
277
309
576
```

Por ejemplo, si `n` es igual `5`, el sexto número en la colección debe ser la suma de dos números entre los cinco primeros. En este caso es correcto, porque el sexto número (`40`) es la suma del tercer y cuarto número (`15` y `25` respectivamente).

Nuetra misión es encontrar el primer número en la secuencia que no cumpla con esta regla.

Nuestra solución quedaría así:

```javascript
const input =
`35
20
15
25
47
40
62
55
65
95
102
117
150
182
127
219
299
277
309
576`;

// Verifica si el número `n + 1` corresponde a la suma entre dos
// números del preámbulo, buscando si la diferencia entre el número
// objetivo y alguno de los números del preámbulo se encuentra en este
const isTargetValid = (preamble, target) =>
  preamble.some((value, _, arr) => arr.includes(target - value));

function findCorruptedNumber(preambleSize, input) {
  const preamble = input.slice(0, preambleSize);
  const target = input[preambleSize];

  // Si el número objetivo es válido, llamamos a la función
  // nuevamente, esta vez con todos los elementos de la data
  // de entrada salvo el primero. Así en la siguiente iteración
  // se chequeará el número siguiente y así sucesivamente hasta
  // dar con un dígito que no sea válido
  return isTargetValid(preamble, target)
    ? findCorruptedNumber(preambleSize, input.slice(1))
    : target;
}

findCorruptedNumber(5, input.split('\n').map(Number)); // 127
```

¡Boom! Con eso hemos resuelto la primera parte del problema.

#### Segunda parte

La segunda parte del desafío consta en encontrar una secuencia de al menos dos números continuos que sumen como total nuestro número corrupto. Debemos retornar la suma entre el número mayor y el número menor de la secuencia.

La forma de resolver este problema es bastante interesante. Comenzaremos sumando los primeros dos número de nuestra secuencia y mientras dicha suma no sea igual al número corrupto, seguiremos sumando números, el tecero, luego el cuarto y así sucesivamente, hasta alcanzar dicho valor.

Si la suma total llegara a superar el valor buscado, lo que haremos será ir restando números del principio de la secuencia. Si nuevamente el valor de la suma de la secuencia pasa a ser menor que el valor buscado, seguiremos sumando números a la derecha, hasta que eventualmente lleguemos al número exacto.

Para esto utilizaremos la siguiente función:

```javascript
const Ordering = {
  Eq: 'Eq',
  Gt: 'Gt',
  Lt: 'Lt'
}

const compare = (a, b) => {
  if (a === b) return Ordering.Eq;
  if (a < b) return Ordering.Lt;

  return Ordering.Gt;
}

function findSequence(target, input) {
  let bottom = 0; // cota a la izquiera
  let upper = 1;  // cota a la derecha

  let sum = input[bottom] + input[upper];

  while (sum !== target) {
    // Comparamos si el valor de la suma es menor, igual o mayor al objetivo 
    const ordering = compare(sum, target);

    // De ser menor, subimos la cota derecha y añadimos dicho número al total
    if (ordering === Ordering.Lt) {
      upper++;
      sum += input[upper];
      continue;
    }

    // De ser mayor, restamos dicho número del total y subimos la cota izquierda
    if (ordering === Ordering.Gt) {
      sum -= input[bottom]
      bottom++;
      continue;
    }
  }

  return input.slice(bottom, upper + 1);
}
```

Nuestra solución final quedaría así:

```javascript
const input =
`35
20
15
25
47
40
62
55
65
95
102
117
150
182
127
219
299
277
309
576`;

const isTargetValid = (preamble, target) =>
  preamble.some((value, _, arr) => arr.includes(target - value));

const Ordering = {
  Eq: 'Eq',
  Gt: 'Gt',
  Lt: 'Lt'
}

const compare = (a, b) => {
  if (a === b) return Ordering.Eq;
  if (a < b) return Ordering.Lt;

  return Ordering.Gt;
}

function findCorruptedNumber(preambleSize, input) {
  const preamble = input.slice(0, preambleSize);
  const target = input[preambleSize];

  return isTargetValid(preamble, target)
    ? findCorruptedNumber(preambleSize, input.slice(1))
    : target;
}

function findSequence(target, input) {
  let bottom = 0; // cota a la izquiera
  let upper = 1;  // cota a la derecha

  let sum = input[bottom] + input[upper];

  while (sum !== target) {
    // Comparamos si el valor de la suma es menor, igual o mayor al objetivo 
    const ordering = compare(sum, target);

    // De ser menor, subimos la cota derecha y añadimos dicho número al total
    if (ordering === Ordering.Lt) {
      upper++;
      sum += input[upper];
      continue;
    }

    // De ser mayor, restamos dicho número del total y subimos la cota izquierda
    if (ordering === Ordering.Gt) {
      sum -= input[bottom]
      bottom++;
      continue;
    }
  }

  return input.slice(bottom, upper + 1);
}

function getEncryptionWeakness(preambleSize, input) {
  const corruptedNumber = findCorruptedNumber(preambleSize, input);
  const sequence = findSequence(corruptedNumber, input);

  const min = Math.min(...sequence);
  const max = Math.max(...sequence);

  return min + max;
}

getEncryptionWeakness(5, input.split('\n').map(Number)); // 62
```

Y listo, con esto hemos resuelto el desafío del noveno día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
