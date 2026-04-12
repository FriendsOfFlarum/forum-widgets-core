import app from 'flarum/admin/app';
import WidgetManager from '../common/WidgetManager';

export { default as extend } from './extend';

app.widgets = new WidgetManager();

app.initializers.add('fof/forum-widgets-core', () => {
  // Nothing to do here yet.
});

// Allow flarum to discover modules
import './admin';
// @ts-ignore
