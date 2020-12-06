---
layout: post_layout.liquid
tags:
    - post
title: AOC Día 4 - Passport Processing
subtitle: Resolviendo el desafío Advent of Code (AOC) en JavaScript
description: Advent of Code (o Advenimiento de Código) es un calendario de advenimiento de pequeños desafíos de programación que pueden ser resueltos en cualquier lenguaje de programación.
aoc_day: 4
date: '2020-12-05'
cover_image: /assets/img/covers/snowy_platform.jpg
cover_image_thumbnail: /assets/img/covers/snowy_platform_thumbnail.jpg
cover_image_author: Alexander Possingham
cover_image_author_username: allexx54
---

{% include aoc_header %}

Este desafío consta en validar que cierta información de unos pasaportes esté completa en los registros de un aeropuerto imaginario. Lamentablemente la data viene formateada de mala manera, por lo que antes de hacer cualquier cosa debemos normalizarla.

Un archivo con la información de los pasaportes podría verse de la siguiente forma:

```
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
```

Cada pasaporte está separado por una fila en blanco, y los campos del pasaporte pueden estar ordenados de cualquier forma.

Hablando de campos, he aquí el listado de todos los campos que un pasaporte debe tener:
- `byr`: *Birth Year*
- `iyr`: *Issue Year*
- `eyr`: *Expiration Year*
- `hgt`: *Height*
- `hcl`: *Hair Color*
- `ecl`: *Eye Color*
- `pid`: *Passport ID*
- `cid`: *Country ID*

Para que un pasaporte sea válido, todos los campos deben estar presentes (salvo `cid` por una razón necesaria para seguir con la trama de la historia). Nuestro objetivo es contar cuantos pasaportes cumplen con los criterios de validación.

Para resolver este desafío haremos uso de una par de técnicas de programación funcional, como funciones de orden mayor, currying y composición de funciones.

<p class="disclaimer">Pro tip: Si quieres aprender sobre estos conceptos, date una vuelta por <a href="../introduccion-a-ramda-js-parte-0" target="_blank">acá.</a></p>

Comenzaremos por definir una función que nos permita iterar el listado de pasaportes y contar los que cumplen con los criterios de validación. Como esto es algo que ya hemos hecho bocha de veces, introduciremos una función utilitaria a la que llamaremos `countBy`:

```javascript
const countBy = testFn => collection =>
    collection.reduce((count, item) => testFn(item) ? count + 1 : count, 0);
```

`countBy` es una función curriada que recibe una función de prueba y retorna una función que espera una colección de elementos. Esta función interna retorna el total de elementos que pasan la función de prueba. La función será aplicada en cada elemento de la colección, de retornar `true` aumentaremos el valor del contador. De retornar `false` simplemente mantenemos el contador.

```javascript
// Dado que `countBy` es una función curriada podemos decir que esto:
const countValidPassports = rawPassports => countBy(validationFn)(passports);

// Es equivalente a esto:
const countValidPassports = countBy(validationFn);

function validationFn(rawPassport) {
    // Determina de alguna manera si un pasaporte es válido o no
}
```

Sólo nos queda por implementar nuestra función `validationFn`. Para saber si un pasaporte es válido o no, primero debemos serializar la data del pasaporte –que ahora está toda en un string– a una estructura de datos que nos permita trabajar con ella de forma más fácil.

Para ello definiremos una función `rawPassportToObject`, que nos ayudará a transformar la información de un pasaporte a una representación que nos sirva mejor para evaluar su validez:

```javascript
// Retorna un objeto de tipo { [kay]: value } donde `key` corresponde
// al nombre de los campos y value al valor del campo
const rawPassportToObject = entry => 
    entry
        .split(/\n|\s/g) // obtenemos un listado de los componentes del string
        .reduce((acc, entry) => {
            const [ key, value ] = entry.split(':');

            return Object.assign(acc, { [key]: value });
        }, {});

const rawPassport =
`ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm`;

rawPassportToObject(rawPassport); // { byr: "1937", cid: "147", ecl: "gry", eyr: "2020", hcl: "#fffffd", hgt: "183cm", iyr: "2017", pid: "860033327" }
```

Dicho esto, ya podemos contar nuestros *passwords* válidos. Nuestra solución completa queda así:

