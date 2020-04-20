---
layout: post_layout.liquid
tags:
    - post
title: React y RxJS
description: Este artículo trata sobre cómo utilizar en conjunto React y RxJS.
subtitle: Cómo utilizarlos en conjunto y no morir en el intento.
date: '2020-04-20'
cover_image: /assets/img/covers/react_rxjs.jpg
cover_image_thumbnail: /assets/img/covers/react_rxjs_thumbnail.jpg
cover_image_author: Wu Yi
cover_image_author_username: takeshi2
---

<p class="disclaimer">Este artículo no es un tutorial de React ni tampoco de RxJS. Si no sabes absolutamente nada sobre RxJS, te recomiendo comenzar por <a href="https://tech.cornershop.io/programaci%C3%B3n-reactiva-con-rxjs-bebc9432485f" target="_blank" rel="noopener noreferrer">este artículo</a>.</p>

RxJS es una librería para realizar Programación Funcional Reactiva (PFR desde ahora) en JavaScript. Si buscas en internet qué es **PFR**, probablemente encuentres muchas definiciones muy _cool_ y cada una más complicada que la anterior.

Por lejos mi definición de **PFR** favorita es la siguiente:

> _La esencia de la programación funcional reactiva es especificar el comportamiento dinámico de un valor al momento de su declaración_
>
> – Heinrich Apfelmus

<p class="vapor">
    <span>Mindblowing</span>
</p>

**¿Qué significa esto?**

Cuando hacemos **PFR** intentamos definir cómo el valor de una variable va a ir cambiando a través del tiempo al momento de declarar dicha variable. Puede resultar un poco extraño imaginar cómo luciría código de esta naturaleza, porque JavaScript no nos provée primitivas para hacer definiciones de este tipo.

En React existe una forma de definir el valor de una variable que _podría_ satisfacer esta definición, pero con algunas limitantes. Consideremos el siguiente ejemplo:

```javascript
const greeting = React.useMemo(() => `${greet}, ${name}!`, [greet, name]);
```

`useMemo` nos permite definir un valor que será computado cada vez que sus dependencias cambien. En nuestro caso particular, el valor de `greeting` será recalculado dependiendo de los valores de `greet` y `name`. Cabe mencionar que `greeting` es sólo el resultado de la expresión `` `${greet}, ${name}!` ``, sucede que con `useMemo` podemos controlar cuándo es recalculado el valor de nuestra expresión, lo que es conveniente para nuestra definición de reactividad.

¡Maravilloso! Y todo podría quedar hasta ahí y viviríamos felices. Pero pero pero, `useMemo` sólo nos permite definir `greeting` cuando `greet` y `name` cambian, mas no nos proporciona ninguna información sobre dónde y cómo estos valores son actualizados. 

La pregunta del millón entonces es ¿Cómo y dónde es que estas dependencias cambian?

### La verdad de la milanesa

Expandiendo nuestro ejemplo, podríamos tener el siguiente componente:

```javascript
import * as React from 'react';

const GreetSomeone = ({ greet = 'Hello' }) => {
    const [name, setName] = React.useState('World');
    const greeting = React.useMemo(() => `${greet}, ${name}!`, [greet, name]);

    React.useEffect(() => {
        fetchSomeName().then(name => {
            setName(name);
        }, () => {
            setName('Mololongo');
        });
    }, []);

    return <p>{greeting}</p>;
};
```

Nuestro componente `GreetSomeone` recibe `greet` por medio de `props` y `name` como resultado de una promesa que nos retorna `fetchSomeName()`.

Si bien seguimos definiendo `greeting` de la misma manera que en el ejemplo inicial, no podemos determinar sólo leyendo su definición que el valor de una de sus dependencias proviene de una promesa y que es un valor asíncrono.

En JavaScript no existen primitivas para determinar la naturaleza asíncrona del valor de esta expresión (tampoco en React).

### Observables al rescate

Dejemos React a un lado por el momento y veamos cómo podríamos llegar a nuestra definición ideal utilizando RxJS. Partiremos definiendo dos Observables que emitirán los valores de `greet` y `name`, y los compondremos para obtener un Observable que represente el valor de `greeting`:

```javascript
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

const greet$ = of('Hello');
const name$ = of('World');

const greeting$ = combineLatest(greet$, name$).pipe(
    map(([greet, name]) => `${greet}, ${name}!`)
);

greeting$.subscribe(greeting => {
    console.log(greeting);    
});

// ✏️: "Hello, World!" -- En cuanto nos suscribimos a greeting$
```

