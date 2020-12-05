---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 2 - Password Philosophy
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 2
date: '2020-12-02'
cover_image: /assets/img/covers/stuffed_reindeer.jpg
cover_image_thumbnail: /assets/img/covers/stuffed_reindeer_thumbnail.jpg
cover_image_author: Tim Gouw
cover_image_author_username: punttim
---

{% include aoc_header %}

El segundo desafío de AOC consiste en contar cuantos *passwords* válidos existen en un grupo de entradas. Consideremos la siguiente data:

```
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc
```

La data viene de la siguiente forma:
- Los números en primera columna señalan la cantidad de veces que debe salir un caracter en el *password*
- En la segunda columna sale el caracter en cuestión
- Y finalmente en la tercera sale nuestro *password*

Siguiendo estas reglas, el primer password sí es válido, pues la letra `a` sale 1 vez; el segundo es inválido, pues la letra `b` no sale al menos 1 vez; y el tercero es válido porque la letra `c` aparece 9 veces.

En este caso la cantidad de passwords válidos para este set de datos es 2.

Para poder procesar nuestra data primero debemos transformarla en una representación que nos sea útil. Para esto utilizamos la función `String.prototype.split` para dividir nuestro texto de entrada por cada salto de línea. Con esto conseguiremos un arreglo donde cada entrada corresponde a una fila.

```javascript
const input =
`Foo
Bar
Baz`;

input.split('\n'); // ['Foo', 'Bar', 'Baz']
```

Adicionalmente vamos a tomar cada fila y descomponerla en las variables que necesitamos para validar una entrada sea válida. Como `input.split('\n')` nos retorna un arreglo, podemos utilizar `Array.prototype.map` para obtener un arreglo de vuelta con cada fila formateada:

```javascript
const input =
`1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`;

function getRowComponents(row) {
    // Dividimos cada entrada por un espacio en blanco y luego
    // utilizando `destructuring`, accedemos a los elementos en cada posición
    // del arreglo que obtenemos al llamar a `row.split(' ')`.
    const [ range, letter, pass ] = row.split(" ");
                                        
    // Luego separamos la cantidad mínima y máxima de caracteres (y de paso los
    // transformamos en números).
    const [ min, max ] = range.split("-").map(n => +n);

    // Y retornamos nuestra data, para el caso de `letter`, nuestra data luce
    // así `a:`. Como no nos interesa el `:`, solo accederemos al primer caracter. 
    return { min, max, letter: letter[0], pass };
}

input.split('\n').map(getRowComponents); // [{ min: 1, max: 3, letter: 'a', pass: 'abcde' }, ..etc ]
```

Finalmente debemos implementar nuestra función que cuente cuantos passwords son válidos. Podemos separar el proceso de conteo del proceso de validación, por lo que primero definiremos una función que solamente valide una entrada:

```javascript
function isValidPassword(password) {
    // Utilizando una expresión regular podemos contar cuantas veces un caracter
    // se encuentra en un string. `String.propotype.match` nos retorna un arreglo
    // con todos los elementos que cumplan con la expresión regular. Así podemos saber
    // cuantas veces se repite un caracter (con el largo del arreglo).
    // De no hacer match, retorna `null`.
    const ocurrences = password.pass.match(new RegExp(password.letter, 'g'));

    // Si no hay ocurrencias, decimos que el password no es válido
    if (!ocurrences) return false;

    // Si la cantidad de apariciones está fuera del rango, decimos
    // que el password no es válido
    if (ocurrences.length < password.min || ocurrences.length > password.max) return false;

    // Si nada de eso sucede, entonces es válido
    return true;
}
```

Para contar cuántos passwords son válidos podemos hacerlo de dos formas y para explicarlas me gustaría usar una metáfora.

> Imaginemos que tenemos un cajón con manzanas <span style="color: var(--green)">verdes</span> y <span style="color: var(--red)">rojas</span>.
> Si queremos saber cuantas manzanas <span style="color: var(--green)">verdes</span> tenemos, podríamos separar las manzanas discriminándolas por su color, tomando cada manzana del cajón y preguntándonos *"¿De qué color es esta manzana?"*.
> Si la manzana es <span style="color: var(--green)">verde</span> la ponemos en una pila y si es <span style="color: var(--red)">roja</span>, en otra. Luego cuando ya estén todas las manzanas separadas, procedemos a contarlas.
> Pero bajo cierto punto de vista esto parece muy trabajoso. ¿Por qué no aprovechamos de contar nuestras manzanas mientras las separo?

