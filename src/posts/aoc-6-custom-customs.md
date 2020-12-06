---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 6 - Custom Customs
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 6
date: '2020-12-06'
cover_image: /assets/img/covers/fallen_tree.jpg
cover_image_thumbnail: /assets/img/covers/fallen_tree_thumbnail.jpg
cover_image_author: Simon Berger
cover_image_author_username: 8moments
---

{% include aoc_header %}

En este desafío nuestra data de entrada representa las respuestas positivas de un formulario  grupo –las preguntas están numeradas alfabéticamente–. Los grupos están separados por una línea en blanco y pueden tener uno o más integrantes, donde las respuestas de cada integrante se encuentran en una línea nueva.

En la primera parte del desafío debemos encontrar la suma total de todas las respuestas positivas por grupo. Si dos o más integrantes de un grupo han respondido la misma pregunta de forma positiva, eso contaría como solo una respuesta positiva dentro del grupo.

Considerando la siguiente data:
```
abc     | Grupo 1, 1 integrante   -> 3 respuestas ✅

a       |
b       |
c       | Grupo 2, 3 integrantes  -> 3 respuestas ✅

ab      |
ac      | Grupo 3, 2 integrantes  -> 3 respuestas ✅  

a       |
a       |
a       |
a       | Grupo 4, 4 integrantes  -> 1 respuesta ✅  

b       | Grupo 5, 1 integrante   -> 1 respuesta ✅  
```

El total de respuestas positivas es `3 + 3 + 3 + 1 + 1 = 11`. Como nos hemos dado cuenta, no nos interesan las respuestas duplicadas por grupo, por lo que podemos hacer uso de un `Set` para obtener solamente las respuestas únicas.

Nuestra solución se vería así:

```javascript
const input =
`abc

a
b
c

ab
ac

a
a
a
a

b`;


const countPositiveAnswers = input => 
    input
        .split("\n\n")
        .reduce((total, group) => {
            // Reemplazamos los saltos de línea de cada grupo y obtenemos
            // de vuelta un string de una sola línea con todas las respuestas del grupo
            const str = group.replace(/[\n\r]+/g, '');
            const chars = new Set(str);

            return chars.size + total;
        }, 0);

countPositiveAnswers(input); // 11
```

Como los strings en JavaScript implementan `Symbol.iterator`, al instanciar nuestro `Set` con un string, este tendrá todos los caracteres únicos del string, lo que es perfecto para nuestro caso. Y listo, para la data de entrada provista hemos llegado al resultado esperado.

#### Segunda parte

Sucede que el criterio para contar respuestas positivas por grupo ha cambiado. Debemos contar solo las preguntas que todos los miembros del grupo han contestado positivamente. Afortunadamente no es mucho el código que debemos cambiar para soportar este caso.

La solución final luciría así:

```javascript
const input =
`abc

a
b
c

ab
ac

a
a
a
a

b`;

const countBy = testFn => collection =>
    collection.reduce((count, item) => testFn(item) ? count + 1 : count, 0);

const countPositiveAnswers = input => 
    input
        .split("\n\n")
        .reduce((total, group) => {
            const rows = group.split(/[\n\r]+/g);
            const chars = new Set(rows.join(""));

            // Utilizamos nuestro `countBy` definido en el desafío del día 4
            const found = countBy(
                char => rows.every(row => row.includes(char))
            )(Array.from(chars));

            return found + total;
        }, 0);

countPositiveAnswers(input); // 6
```

Y listo, con esto hemos resuelto el desafío del sexto día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
