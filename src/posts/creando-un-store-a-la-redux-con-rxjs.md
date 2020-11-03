---
layout: post_layout.liquid
tags:
    - post
title: Creando un Store a la redux con RxJS
subtitle: Técnicas de manejo de estado con RxJS, parte 1
description: Este artículo trata sobre cómo implementar un store al estilo redux para manejar estado utilizando un patrón orientado a transiciones gatilladas por mensajes
date: '2020-11-02'
cover_image: /assets/img/covers/inverted_sun.jpg
cover_image_thumbnail: /assets/img/covers/inverted_sun_thumbnail.jpg
cover_image_author: Kimberly Eschenbauch
cover_image_author_username: kimberlyeschenbauchphotography
---

Hace unos días estuve en la BeerJS Valdivia hablando sobre cómo modelar efectos secundarios en React utilizando RxJS. Hacia el final de la charla, que puedes ver por [acá](https://youtu.be/F2SOzMPCGC8?t=2248), surgió una pregunta sobre qué formas podrían existir para manejar el estado de una aplicación con RxJS.

> En esta serie de artículos vamos a explorar 3 formas en las que podemos hacer manejo de estado utilizando RxJS.

<br />

- [Creando un Store a la redux con RxJS]({{ page.url }}) (este mismo artículo☝️)
- Servicios *stateful* con streams reactivos (próximamente)
- Implementando el patrón BLoC con RxJS (próximamente)

### Creando un Store a la redux.

Pues una de las formas más comunes de manejar estados con RxJS es implementando un *Store* que almacenará el estado de nuestra aplicación. Podemos enviar comandos a nuestro *Store* y modificar el estado interno utilizando un *reducer*, que no es más que una función pura, que va a describir cómo el estado de la aplicación se transforma según el comando o acción que haya sido emitido.

Para esto podemos utilizar un `BehaviorSubject` de `rxjs`, que es una especie de `EventEmitter` en esteroide:

- Un `BehaviorSubject` es *multicast*, es decir, puede tener múltiples suscriptores.
- Cada vez que un observador se suscribe al `BehaviorSubject`, es notificado de forma síncrona sobre el último valor emitido por el sujeto. Gracias a esto nos aseguramos que todos los observadores del sujeto estén actualizados con el estado actual.
- A diferencia de un `Subject` común y corriente, un `BehaviorSubject` deber ser instanciado con un valor inicial (si lo pensamos, tiene sentido dado el comportamiento que describimos en el punto anterior).

Una implementación básica de nuestro *Store* podría lucir así:

```javascript
import { BehaviorSubject } from 'rxjs';

function createStore(initialValue, reducer) {
    const store = new BehaviorSubject(initialValue);
    let previousState;

    return {
        subscribe: (observer) => {
          store.subscribe({
            next: (value) => {
              previousState = value;
              observer(value);
            }
          })
        },
        dispatch: (action) => {
            const newState = reducer(previousState, action);

            store.next(newState);
        },
    }
}

function counterReducer(previousValue, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: previousValue.count + 1
      }
    case 'DECREMENT':
      return {
        count: previousValue.count - 1
      }
    default:
      return previousValue;
  }
}

const counterStore = createStore({ count: 0 }, counterReducer);

counterStore.subscribe(v => console.log(`Count A :: ${v.count}`)); // Count A :: 0

counterStore.dispatch({ type: 'INCREMENT' }); // Count A :: 1
counterStore.dispatch({ type: 'INCREMENT' }); // Count A :: 2

counterStore.subscribe(v => console.log(`Count B :: ${v.count}`)); // Count :: 2

counterStore.dispatch({ type: 'INCREMENT' }); // Count A :: 3
                                              // Count B :: 3
counterStore.dispatch({ type: 'DECREMENT' }); // Count A :: 2
                                              // Count B :: 2
```

Veamos paso a paso la implementación de `createStore`.

Para crear nuestro store necesitamos un valor inicial y una función (un *reducer*), que se encargará de describir las transiciones de estado en el *Store*.

Inicializamos nuestro `BehaviorSubject` utilizando `initialValue` como valor inicial:

```javascript
function createStore(initialValue, reducer) {
    const store = new BehaviorSubject(initialValue);
    // ...
}
```

A continuación definimos un método `subscribe`, que recibe como parámetro un observador. Internamente nos suscribimos al `BehaviorSubject` y cada vez que se emita un nuevo valor en este, propagaremos ese valor al observador que recibimos como parámetro. Esto nos permite almacenar una referencia al último valor emitido, que va a ser necesaria cuando llamemos al método `dispatch` para calcular el nuevo estado del *Store*:

```javascript
function createStore(initialValue, reducer) {
    const store = new BehaviorSubject(initialValue);
    let previousState;

    return {
        subscribe: (observer) => {
          store.subscribe({
            next: (value) => {
              previousState = value;
              observer(value);
            }
          })
        },
        dispatch: (action) => {
            // ...
        },
    }
}
```

Finalmente implementamos `dispatch` como una función que toma como argumento una acción y ejecuta el `reducer` utilizando `previousState` (que guardamos cada vez que un valor nuevo se emite en el `BehaviorSubject`) y la acción para calcular el nuevo estado de nuestro sujeto. Despachamos el valor nuevo utilizando el método `next` de nuestro sujeto.

```javascript
function createStore(initialValue, reducer) {
    const store = new BehaviorSubject(initialValue);
    let previousState;

    return {
        subscribe: (observer) => {
          store.subscribe({
            next: (value) => {
              previousState = value;
              observer(value);
            }
          })
        },
        dispatch: (action) => {
            const newState = reducer(previousState, action);

            store.next(newState);
        },
    }
}
```

Y *voilá*. Como puedes ver, una implementación mínima de un *Store* a la redux es posible utilizando una estructura como `BehaviorSubject`, que nos permite almacenar estado y propagar los cambios por medio de una estrategia de tipo *push*. Algo muy importante y que nos permite utilizar este *approach* es que, como mencionamos, el `BehaviorSubject` es *multicast*. Ya veremos en el próximo ejemplo por qué esto es importante.

---

Y eso ha sido todo por hoy. Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

En el próximo artículo veremos como implementar servicios *stateful* con streams reactivos. Gracias totales y hasta la próxima.
