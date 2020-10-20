---
layout: post_layout.liquid
tags:
    - post
title: Revealing Module Pattern en 2020
subtitle: Cómo encapsular servicios con un patrón simple
description: Cómo podemos utilizar este patrón de diseño junto a JavaScript moderno
date: '2020-10-20'
cover_image: /assets/img/covers/crystal_ball.jpg
cover_image_thumbnail: /assets/img/covers/crystal_ball_thumbnail.jpg
cover_image_author: Michael Dziedzic
cover_image_author_username: lazycreekimages
---

Hace muchos años atrás, en los tiempos en que MooTools recién había sido publicado y yo tenía mi primera aproximación al mundo de la programación con J2SE 1.4 circa 2007 (por cierto, en aquél entonces NUNCA habría pensado dedicarme al desarrollo de software, pero esa es otra historia), [Christian Heilmann](https://twitter.com/codepo8) publicó [un artículo en su blog](https://christianheilmann.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/) hablando sobre un patrón de diseño que denominó como *The Revealing Module Pattern*:

```javascript
var someService = (function () {
  var privateValue = 42;
  
  function privateMethod() { /* ... */ }
  
  function publicMethod() { /* ... */ }

  function anotherPublicMethod() { /* ... */ }

  return {
    publicMethod: publicMethod,
    anotherPublicMethod: anotherPublicMethod
  };
})();
```

La innovación de este patrón (en aquél entonces) es que al encapsular nuestro código en una IIFE, generamos un *scope* que nos permite declarar variables privadas y métodos privados, y sólo exponemos los miembros públicos explícitamente al retornarlos en un objeto literal.

> Recuerdo haber aprendido sobre *The Revealing Module Pattern* en la guía de estilos de AngularJs escrita por John Papa. Uff, qué recuerdos.

Sin embargo con la avenida de ES2015, la estandarización de las clases y la especificación de módulos en JavaScript, este patrón comenzó a caer en desuso, ya que los módulos ESM y las clases son mecanismos naturales de encapsulación.

Si reescribimos nuestro ejemplo utilizando módulos ESM nos basta con decir:

```javascript
// someService.js
const privateValue = 42;

function privateMethod() { /* ... */ }
  
function publicMethod() { /* ... */ }

function anotherPublicMethod() { /* ... */ }

export default { publicMethod, anotherPublicMethod };
```

Una de las cosas que particularmente no me gusta de esta solución, es que en cuanto más crece nuestro archivo, se hace más difícil identificar a simple vista qué contiene la API pública.

Igualmente hay ciertos miembros de nuestro módulo que no queremos acoplar a nuestro servicio, si no que exportarlos de forma independiente, por lo que ahora incluso tenemos 2 niveles de *exports*. Este problema se acentúa aún más cuando por ejemplo, usamos TypeScript, ya que probablemente definamos algunos tipos dentro de nuestro archivo:

```typescript
// someService.ts
const privateValue = 42;

const anotherPrivateValue = 23;

enum SomeEnumerable = {
  Foo,
  Bar
}

type SomeUnionType = 'foo' | 'bar' | 'baz';

// ... more stuff

function privateMethod() { /* ... */ }
  
function publicMethod() { /* ... */ }

// ... even more stuff

function anotherPublicMethod() { /* ... */ }

export default { publicMethod, anotherPublicMethod, publicMethodGallore };
export { SomeEnumerable, SomeUnionType, MoreStuff };
```

Pues bien, una mejor forma de organizar este mini caos es utilizar el (redoble de tambores 🥁🥁🥁) *Revealing Module Pattern*:

```typescript
// someService.ts
enum SomeEnumerable = {
  Foo,
  Bar
}

type SomeUnionType = 'foo' | 'bar' | 'baz';

// ... more stuff

const someService = (() => {
  return {
    publicMethod,
    anotherPublicMethod,
    publicMethodGallore,
  };

  const privateValue = 42;
  const anotherPrivateValue = 23;

  function privateMethod() { /* ... */ }
  
  function publicMethod() { /* ... */ }

  // ... even more stuff

  function anotherPublicMethod() { /* ... */ }
})();

export default someService;
export { SomeEnumerable, SomeUnionType, MoreStuff };
```

¡Y listo! Ahora todas las cosas pertinentes al servicio quedan encapsuladas dentro de la función (que en nuestro IDE podríamos colapsar, si es que no nos interesa ver el contenido de esta) y lo *extra* queda fuera.

Un pequeño truco que podemos utilizar para hacer más fácil de identificar la API pública de nuestro servicio, es valernos del mecanismo de hoisting de las funciones en JavaScript y retornar el objeto literal antes de declarar las funciones. Una limitante de esto es que las funciones deben ser declaradas utilizando la sintaxis `function name(arg) { /* etc */ }`. Igualmente si queremos exponer una constante o algo distinto a una función, debemos declararla antes del `return`, pero siendo honesto en general cuando hacemos servicios, la mayoría de las veces nuestros servicios no tienen estado y sólo queremos exponer métodos.

---

Y eso ha sido todo por hoy. Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