```javascript
const input =
`ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in`;

// Definimos un Map donde señalamos que campos son requeridos y cuales no
const fields = new Map([
    ['byr', true],
    ['iyr', true],
    ['eyr', true],
    ['hgt', true],
    ['hcl', true],
    ['ecl', true],
    ['pid', true],
    ['cid', false]
]);

const countBy = testFn => collection =>
    collection.reduce((count, item) => testFn(item) ? count + 1 : count, 0);

const rawPassportToObject = entry => 
    entry
        .split(/\n|\s/g)
        .reduce((acc, entry) => {
            const [ key, value ] = entry.split(':');

            return Object.assign(acc, { [key]: value });
        }, {});

const isValidPassport = passport => {
    for (const [field, required] of fields) {
        // De ser requerido el campo, verificamos que exista en nuestro pasaporte
        if (required && !passport.hasOwnProperty(field) ) {
            return false;
        }
    }

    return true;
}

const countValidPassports = countBy(rawPassport => {
    const passport = rawPassportToObject(rawPassport);

    return isValidPassport(passport);
});

countValidPassports(input.split("\n\n")); // |> 2 ✅
```

Perfecto! Para la data de entrada provista hemos llegado al resultado esperado.

#### Segunda parte

Hasta ahora solo hemos estado validando que los campos existan dentro del pasaporte. La segunda parte del desafío nos pide validar la data de entrada de cada campo según las siguientes reglas:

- `byr` (Birth Year) - cuatro dígitos; mínimo 1920 y 2002 como máximo.
- `iyr` (Issue Year) - cuatro dígitos; mínimo 2010 y 2020 como máximo.
- `eyr` (Expiration Year) - cuatro dígitos; mínimo 2020 y 2030 como máximo.
- `hgt` (Height) - un número seguido de `cm` o `in`:
  - De ser `cm`, el número debe ser mínimo 150 y máximo 193.
  - De ser `in`, el número debe ser mínimo 59 y máximo 76.
- `hcl` (Hair Color) - un `#` seguido de exactamente 6 caracteres entre 0-9 o a-f.
- `ecl` (Eye Color) - exactamente uno de: `amb`, `blu`, `brn`, `gry`, `grn`, `hzl` o `oth`.
- `pid` (Passport ID) - dígito de nueve números, incluyendo ceros a la izquierda.
- `cid` (Country ID) - ignorado, se encuentre o no.

Dicho esto, queremos tener una forma estandarizada de ejecutar una función de validación para cada uno de los campos de nuestro pasaporte. Igualemente definiremos funciones de validación que cumplan con las reglas establecidas para cada campo. Nuestra solución completa quedaría así:

```javascript
const input =
`ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in`;

// Validadores

const isWithinRange = (min, max) => value => (+value >= min && +value <= max);

const heightValidator = {
    'cm': isWithinRange(150, 193),
    'in': isWithinRange(59, 76)
};

const isValidHeight = value => {
    if (!value) return false;
    if (!(/\d+(?=(cm|in))/).test(value)) return false;

    const [ height, unit ] = value.match(/\d+(?=(cm|in))/);

    return unit && height ? heightValidator[unit](height) : false;
};

const isHex = value => /#(\d|[a-f]){6}/gi.test(value || '');

const isValidEyes = value => [ 'amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth' ].includes(value || '');

const isValidPid = value => /^\d{9}$/.test(value || '');

const validators = new Map([
    ['byr', isWithinRange(1920, 2002)],
    ['iyr', isWithinRange(2010, 2020)],
    ['eyr', isWithinRange(2020, 2030)],
    ['hgt', isValidHeight],
    ['hcl', isHex],
    ['ecl', isValidEyes],
    ['pid', isValidPid],
    ['cid', () => true]
]);

function validateEntry(entry) {
    for (const [field, validator] of validators) {
        const value = entry[field];

        if (!validator(value)) {
            return false;
        }
    }

    return true;
}

const countBy = testFn => collection =>
    collection.reduce((count, item) => testFn(item) ? count + 1 : count, 0);

const rawPassportToObject = entry => 
    entry
        .split(/\n|\s/g)
        .reduce((acc, entry) => {
            const [ key, value ] = entry.split(':');

            return Object.assign(acc, { [key]: value });
        }, {});

const countValidPassports = countBy(rawPassport => {
    const passport = rawPassportToObject(rawPassport);

    return validateEntry(passport);
});

countValidPassports(input.split("\n\n")); // |> 2 ✅
```

Y listo, con esto hemos resuelto el desafío del cuarto día de [#AdventOfCode](https://twitter.com/hashtag/AdventOfCode).

___

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