Recordemos que en nuestro ejemplo de React el valor de `name` proviene de una promesa. Con RxJS definir la naturaleza asíncrona de `name` es sencillo, sólo tenemos que cambiar la definición de `name$` de la siguiente manera:

```javascript
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const greet$ = of('Hello');
const name$ = from(fetchSomeName()).pipe(
    startWith('World'),
    catchError(() => of('Mololongo')),
);

const greeting$ = combineLatest(greet$, name$).pipe(
    map(([greet, name]) => `${greet}, ${name}!`)
);

greeting$.subscribe(greeting => {
    console.log(greeting);    
});

// ✏️: "Hello, World!"      -- En cuanto nos suscribimos a greeting$
// ✅: "Hello, Thundercat!" -- En cuanto `fetchSomeName()` se resuelva exitosamente
// ❌: "Hello, Mololongo!"  -- Si `fetchSomeName()` es rechazada
```

Y con esto ya podemos describir la naturaleza asíncrona de `name$` y por extensión, la de `greeting$`.

### De vuelta a React

Considerando todo lo dicho anteriormente ¿Cómo podemos implementar nuestra solución de RxJS en React?

Para responder esta pregunta, primero nos conviene entender el hecho de que `useMemo` es una suerte de `useState` + `useEffect`. Por ejemplo:

```javascript
const greeting = React.useMemo(() => `${greet}, ${name}!`, [greet, name]);
```

Puede ser descrito de la siguiente forma:

```javascript
const [greeting, setGreeting] = useState(() => `${greet}, ${name}!`);

useEffect(() => {
    setGreeting(() => `${greet}, ${name}!`);
}, [greet, name]);
```

Si bien en la práctica estos dos _snippets_ llegan a resultados muy similares, tiene un par de diferencias sustanciales en cómo lo hacen. El callback que le pasamos a `useEffect` se corre **después** del render, mientras que el de `useMemo` se calcula **antes** de hacer render. En otras palabras, durante el primer render el valor de `greeting` en la versión con `useMemo` ya habrá sido computado; mientras que en la versión con `useEffect`, su valor será el valor inicial cuando fue declarado con `useState`.

El hecho de que podamos describir una actualización de estado dentro de `useEffect`, indica que actualizar una variable o computar un pedazo de estado es en la práctica un efecto secundario.

Dicho esto, la estrategia para utilizar RxJS con React es básicamente **deferir el manejo de estos efectos secundarios** desde React a RxJS.

Partiremos con este proceso copiando todo nuestro código de RxJS dentro de nuestro componente `GreetSomeone`. Para que el componente se renderice correctamente cada vez que el Observable `greeting$` emita un valor, debemos persistir el valor emitido utilizando algún mecanismo conocido por React, como `useState`:

```javascript
import * as React from 'react';
import { combineLatest, from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const GreetSomeone = ({ greet = 'Hello' }) => {
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const greet$ = of(greet);
        const name$ = from(fetchSomeName()).pipe(
            startWith('World'),
            catchError(() => of('Mololongo')),
        );

        const greeting$ = combineLatest(greet$, name$).pipe(
            map(([greet, name]) => `${greet}, ${name}!`)
        );

        const subscription = greeting$.subscribe(value => {
            setGreeting(value);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, []);

    return <p>{greeting}</p>;
};
```

En cuanto el componente se haya montado, el _callback_ que le hemos pasado a `useEffect` se ejecutará y con ello toda la lógica para calcular el valor de `greeting`.

Un problema de nuestra solución actual es que si el valor de la propiedad `greet` cambia, el valor de `greeting` no será recalculado. Esto se debe a que nuestro Observable `greet$` sólo se define cuando se ejecuta el efecto y esto sucede sólo una vez. Cualquier cambio en el valor de `greet` no tendrá ingerencia en la definición de `greet$` (y por lo tanto en el observable `greeting$`).

Una de las cosas que podríamos hacer es agregar `greet` como dependencia a `useEffect`, asegurándonos que el efecto se ejecute cada vez que el valor de `greet` cambie. Si bien esto soluciona nuestro problema, puede tener consecuencias inesperadas.

En primera instancia, el efecto se va a ejecutar cada vez que cambie el valor de `greet`. Cuando el _callback_ se ejecute no solo redefiniremos `greet$` con el último valor de `greet`, sino que también `name$` y esto llamará nuevamente a la función `getSomeName`. 

