---
layout: post_layout.liquid
tags:
    - post
title: Manejo de estado con Context y Hooks en React
subtitle:
description: La “nueva” API de Context de React (disponible desde la versión 16.3) nos permite encapsular un pedazo de estado en un contexto que es inyectable en cualquier lugar de nuestro árbol de componentes.
date: '2019-09-23'
cover_image: /assets/img/covers/floatter.jpg
cover_image_thumbnail: /assets/img/covers/floatter_thumbnail.jpg
cover_image_author: Timothy Meinberg
cover_image_author_username: timothymeinberg
---

La “nueva” API de Context de React (disponible desde la versión 16.3) nos permite encapsular un pedazo de estado en un contexto que es inyectable en cualquier lugar de nuestro árbol de componentes. Por ejemplo:

```javascript
import React from 'react';

const AlbumOfTheWeek = React.createContext({
  title: 'Pop Food',
  artist: 'Jack Stauber',
  genre: 'Edible Pop', // lol
});

export default AlbumOfTheWeek;
```

Luego podemos consumir los valores provistos por `AlbumOfTheWeek` en cualquier lugar de nuestra aplicación a través de un consumidor utilizando [render props](https://medium.com/@osmancea/entendiendo-render-props-en-react-dfe22f84f593):

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import AlbumOfTheWeek from './context/album-of-the-week';

function App() {
  return (
    <UserProfile />
  );
}

function UserProfile() {
  return (
    <section>
      <h1>Hi I'm Osman and this is my album of the week:</h1>
      <AlbumOfTheWeek.Consumer>
        {album => (
          <dl>
            <dt>Title:</dt>
            <dd>{album.title}</dd>
            <dt>Artist:</dt>
            <dd>{album.artist}</dd>
            <dt>Genre:</dt>
            <dd>{album.genre}</dd>
          </dl>
        )}
      </AlbumOfTheWeek.Consumer>
    </section>
  );
}

ReactDOM.render(
  <App />,
  document.getElementByID('root')
);
```

Probablemente en una aplicación real no sabremos el valor del álbum de la semana al momento de declarar el contexto `AlbumOfTheWeek` y debemos consultarlo a través de una API o algo por el estilo. En este caso lo que podemos hacer es proveer un valor para el contexto utilizando `AlbumOfTheWeek.Provider` tras haber obtenido la respuesta de nuestro servicio:

```jsx
// ...

import { getAlbumOfTheWeek } from './services/album-of-the-week';

class App extends React.Component {
  state = {
    album: null
  };

  componentDidMount() {
    getAlbumOfTheWeek().then(res => {
      this.setState({ album: res.data });
    });
  }

  render() {
    return (
      <AlbumOfTheWeek.Provider value={this.state.album}>
        <UserProfile />
      </AlbumOfTheWeek.Provider>
    );
  }
}

// ...
```

Igualmente tenemos que actualizar `UserProfile` ya que el valor inicial de album es `null` y al tratar de acceder a alguna propiedad de nuestro álbum antes de haber seteado su valor, se romperá nuestra aplicación:

```jsx
function UserProfile() {
  return (
    <section>
      <h1>Hi I'm Osman and this is my album of the week:</h1>
      <AlbumOfTheWeek.Consumer>
        {/* Renderizamos la información sólo si album es truthy */}
        {album => album && (
          <dl>
            <dt>Title:</dt>
            <dd>{album.title}</dd>
            <dt>Artist:</dt>
            <dd>{album.artist}</dd>
            <dt>Genre:</dt>
            <dd>{album.genre}</dd>
          </dl>
        )}
      </AlbumOfTheWeek.Consumer>
    </section>
  );
}
```

Como hemos proveído un valor para `AlbumOfTheWeek.Provider`, el valor por defecto que asignamos al momento de crear el contexto es ignorado.

Puedes ver un demo de la aplicación [acá](https://codesandbox.io/s/state-management-context-1-dstvc).

> Antes de continuar me gustaría comentar que algunos de estos casos pueden ser resueltos simplemente pasando los datos por props. En este caso lo hacemos con context meramente para efectos demostrativos del artículo.

### Zapatero a tus zapatos — pastelero a tus pasteles

Hasta el momento nuestro componente App se encarga de implementar la lógica para obtener la información del álbum de la semana y de renderizar `UserProfile`. Podríamos ir un paso más adelante y separar completamente estas dos responsabilidades:

```jsx
class AlbumOfTheWeekProvider extends React.Component {
  state = {
    album: null
  };

  componentDidMount() {
    getAlbumOfTheWeek().then(res => {
      this.setState({ album: res.data });
    });
  }

  render() {
    const { children } = this.props;
    return (
      <AlbumOfTheWeek.Provider value={this.state.album}>
        {children}
      </AlbumOfTheWeek.Provider>
    );
  }
}
```

Básicamente hemos transformado nuestro componente `App` en `AlbumOfTheWeekProvider` y en vez de renderizar `UserProfile`, le hemos pasado `children` al método render.

Con esto hemos conseguido una mejor separación de responsabilidades entre los elementos de nuestra aplicación. Ahora la única responsabilidad de nuestro *provider* es manipular y actualizar la data que le hemos encargado almacenar. Por otra parte `App` sólo se preocupa de renderizar `UserProfile` y conectarlo con `AlbumOfTheWeekProvider`.

Utilizamos nuestro proveedor de la siguiente forma:

```jsx
function App() {
  return (
    <AlbumOfTheWeekProvider>
      <UserProfile />
    </AlbumOfTheWeekProvider>
  );
}

ReactDOM.render(
  <App />,
  document.getElementByID('root')
);
```

Puedes ver el ejemplo actualizado [acá](https://codesandbox.io/s/state-management-context-2-dstvc).

### Introduciendo Hooks

Una de las desventajas de utilizar render props es que es muy difícil utilizar la data de nuestro contexto fuera del método render (o fuera de la función que le pasamos de hijo al consumidor). Digamos que ahora queremos implementar *client-side routing* en nuestra aplicación y al entrar a la página del álbum de la semana, queremos actualizar el título del documento con el nombre del artista y del álbum. Actualizamos nuestro componente `App` para implementar el enrutamiento utilizando `react-router`:

```jsx
import React from 'react';
import {
  BrowserRouter as Router, Switch, Route, NavLink
} from 'react-router-dom';

// ...

function App() {
  return (
    <AlbumOfTheWeekProvider>
      <Router>
        <nav>
          <NavLink exact activeClassName="active" to="/">
            Home
          </NavLink>
          <NavLink activeClassName="active" to="/album-of-the-week">
            Album
          </NavLink>
        </nav>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route
            path="/album-of-the-week"
            component={UserProfile}
          />
        </Switch>
      </Router>
    </AlbumOfTheWeekProvider>
  );
}
```

Y luego en nuestro componente `UserProfile` usamos `contextType` para exponer el valor del contexto en los ciclos de vida de nuestro componente en la propiedad `this.context`:

```jsx
class UserProfile extends React.Component {
  static contextType = AlbumOfTheWeek;

  componentDidMount() {
    // ¿Actualizamos document.title aquí?
    if (this.context) {
      document.title = this.context.title;
    }
  }

  componentDidUpdate() {
    // ¿O lo actualizamos aquí?
    if (document.title !== this.context.title) {
      document.title = this.context.title;
    }
  }

  render() {
    return (
      <section>
        <h1>Hi I'm Osman and this is my album of the week:</h1>
        {this.context && (
          <dl>
            <dt>Title:</dt>
            <dd>{this.context.title}</dd>
            <dt>Artist:</dt>
            <dd>{this.context.artist}</dd>
            <dt>Genre:</dt>
            <dd>{this.context.genre}</dd>
          </dl>
        )}
      </section>
    );
  }
}
```

El problema actual es que al navegar directamente a la url `/album-of-the-week` el valor del contexto será `null` ya que probablemente aún no hemos recibido la respuesta de nuestro servicio que obtiene el álbum de la semana. Cuando el valor del contexto se actualice, se gatillará el ciclo de vida `componentDidUpdate` y podremos actualizar `document.title`.

Si navegamos primero a la ruta base `/` y luego hacemos clic en el link a `/album-of-the-week`, lo más probable es que el contexto ya tenga un valor asignado, por lo que debemos actualizar `document.title` en el ciclo `componentDidMount` (ya que `componentDidUpdate` no se va a ejecutar).

Igualmente el uso de `contextType` no es tan práctico porque está limitado a sólo un contexto por componente. De querer inyectar otro contexto para ser utilizado dentro de los ciclos de vida de `UserProfile` o dentro de algún método de la clase, no podríamos hacerlo.

Puedes ver el ejemplo actualizado [acá](https://codesandbox.io/s/state-management-context-3-9i72e).

Podemos abordar estos problemas de mejor forma utilizando `useContext`:

```jsx
function UserProfile() {
  const album = React.useContext(AlbumOfTheWeek);

  React.useEffect(() => {
    if (album) {
      document.title = album.title;
    }
  }, [album]);

  return (
    <section>
      <h1>Hi I'm Osman and this is my album of the week:</h1>
      {album && (
        <dl>
          <dt>Title:</dt>
          <dd>{album.title}</dd>
          <dt>Artist:</dt>
          <dd>{album.artist}</dd>
          <dt>Genre:</dt>
          <dd>{album.genre}</dd>
        </dl>
      )}
    </section>
  );
}
```

Como podemos ver, el valor provisto por `AlbumOfTheWeek` ahora está disponible dentro del cuerpo de la función y lo podemos usar tanto en el JSX, como en algún otro hook o dentro de un método que definamos en nuestro componente.

### Un caso de confianza

Es posible que hayas notado que para efectos de nuestra aplicación no tiene mucho sentido hacer el llamado a `getAlbumOfTheWeek` dentro de `AlbumOfTheWeekProvider` cuando entramos en la ruta `/` y cargamos el componente `Home`, pues dentro de este no tenemos necesidad de acceder al contexto. O tal vez sí creemos que es necesario cargarlo con antelación para tener la información ya disponible cuando naveguemos a `/album-of-the-week`.

Dicho eso ¿Qué aproximación es mejor? ¿Cómo decido qué hacer?

Mi única respuesta a estas interrogantes es la siguiente:

<p class="vapor">
    <span>Concesiones mutuas</span>
</p>

Y si mi respuesta suena a sinsentido es porque básicamente no hay una respuesta correcta ni una incorrecta. Finalmente es una decisión de diseño de software que tienes que tomar dependiendo de la naturaleza y de las necesidades de tu proyecto.

Frente a esto existen un par de alternativas o patrones que podemos aplicar según sea necesario y te los explico a continuación.

### Cambiar de lugar donde se provee el contexto

O en otras palabras, mover `AlbumOfTheWeekProvider` dentro de la ruta `/album-of-the-week`:

```jsx
function App() {
  return (
    <Router>
      <nav>
        <NavLink exact activeClassName="active" to="/">
          Home
        </NavLink>
        <NavLink activeClassName="active" to="/album-of-the-week">
          Album
        </NavLink>
      </nav>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route
          path="/album-of-the-week"
          render={routeProps => (
            <AlbumOfTheWeekProvider>
              <UserProfile {...routeProps} />
            </AlbumOfTheWeekProvider>
          )}
        />
      </Switch>
    </Router>
  );
}
```

> Pudimos haber movido `AlbumOfTheWeekProvider` dentro de `UserProfile`, pero para nuestro ejemplo no tiene tanto sentido

Con esto nos aseguramos de que el efecto que trae nuestra data del álbum de la semana sólo se ejecutará cuando estemos en la ruta `/album-of-the-week`. La “desventaja” de esto es que si navegamos fuera de `/album-of-the-week` nuestro *provider* se desmontará, por lo que al volver a navegar a la ruta se volverá a ejecutar el llamado a `getAlbumOfTheWeek`. Cabe mencionar que esto no es algo malo per se, pero sí lo tenemos que tener en consideración.

Acá está la [demo](https://codesandbox.io/s/state-management-context-5-wgks9) actualizada.

### Contexto como una API

Otra alternativa es delegar la responsabilidad de hacer el llamado a `getAlbumOfTheWeek`, exponiendo en `AlbumOfTheWeekProvider` una API para que cualquier consumidor del contexto pueda iniciarlo:

```jsx
class AlbumOfTheWeekProvider extends React.Component {
  state = {
    album: null
  };

  constructor(props) {
    super(props);
    this.getAlbumOfTheWeek = this.getAlbumOfTheWeek.bind(this);
  }

  getAlbumOfTheWeek() {
    if (this.state.album) {
      return;
    }

    return albumService.getAlbumOfTheWeek().then((res) => {
      this.setState({ album: res.data });
    });
  }

  render() {
    const { children } = this.props;

    return (
      <Provider
        value={{
          album: this.state.album,
          getAlbumOfTheWeek: this.getAlbumOfTheWeek
        }}
      >
        {children}
      </Provider>
    );
  }
}
```

Luego en `UserProfile` mantenemos todo igual, salvo que invocamos la función expuesta por `AlbumOfTheWeek`:

```jsx
function UserProfile() {
  const { album, getAlbumOfTheWeek } = React.useContext(AlbumOfTheWeek);
  
  useEffect(() => {
    if (album) {
      document.title = album.title;
    }
  }, [album]);

  // Añadimos este efecto
  useEffect(() => {
    getAlbumOfTheWeek();
  }, [getAlbumOfTheWeek]);

  return (
    <section>
      <h1>Hi I'm Osman and this is my album of the week:</h1>
      {album && (
        <dl>
          <dt>Title:</dt>
          <dd>{album.title}</dd>
          <dt>Artist:</dt>
          <dd>{album.artist}</dd>
          <dt>Genre:</dt>
          <dd>{album.genre}</dd>
        </dl>
      )}
    </section>
  );
}
```

Con esto nos aseguramos de traer nuestra data sólo al renderizar el componente `UserProfile`. Como `AlbumOfTheWeekProvider` sigue viviendo en nuestro componente `App`, la data persistirá en el proveedor aunque cambiemos de ruta. Como “desventaja” tenemos que si existen múltiples componentes donde podríamos necesitar la data, debemos implementar la llamada a `getAlbumOfTheWeek` en cada una de ellos.

La última [demo](https://codesandbox.io/s/state-management-context-6-l4qj7).

### Conclusión

Finalmente no existe una regla de oro para implementar tus contextos y probablemente te hayan surgido algunas dudas sobre como organizar tu estado — de hecho, desde *release* de hooks, han salido muchas librerías de manejo de estado con contexto y, la comunidad ha encontrado diversos patrones alrededor de este tema.

Ya que logramos centralizar el manejo de nuestra data en un contexto, podríamos pensar en éste como un store de `redux`, `mobx` o cualquier otra solución de manejo de estados ¿Significa que debo centralizar toda mi data en el mismo contexto? ¿Debo user múltiples contextos, uno para cada tipo de data que voy a manejar? ¿Debo olvidarme de mantener estado local y apuntar por mantener mis componentes de presentación completamente estúpidos?

En mi opinión creo que el approach de dividir y conquistar ha tenido muy buenos resultados en mi día a día. Puedes crear un *provider* por cada tipo de entidad (usuarios, tiendas, productos, cuentas, etc…) que estés manejando y a su vez tener otro *provider* más general y centralizado para manejar información transversal a toda la aplicación.

Finalmente no todo el estado de tu aplicación debe estar centralizado. Sí tiene ventajas hacerlo, porque te ayuda a definir barreras y responsabilidades acotadas para cada actor de tu programa, pero en muchos casos de negocio puedes mantener estado a nivel de componente porque tiene sentido hacerlo así. A final de cuentas y como lo habrás notado, nuestro `AlbumOfTheWeekProvider` no es más que un componente común y silvestre.

---

Y _voilá_, eso ha sido todo por hoy. Si te ha gustado el contenido, no te olvides de darle una compartida en Twitter y seguirme por [ahí](https://twitter.com/daslaf).

Gracias totales y hasta la próxima.
