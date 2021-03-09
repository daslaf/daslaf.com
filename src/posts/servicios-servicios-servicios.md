---
layout: post_layout.liquid
tags:
    - post
title: Servicios, servicios, servicios
subtitle:
description: En este artículo aprenderemos sobre qué es un servicio y crear servicios agnósticos a nuestra UI
date: '2021-03-09'
cover_image: /assets/img/covers/house.jpg
cover_image_thumbnail: /assets/img/covers/house_thumbnail.jpg
cover_image_author: DESIGNECOLOGIST
cover_image_author_username: designecologist
---

Según wikipedia: 

> El término *servicio* se refiere a una funcionalidad de un *software* o a un conjunto de funcionalidades de un *software* con un propósito que diferentes clientes pueden utilizar para distintos propósitos

Dentro del contexto de una aplicación web, un servicio entonces es un componente de *software* que encapsula ciertas funcionalidades y que puede ser reutilizado en distintos lugares de nuestra aplicación. Cuán abstracto o concreto sea un servicio dependerá de las características de nuestra aplicación y de su arquitectura.

En términos de manejo de estado, podemos clasificar nuestros servicios en dos tipos: los que manejan estado y los que no, o *stateful* y *stateless* respectivamente.

### Características de un servicio

La función principal de un servicio es servir como punto de integración entre nuestro sistema y un sistema externo (o entre dos módulos de nuestro propio sistema). En una aplicación web, el caso más común para utilizar un servicio es cuando queremos comunicarnos con algún *backend*, por ejemplo a través de una API REST.

Una de las mayores ventajas de utilizar un servicio para este propósito es que además nos sirve como una unidad natural de encapsulación y de separación entre las distintas capas de nuestra aplicación.

Imaginemos entonces que estamos construyendo una aplicación de pagos donde para realizar distintas acciones –como autorizar una transacción o cambiar información sensible– requerimos explícitamente autorización del usuario pidiéndole su contraseña para ser validada en el *backend*.

Como queremos validar al usuario solicitándole su contraseña cada vez que quiera realizar una transacción, no tiene mucho sentido almacenar esa información en memoria, ya que **siempre** debemos validar la contraseña con el *backend*.

El servicio de autorización podría verse así:

```ts
// authorization.service.ts
const BASE_URL = "//example.com/api/v100/authorize"

type Password = string;
interface AuthorizationResponse {
  authorized: boolean
}

class AuthorizationService {
  static async authorize(password: Password) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: [
        ["Content-Type", "application/json"]
      ],
      body: JSON.stringify({ password })
    });
    const { authorized }: AuthorizationResponse = await res.json();

    return authorized;
  }
}

export default AuthorizationService;
export type { Password };
```

> En este caso hemos usado una clase con un método estático para implementar nuestro servicio, pero lo podríamos haber implementado de otra manera.

El ejemplo anterior corresponde a un servicio *stateless*, pues no necesita almacenar el estado de la transacción en memoria, solo se encarga de realizar la consulta y exponer el resultado.

Podemos utilizar nuestro servicio en el resto de la aplicación de la siguiente forma:

```tsx
// AuthorizeTransaction.tsx
import React from "react";
import AuthorizationService from "../path/to/authorization.service";

const AuthorizeTransaction = ({ onSucceeded, onRejected }) => {
  const [password, setPassword] = React.useState("");

  const handleAuthorization = async (event) => {
    event.preventDefault();

    // Verifica con el servicio si el usuario está autorizado, de ser así ejecuta
    // `onSucceeded`. En el caso de no estar autorizado, ejecuta `onRejected`.
    const authorized = await AuthorizationService.authorize(password);

    if (authorized) {
      onSucceeded();
    } else {
      setPassword(""); // Reiniciamos el input del password de no ser válido
      onRejected();
    }
  };

  return (
    <form onSubmit={handleAuthorization}>
      <input
        name="password"
        type="password"
        value={password}
        onChange={e=> setPassword(e.target.value)}
      />
      <input type="submit" value="Submit" />
    </form>
  );
}

export default AuthorizeTransaction;
```

> En este caso hemos usado React para implementar la UI, pero esto podría hacerse de cualquier otra forma.

Dado que hemos metido toda la lógica de verificación dentro de un solo lugar, cualquier cambio de implementación de nuestro servicio puede ser transparente para el resto de la aplicación, siempre que respetemos la API pública del servicio.

Por ejemplo, podríamos reemplazar la clase con el método estático simplemente por un objeto con una propiedad `authorize` y el resultado sería el mismo:

```ts
// authorization.service.ts
const BASE_URL = "//example.com/api/v100/authorize"

type Password = string;
interface AuthorizationResponse {
  authorized: boolean
}

const authorizationService = {
  authorize: async (password: Password) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: [
        ["Content-Type", "application/json"]
      ],
      body: JSON.stringify({ password })
    });
    const { authorized }: AuthorizationResponse = await res.json();

    return authorized;
  }
};

export default authorizationService;
export type { Password };
```

En una aplicación real probablemente tendremos *backends* dedicados para los ambientes de desarrollo, *staging* y producción. Esto puede ser configurado dentro del mismo servicio, así el resto de nuestra aplicación no tiene que precuparse por apuntar al *backend* correcto.

Digamos que en nuestro proyecto tenemos acceso a variables de entorno y podemos configurar una URL distinta para cada ambiente. Luego nuestro servicio se vería de la siguiente manera:

```ts
// authorization.service.ts
import env from "../path/to/env";

const BASE_URL = env.API_URL + "/v100/authorize"; // Donde el valor de API_URL puede cambiar según el ambiente en el que se ejecute nuestro código

// etc...

class AuthorizationService { /* etc */ }
```

