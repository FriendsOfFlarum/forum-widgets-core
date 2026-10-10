import bootstrapForum from '@flarum/jest-config/src/bootstrap/forum';
import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import enableExtensions from '../../enableExtensions';
import '../../../src/forum';

class Stub extends Component {
  view() {
    return null;
  }
}

beforeAll(() => {
  // The forum payload as it is before the extension's settings are serialized, without the layout attribute.
  bootstrapForum();

  app.initializers.get('fof/forum-widgets-core')(app);
  app.boot();
});

describe('the forum initializer, without a saved layout in the payload', () => {
  it('uses the layout the widgets were registered with', () => {
    enableExtensions('acme-widgets');
    app.widgets.add({ key: 'stats', placement: 'end', position: 0, component: Stub, isDisabled: false, isUnique: true }, 'acme-widgets');

    expect(app.widgets.get('end').map((w) => w.id)).toEqual(['acme-widgets:stats']);
  });
});
