---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 8 - Handheld Halting
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 8
date: '2020-12-13'
cover_image: /assets/img/covers/gboy.jpg
cover_image_thumbnail: /assets/img/covers/gboy_thumbnail.jpg
cover_image_author: Hello I'm Nik
cover_image_author_username: helloimnik
---

{% include aoc_header %}

Para este desafío tenemos un listado de instrucciones como data de entrada. Las instrucciones describen la ejecución de un programa y están compuestas de dos partes: la primera parte indica un tipo de comando y la segunda data asociada a ese comando. La ejecución del programa parte en la primera línea y termina cuando llegamos a la última instrucción del listado.

Desafortunadamente una de las instrucciones del programa está mala, por lo que caemos en un *loop* infinito.

Consideremos el siguiente programa de ejemplo:

```text
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6
```

Existen 3 tipos de instrucciones:

- `nop` hace absolutamente nada, solo mueve la ejecución del programa a la siguiente línea.
- `acc` le añade la data asociada a un acumulador (que parte en 0) y mueve la ejecución del programa a la siguiente instrucción.
- Finalmente `jmp` no modifica el acumulador, pero mueve la ejecución del programa según lo indicado en la data asociada.

Para nuestra data de entrada, la ejecución del programa sería algo así:

```text
Init
  pointer     : 0 
  accumulator : 0
-> nop +0
  pointer     : 1
  accumulator : 0
-> acc +1
  pointer     : 2
  accumulator : 1
-> jmp +4
  pointer     : 6
  accumulator : 1
-> acc +1
  pointer     : 7
  accumulator : 2
-> jmp -4
  pointer     : 3
  accumulator : 2
-> acc +3
  pointer     : 4
  accumulator : 5 <-- Resultado
-> jmp -3
  pointer     : 1 ### Duplicado
  accumulator : 5
```

En la primera parte del desafío debemos encontrar el valor del contador inmediatamente antes de que se ejecute una instrucción duplicada. Para la data de prueba el valor es `5`.

En orden de hacer esto de forma programática, vamos a utilizar –redoble de tambores, prrrrr 🥁🥁🥁– *generadores*.

<p class="disclaimer">Si quieres aprender sobre generadores puedes hacerlo <a href="[../introduccion-a-ramda-js-parte-0](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Iterators_and_generators)" target="_blank" ref="noreferrer noopener">aquí.</a></p>

> Esta es definitivamente la primera vez en la vida que encuentro un uso práctico para utilizar generadores 🎉

Crearemos un generador que se encargará de recorrer el listado de instrucciones.

```javascript
const input = 
`nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;

// Para declarar un generador debemos usar un asterisco
function *traverser(instructions) {
  let accumulator = 0;
  let pointer = 0;

  while (instructions.length !== pointer) {
    const [ command, input ] = instructions[pointer].split(' ');

    accumulator = command === 'acc'
      ? accumulator + Number(input)
      : accumulator;
    pointer = command === 'jmp'
      ? pointer + Number(input)
      : pointer + 1;

    yield { accumulator, pointer };
  }
}

// Cuando llamamos a un generador obtenemos de vuelta un iterador
const traverse = traverser(input.split('\n'));

traverse.next(); // { done: false, value: { pointer: 1, accumulator: 0 } }
traverse.next(); // { done: false, value: { pointer: 2, accumulator: 1 } }
traverse.next(); // { done: false, value: { pointer: 6, accumulator: 1 } }
```

Podemos utilizar nuestro generador para ejecutar las instrucciones del programa y llevar un registro sobre qué instrucciones ya se han ejecutado (utilizando `pointer`). Cuando nos encontremos con una instrucción duplicada, retornaremos el valor del acumulador anterior.

Nuestra solución se vería así:

```javascript
const input = 
`nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;

function *traverser(instructions) {
  let accumulator = 0;
  let pointer = 0;

  while (instructions.length !== pointer) {
    const [ command, input ] = instructions[pointer].split(' ');

    accumulator = command === 'acc'
      ? accumulator + Number(input)
      : accumulator;
    pointer = command === 'jmp'
      ? pointer + Number(input)
      : pointer + 1;

    yield { accumulator, pointer };
  }
}

function getAccumulator(input) {
  const visited = new Set();
  let accumulator = null;

  // Como los generadores retornan iterables, podemos utilzar `for of`
  // para producir los valores sin llamar a .next() manualmente
  for (let value of traverser(input)) {
    if (visited.has(value.pointer)) {
      break;
    }

    accumulator = value.accumulator;

    visited.add(value.pointer);
  }
  
  return accumulator;
}

getAccumulator(input.split('\n')); // 5
```

¡Perfecto! Para la data de entrada provista hemos llegado al resultado esperado.

#### Segunda parte

Uno de los comandos en una de las instrucciones de nuestra data está corrupta. Si la reemplazamos por el commando correcto, nuestro programa puede finalizar exitosamente. Solo los comandos `nop` y `jmp` pueden estar corruptos. En otras palabras, en la data hay un `nop` que debería ser un `jmp` o un `jmp` que debería ser un `nop`.

Nuestra misión es encontrar dicho comando, reemplazarlo, correr el programa exitosamente y obetener el valor del acumulador final.

Para esto podemos utilizar algo de fuerza bruta y probar reemplazando, una por una, las instrucciones que pueden estar corruptas. Cuando una secuencia caiga en un loop infinito, simplemente probaremos reemplazando la instrucción siguiente.

Nuestra solución se vería así:

```javascript
const input = 
`nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;

function *traverser(instructions) {
  let accumulator = 0;
  let pointer = 0;

  while (instructions.length !== pointer) {
    const [ command, input ] = instructions[pointer].split(' ');

    accumulator = command === 'acc'
      ? accumulator + Number(input)
      : accumulator;
    pointer = command === 'jmp'
      ? pointer + Number(input)
      : pointer + 1;

    yield { accumulator, pointer };
  }
}

function getAccumulator(input) {
  const visited = new Set();
  let accumulator = null;

  for (let value of traverser(input)) {
    if (visited.has(value.pointer)) {
      // En vez de terminar el loop, retornamos null
      return null;
    }

    accumulator = value.accumulator;

    visited.add(value.pointer);
  }
  
  return accumulator;
}

// Cambia una instrucción de `jmp` a `nop` y visceversa
function swap(instruction) {
  const [ command, input ] = instruction.split(' ');

  if (command === 'acc') return instruction;

  return `${command === 'nop' ? 'jmp' : 'nop'} ${input}`;
}

// Obtenemos los índices de las instrucciones que podrían estar corruptas
const findCorruptable = sequence =>
  sequence
    .reduce((acc, entry, index) =>
      (/(jmp|nop)/).test(entry) ? acc.concat(index) : acc,
      []
    );

function getUncorruptedAccumulator(sequence) {
  const corruptable = findCorruptable(sequence);

  let result = null;

  while (result === null) {
    // Obtiene el primer indice en la lista de instrucciones
    // (mutando la secuencia)
    let index = corruptable.shift();

    if (typeof index !== 'undefined') {
      // Reemplazamos una de las instrucciones por su opuesta
      const swapedSeq = [
          ...sequence.slice(0, index),
          swap(input[index]),
          ...sequence.slice(index + 1)
        ]; 

      // `getAccumulator` retorna `null` cuando nos encontramos con
      // una secuencia corrupta, en ese caso volvemos a iterar.
      result = getAccumulator(swapedSeq);
    }
  }

  return result;
}

getUncorruptedAccumulator(input.split('\n')); // 8
```

Y listo, con esto hemos resuelto el desafío del octavo día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
