//
// This web interface has been quickly thrown together. It's not production code.
//

components = {};

components.editButton = () => $(`<a href="#" class="fas fa-edit" title="Edit"></a>`);

components.deleteButton = () => $(`<a href="#" class="fas fa-trash-alt" title="Delete"></a>`);

components.seekButton = () => $(`<a href="#" class="fas fa-arrows-alt-h" title="Seek"></a>`);

components.seekButton = () => $(`<a href="#" class="fas fa-arrows-alt-h" title="Seek"></a>`);

components.cutButton = () => $(`<a href="#" class="fas fa-cut\" title="Cut"></a>`);

components.overlayButton = () => $(`<a href="#" class="fas fa-layer-group" title="Overlay"></a>`);

components.removeButton = () => $(`<a href="#" class="fas fa-eye-slash" title="Remove from mix"></a>`);

components.mutedButton = () => $(`<a href="#" class="fas fa-volume-off" title="Unmute"></a>`);

components.unmutedButton = () => $(`<a href="#" class="fas fa-volume-up" title="Mute"></a>`);

components.stateIcon = ( state, currentState ) => {
  const selected = state === currentState;
  const icons = {
    'PLAYING': 'fa-play',
    'PAUSED': 'fa-pause',
    'READY': 'fa-stop',
    'NULL': 'fa-exclamation-triangle'
  };
  const iconName = icons[state];
  return `<a href="#" class="fas ${iconName} ${selected ? '' : ' icon-unselected'}" data-state="${state}" ></a>`
};

components.openCards = {};
components.card = (block) => {
  const card = $('<div class="block-card"></div>');
  const header = $('<div class="block-card-head"></div>');

  if ( block.title ) header.append( block.title );
  if ( block.options ) {
    const options = $('<div class="option-icons"></div>');
    options.append( block.options );
    header.append( options )
  }

  card.append( header );
  if (block.state) card.append(block.state);
  if (block.mixOptions) card.append(block.mixOptions);

  const cardBody = $('<div class="block-card-body"></div>');
  cardBody.append( block.body );
  if ( !components.openCards[block.title] ) cardBody.css( 'display', 'none' );

  const setToggleMsg = (target) => { target.html(components.openCards[block.title] ? components.hideDetails() : components.showDetails()) };
  const toggleSwitch = $('<a href="#">Toggle</a>').click((change) => {
    cardBody.toggle(components.openCards[block.title] = !components.openCards[block.title]);
    setToggleMsg($(change.target));
    return false;
  });

  setToggleMsg(toggleSwitch);

  card
    .append($('<div />')
      .addClass('block-card-toggle')
      .append(toggleSwitch));

  card
    .append(cardBody);

  return $('<div class="block-card-outer col-xl-3 col-lg-4 col-md-6 col-12"></div>')
    .append( card )
};

components.stateBox = ( item, onClick ) => {
  const stateBoxDetails = components._stateIcons( item );

  stateBoxDetails.value.click( change => {
    const state = change.target.dataset.state;
    if ( state ) onClick(item.id, state );
    return false;
  });

  let msg = stateBoxDetails.value;

  if (item.position) msg.append(' ', prettyDuration(item.position));

  return $('<div></div>')
    .append( msg )
    .addClass(stateBoxDetails.className)
};

components._stateIcons = (item) => {
  let desc = ' ' + item.state;
  if ( item.state === 'PAUSED' && item.hasOwnProperty('buffering_percent' ) && item.buffering_percent !== 100 ) {
    desc = ' BUFFERING (' + item.buffering_percent + '%)'
  }
  else if ( item.desired_state && item.desired_state !== item.state ) {
    desc = ' ' + item.state + ' &rarr; ' + item.desired_state
  }
  const allIcons = $('<div class="state-icons"></div>')
    .append([
      components.stateIcon('NULL', item.state),
      components.stateIcon('READY', item.state),
      components.stateIcon('PAUSED', item.state),
      components.stateIcon('PLAYING', item.state),
      desc,
    ]);

  return { value: allIcons, className: item.state }
};

components.volumeInput = (volume) => {
  const DEFAULT_VOLUME = 1.0;
  if ( volume === undefined || volume === null ) volume = DEFAULT_VOLUME;
  volume *= 100; // as it's a percentage
  const min = 0, max = 100, step = 1;
  return formGroup({
    id: 'input-volume',
    label: 'Volume',
    name: 'volume',
    type: 'range',
    'min': min,
    'max': max,
    'step': step,
    'value': volume,
    'data-slider-min': min,
    'data-slider-max': max,
    'data-slider-step': step,
    'data-slider-value': volume,
  });
};

components.hideDetails = () => '<i class="fas fa-caret-down"></i> Hide details';
components.showDetails = () => '<i class="fas fa-caret-right"></i> Show details';

components.getMixOptions = ( src ) => {
  return mixersHandler.items
    .map( mixer => {
      if ( !mixer.sources ) return;
      if ( src === mixer ) return;

      const foundThis = mixer.sources.find( x => x.uid === src.uid );
      const inMix = foundThis && foundThis.in_mix ? 'In mix' : 'Not in mix';
      const div = $('<div class="mix-option"></div>');

      if (foundThis && foundThis.in_mix) {

        div.addClass('mix-option-showing');

        const removeButton = components.removeButton();

        removeButton.click(() => {
          mixersHandler.remove( mixer, src );
          return false;
        });

        const buttons = $('<div class="option-icons"></div>');
        buttons.append( [removeButton] );
        div.append( buttons );

      }

      else {
        div.addClass('mix-option-hidden');
        const cutButton = components.cutButton();
        cutButton.click(() => {
          mixersHandler.cut( mixer, src );
          return false;
        });

        const overlayButton = components.overlayButton();
        overlayButton.click(() => {
          mixersHandler.overlay( mixer, src );
          return false;
        });

        const buttons = $('<div class="option-icons"></div>');

        buttons.append([cutButton, overlayButton]);
        div.append(buttons);
      }

      div.append(`<strong>Mixer ${mixer.id}:</strong> ${inMix}`);
      return div
    })
    .filter(x => !!x)
};