En nuestro ejemplo inicial sólo nos interesa llamar a `getSomeName` una sola vez, por lo que desechemos esta alternativa.

En mi artículo <a href="https://medium.com/noders/sobre-observables-performance-y-magia-negra-en-react-con-context-y-hooks-dae3e407f7a0" target="_blank" rel="noopener noreferrer">Sobre Observables, Performance y Magia Negra en React con Context y Hooks</a> nos enfrentamos a una situación similar, en la que intentamos exponer un pedazo de estado desde un proveedor de contexto, hacia varios componentes que consumen dicho contexto sin que el proveedor se renderice con cada cambio del valor expuesto.

La solución a la que llegamos en dicho artículo se basa en cierta particularidad sobre el arreglo de dependencias de `useEffect`. El _callback_ de `useEffect` se gatilla sólo cuando alguna de las dependencias que le pasamos cambia. En JavaScript, los valores primitivos se comparan por su valor y los valores que no son primitivos, lo hacen por referencia.

Esto significa que si estamos observando un objeto cuya referencia no cambia, no importa cuanto cambien las propiedades internas de dicho objeto. El _callback_ simplemente no se ejecutará. Sólo lo hará cuando el variable que estamos observando contenga un objeto referencialmente distinto.

Lo que haremos entonces será crear un observable `greet$` (utilizando una `ref` y un `BehaviorSubject`) que emitirá valores cada vez que `greet` cambie:

```javascript
import * as React from 'react';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const GreetSomeone = ({ greet = 'Hello' }) => {
    const greet$ = React.useRef(new BehaviorSubject(greet));

    // Acá observamos `greet` con `useEffect` y promovemos dicho valor a `greet$`
    React.useEffect(() => {
        greet$.current.next(greet);
    }, [greet]);

    // El resto del código queda relativamente igual
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const name$ = from(fetchSomeName()).pipe(
            startWith('World'),
            catchError(() => of('Mololongo')),
        );

        const greeting$ = combineLatest(greet$.current, name$).pipe(
            map(([greet, name]) => `${greet}, ${name}!`)
        );

        const subscription = greeting$.subscribe(value => {
            setGreeting(value);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [greet$]);

    return <p>{greeting}</p>;
};
```

`BehaviorSubject` es una suerte de emisor de eventos al que nos podemos suscribir (tal como a un observable común y corriente), pero con el que podemos producir valores de forma imperativa (con el método `next`). Guardamos nuestro subject utilizando `useRef`, que nos sirve para persistir una referencia entre _renders_.

Si bien ahora tenemos más código, el _callback_ de nuestro `useEffect` principal se ejecuta una sola vez. Hurray!

Podemos mejorar un poco esto ocultando los detalles de implementación con un _custom hook_.

```javascript
const useObservedValue = value => {
    const subject = React.useRef(new BehaviorSubject(value));

    React.useEffect(() => {
        subject.current.next(value);
    }, [value]);

    return React.useMemo(() => subject.current.asObservable(), [subject]);
};
```

Y luego:

```javascript
const GreetSomeone = ({ greet = 'Hello' }) => {
    const greet$ = useObservedValue(greet);
    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => { /* etcétera */ }, [greet$]);

    return <p>{greeting}</p>;
};
```

> En `useObservedValue` retornamos el valor memorizado de `subject.current.asObservable()` para evitar que podamos despachar valores manualmente llamando al método `next`.

Siguiendo con la refactorización de nuestro ejemplo, podemos extraer la definición de `name$` del _callback_ de `useEffect` (de hecho, podemos sacarlo completamente de nuestro componente). Igualmente definiremos `greeting$` fuera del efecto:

```javascript
import * as React from 'react';
import { from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const name$ = from(fetchSomeName()).pipe(
    startWith('World'),
    catchError(() => of('Mololongo')),
);

const GreetSomeone = ({ greet = 'Hello' }) => {
    const greet$ = useObservedValue(greet);
    const greeting$ = React.useMemo(
        () => combineLatest(greet$, name$).pipe(
            map(([greet, name]) => `${greet}, ${name}!`)
        )), []
    );

    const [greeting, setGreeting] = React.useState('');

    React.useEffect(() => {
        const subscription = greeting$.subscribe(value => {
            setGreeting(value);
        });

        return () => {
            subscription.unsubscribe();
        }
    }, [greeting$]);

    return <p>{greeting}</p>;
};
```