Dicho eso, si utilizamos el primer *approach* para nuestros passwords, sería equivalente a hacerlo de la siguiente forma:

```javascript
const countValidPasswords = input =>
    input
        .split('\n')
        .map(getRowComponents)
        .filter(isValidPassword)
        .length;
}
```

En cada paso estamos tomando una colección de elementos, procesando cada uno de ellos y retornando una colección nueva. Si nuestra colleción tuviera mil entradas, tendríamos que primero transformar esas mil entradas y luego filtrarlas. Es decir nuestro algoritmo iteraría al menos dos mil veces.

Si decidiéramos usar el segundo `approach`, aplicaríamos cada una de estas operaciones mientras vamos procesando cada entrada de nuestra data. Para este tipo de cosas, podemos recurrir a `.reduce()`:

```javascript
const countValidPasswords = input =>
    input
        .split('\n')
        .reduce((total, row) => {
            // Magia ✨
        }, 0)
```

Lo que haremos dentro de la función que le pasamos a `reduce` es formatear cada entrada, determinar si el *password* es válido y de serlo, retornamos el nuevo valor total, que no es más que `total + 1`. Si el password es inválido, simplemente retornamos `total`.

Nuestra solución final quedaría así:

```javascript
const input =
`1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`;

function getRowComponents(row) {
    const [ range, letter, pass ] = row.split(" ");
    const [ min, max ] = range.split("-").map(n => +n);

    return { min, max, letter: letter[0], pass };
}

function isValidPassword(password) {
    const ocurrences = password.pass.match(new RegExp(password.letter, 'g'));

    if (!ocurrences) return false;
    if (ocurrences.length < password.min || ocurrences.length > password.max) return false;

    return true;
}

const countValidPasswords = input =>
    input
        .split('\n')
        .reduce((total, row) => {
            const password = getRowComponents(row);

            return isValidPassword(password)
                ? total + 1
                : total;
        }, 0);

countValidPasswords(input); // 2
```

Y ya va, hemos resuelto la primera parte de nuestro problema.

#### Segunda parte

En la segunda parte del desafío nos encontramos con que el criterio de validación para los *passwords* cambia. Afortunadamente como hemos escrito nuestro código respetando el principio de responsabilidad única, cambiar el criterio de validación sólo implica reimplementar nuestra función `isValidPassword`.

El nuevo criterio de validación indica que los dígitos que obtenemos en la primera columna de cada entrada indica las posiciones dentro del password en donde el caracter podría estar. Para que un password sea válidp, solamente una posición debe contener el caracter. Si es que el caracter se repite en ambas posiciones, el password es inválido.

Uilizando la data de ejemplo:
- `1-3 a: abcde` es válido: la posición 1 contiene `a` y la posición `3` no.
- `1-3 b: cdefg` es inválido: ni la posición `1` ni `3` contienen la letra `b`.
- `2-9 c: ccccccccc` es inválido: ambas posiciones `2` y `9` contienen la letra `c`.

Reimplementando nuestra función de validación:

```javascript
function isValidPassword(password) {
    const firstMatch = password.pass[password.min - 1];
    const secondMatch = password.pass[password.max - 1];

    // Si ambos caracteres en las posiciones son iguales, decimos que
    // el password es inválido
    if (firstMatch === secondMatch) return false;

    // Si ninguno de los carecteres son iguales al caracter provisto
    // en la data de entrada, decimos que el password es inválido
    if (password.letter !== firstMatch && password.letter !== secondMatch) return false;

    // Si nada de eso sucede, entonces es válido
    return true;
}
```

Y listo, si ejecutamos nuestra función de conteo, obtenemos que el resultado final es 1.

Nuestra solución final quedaría así:

```javascript
const input =
`1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`;

function getRowComponents(row) {
    const [ range, letter, pass ] = row.split(" ");
    const [ min, max ] = range.split("-").map(n => +n);

    return { min, max, letter: letter[0], pass };
}

function isValidPassword(password) {
    const firstMatch = password.pass[password.min - 1];
    const secondMatch = password.pass[password.max - 1];

    if (firstMatch === secondMatch) return false;
    if (password.letter !== firstMatch && password.letter !== secondMatch) return false;

    return true;
}

const countValidPasswords = input =>
    input
        .split('\n')
        .reduce((total, row) => {
            const password = getRowComponents(row);

            return isValidPassword(password)
                ? total + 1
                : total;
        }, 0);

countValidPasswords(input); // 1
```

Y listo, con esto hemos resuelto el segundo día de desafíos de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

---

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