Incluso podemos ir un paso más allá y configurar un servicio para nuestras llamadas HTTP que oculte este detalle de infraestructura:

```ts
// http.service.ts
import env from "../path/to/env";

const httpClient = {
  post: (url = "", payload = {}) => fetch(env.API_URL + url, {
    method: "POST",
    headers: [
      ["Content-Type", "application/json"]
    ],
    body: JSON.stringify(payload)
  }),
  get: (url) => fetch(env.API_URL + url),
  // etc...
};

export default httpClient;
```

Y luego:

```ts
// authorization.service.ts
import httpClient from "../path/to/http.service";

// etc ...
class AuthorizationService {
  static async authorize(password: Password) {
    const res = await httpClient.post("/v100/authorize", { password });
    const { authorized }: AuthorizationResponse = await res.json();

    return authorized;
  }
}

export default AuthorizationService;
// etc ...
```

> Como podemos ver al utilizar servicios estamos creando divisiones naturales dentro de nuestra aplicación. Esta es una buena forma de comenzar a pensar en distintas capas y responsabilidades dentro de nuestra arquitectura.

Imaginemos que con afán de aumentar la seguridad en la aplicación, hemos decidido implementar en el *backend* un contador de intentos al ingresar la contraseña. El usuario cuenta con 4 (cuatro) intentos para ingresar su contraseña: de ingresar una contraseña incorrecta 4 veces consecutivas, la cuenta del usuario será bloqueada. Cada vez que enviamos una contraseña errónea, en la respuesta del servicio obtenemos la cantidad de intentos que nos quedan. Si ingresamos la contraseña correcta, el contador se reinicia. Dicho esto, la nueva respuesta del *backend* tendría la siguiente forma:

```ts
interface AuthorizationResponse {
  authorized: boolean;
  attempts_left: number;
}
```

Una forma de almacenar la cantidad de intentos restantes sería haciéndolo en el componente `AuthorizeTransaction`. El problema de esto es que podríamos tener múltiples instancias de este componente y no tenemos forma alguna de coordinar el estado entre todas las instancias. Otra forma sería utilizar una librería para manejo de estado, que está perfectamente bien, pero escapa de la intención del artículo.

¡También podríamos almacenar la cantidad de intentos restantes en el mismo servicio!

En términos de código podría verse así:

```ts
// authorization.service.ts
import httpClient from "../path/to/http.service";

type Password = string;
interface AuthorizationResponse {
  authorized: boolean
}

class AuthorizationService {
  public _authorized?: boolean;
  public _attempts?: number;
  
  get authorized() {
    return this._authorized;
  };

  get attempts() {
    return this._attempts;
  };

  async authorize(password: Password) {
    const res = await httpClient.post("/v100/authorize", { password });
    const { authorized, attempts_left }: AuthorizationResponse = await res.json();

    this._attempts = attempts_left;
    this._authorized = authorized;

    return {
      authorized: authorized,
      attempts: attempts_left,
    }
  }
}

export default new AuthorizationService(); // Exportamos una instancia del servicio!
export type { Password };
```

El ejemplo anterior corresponde a un servicio *stateful*, pues almacenamos el estado de la transacción en memoria a fin de poder acceder a ella en otro momento.

Igualmente hemos exportado una instancia del servicio pues no requiere de dependencias al momento de ser instanciado y además queremos compartir el estado en toda nuestra aplicación. Esta es una forma simple de implementar el patrón *Singleton*. Si bien no es la forma más escalable de hacerlo, para lo que queremos ilustrar basta y sobra.

Utilizaríamos nuestro servicio de la siguiente forma:

```tsx
// AuthorizeTransaction.tsx
import React from "react";
import authorizationService from "../path/to/authorization.service";

const AuthorizeTransaction = ({ onSucceeded, onRejected }) => {
  const [transation, setTransaction] = React.useState(() => ({
    attemptsLeft: authorizationService.attempts,
    latestAttempt: authorizationService.authorized,
  })); // Inicializamos nuestro componente con la cantidad de intentos que quedan y el resultado de la última transacción
  const [password, setPassword] = React.useState("");

  const handleAuthorization = async (event) => {
    event.preventDefault();

    const { authorized, attempts } = await authorizationService.authorize(password);

    setTransaction({
      attemptsLeft: attempts,
      latestAttempt: authorized
    }); // Persistimos la cantidad de intentos restantes a partir de la respuesta de nuestro servicio

    if (authorized) {
      onSucceeded();
    } else {
      setPassword("");
      onRejected();
    }
  };

  const showRemainingAttempts = !latestAttempt && attemptsLeft !== undefined;

  return (
    <form onSubmit={handleAuthorization}>
      <input
        name="password"
        type="password"
        value={password}
        onChange={e=> setPassword(e.target.value)}
      />
      <input type="submit" value="Submit" />
      {showRemainingAttempts && <p>You have {attemptsLeft} attempts left</p>}
    </form>
  );
}

export default AuthorizeTransaction;
```

Y voilá, cada vez que utilicemos nuestro componente `AuthorizeTransaction` será inicializado con la cantidad de intentos restantes. Como el estado está almacenado en la instancia del servicio y dicha instancia es única, la fuente de la verdad reside solamente allí.

Nuestra solución está lejos de ser perfecta, porque un componente solo recibe la cantidad de intentos restantes cuando enviamos el formulario. Cuando una instancia del componente llama a `authorize`, por el momento no hay forma de propagar dicho cambio al resto de las instancias. Exploraremos como resolver este problema en la próxima entrada de mi serie **"Técnicas de manejo de estado con RxJS"**.

{% include footer %}
