---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 5 - Binary Boarding
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 5
date: '2020-12-06'
cover_image: /assets/img/covers/cb.jpg
cover_image_thumbnail: /assets/img/covers/cb_thumbnail.jpg
cover_image_author: CHUTTERSNAP
cover_image_author_username: chuttersnap
---

{% include aoc_header %}

La primera parte del desafío nos pide encontrar el número de identificación más grande de un asiento dada la tarjeta de abordaje provista como input.

En vez de utilizar un sistema de coordenadas, los números de asiento están codificados utilizando una partición binaria del espacio. El avión tiene 128 filas de asientos y 8 asientos (columnas) por fila.

Un número de asiento es un string de diez caracteres donde los primeros siete –`B` de *back* (atrás) y `F` de *front* (frente)– indican el número de fila y los tres restantes –`L` de *left* (izquierda) y `R` de *right* (derecha)– el número de columna. Por ejemplo, para la entrada `FBFBBFFRLR`, el primer caracter es `F`, eso indica que está en la mitad delantera del avión, entre las filas 0 y 63. El siguiente caracter es `B`, o sea en la mitad trasera de la mitad delatera, es decir entre las filas 32 y 63. Repitiendo el proceso llegamos a que el número de fila es 44. Aplicando el mismo principio para la columna, obtenemos la columna 5.

Como los números de fila y columna son solo una representación binaria, bastaría simplemente con reemplazar `B`s y `F`s por `0`s y `1`s (lo mismo aplica para las columans):

```javascript
const seat = "FBFBBFFRLR";

const row = seat.slice(0, 7);
const col = seat.slice(7);

const toBinary = (zero, one) =>
    entry => entry
        .replaceAll(zero, 0)
        .replaceAll(one, 1);

const findRow = row => parseInt(toBinary("F", "B")(row), 2);
const findCol = col => parseInt(toBinary("L", "R")(col), 2);

console.log("Fila: ", findRow(row));    // Fila: 44
console.log("Columna: ", findCol(col)); // Columna: 5
```
Con esto se hace muy simple calcular el id de cada asiento. Nuestra solución final se vería así:

```javascript
const input = 
`BFFFBBFRRR
FFFBBBFRRR
BBFFBBFRLL`;

const toBinary = (zero, one) =>
    entry => entry
        .replaceAll(zero, 0)
        .replaceAll(one, 1);

const findRow = row => parseInt(toBinary("F", "B")(row), 2);
const findCol = col => parseInt(toBinary("L", "R")(col), 2);

// Calculamos el número de id con la siguiente fórmula
const getId = (row, col) => row * 8 + col;

const getIdsList = input =>
    input
        .split("\n")
        .map(seat => {
            const row = seat.slice(0, 7);
            const col = seat.slice(7);

            return getId(findRow(row), findCol(col));
        });

const getHighestId = input => Math.max(...getIdsList(ids));

getHighestId(input); // 820
```

Perfecto! Para la data de entrada provista hemos llegado al resultado esperado.

#### Segunda parte

Debo confesar que me costó entender un poco la segunda parte del enunciado, pero finalmente es se trata de encontrar el número de asiento en el pase de abordaje (la data de entrada). La pista que nos dan es que en el listado de `id`s se encuentran el sucesor y el antecesor de nuestros ids. Como la formula para calcular los ids es lineal, significa que bastaría con ordenar nuestro listado de ids y ver cual es el que falta en la secuencia.

Para esto podemos implementar una función que recorra el listado ordenado descendentemente de ids:

```javascript
const findMissingId = sortedIds => {
    for (let i = 0; i < sortedIds.length; i ++) {
        const left = sortedIds[i];
        const right = sortedIds[i + 1];

        if (left - right === 2) {
            return left - 1;
        }
    }

    return null;
}
```

Nuestra solución final se vería así:

```javascript
const input = 
`<TU_DATA_AQUÍ>`; // Pon tu data aquí

const toBinary = (zero, one) =>
    entry => entry
        .replaceAll(zero, 0)
        .replaceAll(one, 1);

const findRow = row => parseInt(toBinary("F", "B")(row), 2);
const findCol = col => parseInt(toBinary("L", "R")(col), 2);

// Calculamos el número de id con la siguiente fórmula
const getId = (row, col) => row * 8 + col;

const findMissingId = sortedIds => {
    for (let i = 0; i < sortedIds.length; i ++) {
        const left = sortedIds[i];
        const right = sortedIds[i + 1];

        if (left - right === 2) {
            return left - 1;
        }
    }

    return null;
}

const getIdsList = input =>
    input
        .split("\n")
        .map(seat => {
            const row = seat.slice(0, 7);
            const col = seat.slice(7);

            return getId(findRow(row), findCol(col));
        });

const getSeatId = input => {
    const ids = getIdsList(input).sort((a, b) => a > b ? -1 : 1);
        
    return findMissingId(ids);
}

getSeatId(input); // <tu asiento aquí>
```

Y listo, con esto hemos resuelto el desafío del quinto día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