Finalmente nuestro `useEffect` sólo se encarga de suscribirse a `greeting$` y persistir cada valor que el observable emite por medio de `setGreeting`.

Incluso esto podríamos encapsularlo por medio de un _custom hook_:

```javascript
const useObservable = (observable) => {
    const [value, setValue] = React.useState();

    React.useEffect(() => {
        const subscription = observable.subscribe((v) => {
            setValue(v);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [observable]);

    return value;
};
```

Finalmente obtenemos:

```javascript
import * as React from 'react';
import { from, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

const name$ = from(fetchSomeName()).pipe(
    startWith('World'),
    catchError(() => of('Mololongo')),
);

const GreetSomeone = ({ greet = 'Hello' }) => {
    const greet$ = useObservedValue(greet);
    const greeting$ = React.useMemo(
        () =>
            combineLatest([greet$, name$]).pipe(
                map(([greet, name]) => `${greet}, ${name}!`)
            ),
        [greet$]
    );

    const greeting = useObservable(greeting$);

    return <p>{greeting}</p>;
};
```

¡Y eso es! Hemos especificado el comportamiento dinámico de `greeting$` en el lugar de su definición. Puedes ver un demo <a href="https://codesandbox.io/s/using-rxjs-observables-inside-react-pjq6n" target="_blank" rel="noopener noreferrer">aquí</a>.

### Ordenando el gallinero 🐔

Ok, lo entiendo. Probablemente crees que la solución que he implementado no es de lo más limpia, y estoy de acuerdo contigo. Pero, es un buen punto de partida para entender qué es necesario para poder usar observables de RxJS en React.

En vez de utilizar nuestros propios hooks para ocultar todo el _boilerplate_ necesario para consumir observables, démosle un vistazo al mismo ejemplo utilizando <a href="https://github.com/LeetCode-OpenSource/rxjs-hooks" target="_blank" rel="noopener noreferrer">rxjs-hooks</a>:

```javascript
import * as React from 'react';
import { from, of } from 'rxjs';
import {
    catchError,
    combineLatest,
    map,
    pluck,
    startWith,
} from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';

const name$ = from(fetchSomeName()).pipe(
    startWith('World'),
    catchError(() => of('Mololongo'))
);

const GreetSomeone = ({ greet = 'Hello' }) => {
    const greeting = useObservable(
        input$ =>
            input$.pipe(
                pluck(0),
                combineLatest(name$),
                map(([greet, name]) => `${greet}, ${name}!`)
            ),
        '',
        [greet]
    );

    return <p>{greeting}</p>;
};
```

El hook `useObservable` expuesto por `rxjs-hooks` acepta 3 parámetros: el primero es una función que debe retornar un observable y recibe el observable `input$` como parámetro; el segundo es el valor inicial que tendrá `greeting`; y el tercero es un arreglo de dependencias que representa el valor que emitirá `input$`.

Cada vez que una de las dependencias observadas cambie, se emitirá el arreglo con el último valor de dichas dependencias en el observable `input$`. Esto nos permite observar la propiedad `greet` y combinarla con `name$` para componer el valor de `greeting`.

El resto es relativamente simple, utilizamos `pluck` para extraer el primer elemento del arreglo emitido por `input$` y esta vez usamos una versión del módulo de operadores de `combineLatest` para combinar el valor de greet con el de `name$`.

Como podemos ver cantidad de código se reduce bastante.

Para terminar, `rxjs-hooks` expone solo un hook más y es `useEventCallback`. Este hook recibe una función de producción que toma un observable de eventos como parámetro que representa los eventos emitidos a partir de cualquier _event handler_ que asignemos a un nodo de JSX. El hook nos retorna un callback (que le pasamos a `onClick`, por ejemplo) y el valor emitido por el observable que retorna la función de producción, tal como sucede con `useObservable`.

---

Y _voilá_, eso ha sido todo por hoy. Al utilizar `rxjs` podemos expresar el comportamiento asíncrono de nuestro estado de una forma más declarativa, por medio de composición de funciones y técnicas de programación funcional.

Igualmente nos permite modelar lógica asíncrona muy compleja que sería una pesadilla de implementar utilizando promesas.

Si bien existe un poco de fricción para utilizar React en conjunto con RxJS, podemos mejorar la forma en que estas librerías interactúan utilizando hooks de React.

Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf) tal vez.

Gracias totales y hasta la próxima.




