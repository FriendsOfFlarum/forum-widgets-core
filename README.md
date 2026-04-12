# FoF Forum Widgets

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![Latest Stable Version](https://img.shields.io/packagist/v/fof/forum-widgets-core.svg?style=flat-square)](https://packagist.org/packages/fof/forum-widgets-core)
[![Total Downloads](https://img.shields.io/packagist/dt/fof/forum-widgets-core.svg?style=flat-square)](https://packagist.org/packages/fof/forum-widgets-core)

A [Flarum](http://flarum.org) extension. Core framework for managing forum widgets.

![animated screenshot](https://user-images.githubusercontent.com/20267363/127786249-4f17bb07-9dfb-4066-8d91-6c92b61358cd.gif)

![forum screenshot](https://user-images.githubusercontent.com/20267363/127903214-a96f08ba-1a71-42b0-bc17-5b2c65a68859.png)

> [!NOTE]
> This package was previously maintained as [`afrux/forum-widgets-core`](https://github.com/afrux/forum-widgets-core) by [@SychO9](https://github.com/SychO9). It has been transferred to FriendsOfFlarum and is now published as `fof/forum-widgets-core`. The `composer.json` `replace` field ensures existing installs upgrade transparently — no manual removal needed.

## Installation

Remember that this is just a forum widgets editor, it doesn't actually come with any widgets.

```sh
composer require fof/forum-widgets-core:"*"
```

### Migrating from `afrux/forum-widgets-core`

If you currently have `afrux/forum-widgets-core` installed, run:

```sh
composer require fof/forum-widgets-core:"*"
composer remove afrux/forum-widgets-core
php flarum cache:clear
```

## Updating

```sh
composer update fof/forum-widgets-core:"*"
php flarum migrate
php flarum cache:clear
```

## Extend

Extension developers wanting to create widgets with this small framework, the following explains how you can register a new widget, for now you should only register one widget per extension.

1. Require this extension in your extension's `composer.json`:

```json
"require": {
  "flarum/core": "^2.0.0",
  "fof/forum-widgets-core": "^2.0.0"
}
```

2. Create your widget's component in `common/components` by extending the base `Widget` component:

```jsx
import Widget from 'ext:fof/forum-widgets-core/common/components/Widget';

export default class MyWidget extends Widget {
  className() {
    // Custom class name.
    // Use "FofWidgets-Widget--flat" for a flat widget (no container block).
    return 'MyWidget';
  }

  icon() {
    return 'fas fa-circle';
  }

  title() {
    return app.translator.trans('my-extension.forum.widget.title');
  }

  content() {
    return <div className="MyWidget-content">...</div>;
  }
}
```

3. Register your widget in both frontends. Create `common/registerWidget.js`:

```js
import Widgets from 'ext:fof/forum-widgets-core/common/extend/Widgets';
import MyWidget from './components/MyWidget';

export default function (app) {
  new Widgets()
    .add({
      key: 'myWidget',
      component: MyWidget,
      // Can be a callback: () => app.forum.attribute('mySetting')
      isDisabled: false,
      // Is this a one-time-use widget? Leave true if unsure.
      isUnique: true,
      // Default values, overridable by the admin.
      placement: 'end',
      position: 1,
    })
    .extend(app, 'my-extension-id');
}
```

Then in both `admin/index.js` and `forum/index.js`:

```js
import registerWidget from '../common/registerWidget';

app.initializers.add('my-extension-id', () => {
  registerWidget(app);
});
```

4. For TypeScript, add this to the `paths` key in your `tsconfig.json`:

```json
"ext:fof/forum-widgets-core/*": ["../vendor/fof/forum-widgets-core/js/dist-typings/*"]
```

## Links

- [Packagist](https://packagist.org/packages/fof/forum-widgets-core)
- [GitHub](https://github.com/FriendsOfFlarum/forum-widgets-core)
- [Discuss](https://discuss.flarum.org/d/39064)
