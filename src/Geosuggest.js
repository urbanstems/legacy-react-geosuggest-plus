import React from 'react';
import GeosuggestItem from './GeosuggestItem';
import RecentListItem from './components/RecentsListItem';
import { K, prop, noop } from './utils';

class Geosuggest extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      isSuggestsHidden: true,
      userInput: this.props.initialValue,
      activeSuggest: null,
      suggests: [], // google predictions
      recents: [] // recent/saved addresses
    };

    this.bindInstanceMethods();
  }

  /**
   * Called on the client side after component is mounted.
   * Google api sdk object will be obtained and cached as a instance property.
   * Necessary objects of google api will also be determined and saved.
   */
  componentDidMount() {
    this.setInputValue(this.props.initialValue);

    const googleMaps = this.props.googleMaps
      || window.google && window.google.maps || this.googleMaps; // eslint-disable-line

    if (!googleMaps) {
      console.error('Google map api was not found in the page.'); // eslint-disable-line
    } else {
      this.googleMaps = googleMaps;
    }

    this.autocompleteService = new googleMaps.places.AutocompleteService();
    this.geocoder = new googleMaps.Geocoder();
    this._isMounted = true; // eslint-disable-line
  }

  /**
   * Change inputValue if prop changes
   * @param {Object} props The new props
   */
  componentWillReceiveProps(props) {
    if (this.props.initialValue !== props.initialValue) {
      this.setState({ userInput: props.initialValue });
    }
  }

  componentWillUnmount() {
    this._isMounted = false; // eslint-disable-line
  }

  /**
   * When the input got changed
   */
  onInputChange() {
    const userInput = this.refs.geosuggestInput.value; // eslint-disable-line

    this.setState({ userInput }, () => {
      this.showSuggests();
      this.props.onChange(userInput);
    });
  }

  /**
   * When the input gets focused
   */
  onFocus() {
    this.props.onFocus();
    this.showSuggests();
  }

  onClick() {
    this.props.onClick();
  }

  /**
   * Click the clear button
   */
  onClearClick() {
    this.clear(() => this.refs.geosuggestInput.focus()); // eslint-disable-line
    this.props.onClearClick();
  }

  /**
   * When a key gets pressed in the input
   * @param  {Event} event The keypress event
   */
  onInputKeyDown(event) {
    switch (event.which) {
      case 40: // DOWN
        event.preventDefault();
        this.activateSuggest('next');
        break;
      case 38: // UP
        event.preventDefault();
        this.activateSuggest('prev');
        break;
      case 13: // ENTER
        event.preventDefault();
        // If activeSuggest is populated
        // then proceed as expected
        if (this.state.activeSuggest) {
          this.selectSuggest(this.state.activeSuggest);
        } else if (this.state.userInput && this.state.suggests.length) {
          // If the user has inputted text
          // AND there are suggestions,
          // we'll default to the first suggestion
          this.selectSuggest(this.state.suggests[0]);
        } else if (this.state.userInput) {
          // Cascades down to just checking
          // if the user has entered text
          // We'll just defer to component `onEmptySuggests`
          this.props.onEmptySuggests();
        }
        break;
      case 9: // TAB
        this.selectSuggest(this.state.activeSuggest);
        break;
      case 27: // ESC
        this.hideSuggests();
        break;
      default:
        break;
    }
  }

  /**
   * Method used for setting initial value.
   * @param {string} value to set in input
   */
  setInputValue(value) {
    this.setState({ userInput: value });
  }

  /**
   * Activate a new suggest
   * @param {String} direction The direction in which to activate new suggest
   */
  activateSuggest(direction) { // eslint-disable-line
    if (this.state.isSuggestsHidden) {
      this.showSuggests();
      return;
    }

    const suggestsLength = this.state.suggests.length;
    const recentsLength = this.state.recents.length;
    const recentsCount = recentsLength > this.props.recentsLimit
      ? this.props.recentsLimit
      : recentsLength;
    const suggestsCount = recentsCount + (suggestsLength - 1);
    const next = direction === 'next';
    let newActiveSuggest = null;
    let newIndex = 0;
    let i = 0;

    for (i; i <= suggestsCount; i++) { // eslint-disable-line
      if (
        this.state.suggests[i] === this.state.activeSuggest ||
        this.state.recents[i] === this.state.activeSuggest
      ) {
        newIndex = next ? i + 1 : i - 1;
      }
    }

    if (!this.state.activeSuggest) {
      newIndex = next ? 0 : suggestsCount;
    }

    if (newIndex >= 0 && newIndex <= suggestsCount) {
      // if suggests not full but recents is
      if (!suggestsLength && recentsCount) {
        newActiveSuggest = this.state.recents[newIndex];
      } else if (suggestsLength && recentsCount && newIndex >= suggestsLength) {
        newActiveSuggest = this.state.recents[newIndex];
      } else {
        newActiveSuggest = this.state.suggests[newIndex];
      }
    }

    this.setState({ activeSuggest: newActiveSuggest });
  }

  /**
   * When an item got selected
   * @param {GeosuggestItem} suggest The selected suggest item
   */
  selectSuggest(suggest = { label: this.state.userInput }) {
    this.setState({
      isSuggestsHidden: true,
      userInput: suggest.label || suggest.altLabel
    });

    if (suggest.location) {
      this.props.onSuggestSelect(suggest);
      return;
    }

    this.geocodeSuggest(suggest);
  }

  /**
   * Geocode a suggest
   * @param  {Object} suggest The suggest
   */
  geocodeSuggest(suggest) {
    let searchObject;
    if (suggest.altLabel) {
      searchObject = {
        address: suggest.altLabel
      };
    } else if (suggest.placeId) {
      searchObject = {
        placeId: suggest.placeId
      };
    }
    this.geocoder.geocode(
      searchObject,
      (results, status) => {
        if (status !== this.googleMaps.GeocoderStatus.OK) {
          return;
        }

        const gmaps = results[0];
        const location = gmaps.geometry.location;

        const newSuggest = Object.assign({}, suggest, {
          gmaps,
          location: {
            lat: location.lat(),
            lng: location.lng(),
          },
        });

        this.props.onSuggestSelect(newSuggest);
      }
    );
  }

  /**
   * Get the recent/saved items for the list
   * @return {Array} The recent/saved items
   */
  getRecentItems() {
    return this.state.recents.map((suggest, index) => {
      const isActive = this.state.activeSuggest &&
        suggest.placeId === this.state.activeSuggest.placeId;

      // shut off at the recentsLimit
      if (index >= this.props.recentsLimit) {
        return null;
      }

      return (
        <GeosuggestItem
          key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onSuggestSelect={this.selectSuggest}
          recentListItemMarkup={this.props.recentListItemMarkup}
        />
      );
    });
  }

  /**
   * Get the suggest items for the list
   * @return {Array} The suggestions
   */
  getSuggestItems() {
    return this.state.suggests.map((suggest) => {
      const isActive = this.state.activeSuggest &&
        suggest.placeId === this.state.activeSuggest.placeId;

      return (// eslint-disable-line no-extra-parens
        <GeosuggestItem
          key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onSuggestSelect={this.selectSuggest}
          recentListItemMarkup={this.props.recentListItemMarkup}
        />
      );
    });
  }

  /**
   * The classes for the suggests list
   * @return {String} The classes
   */
  getSuggestsClasses() {
    let classes = 'geosuggest__suggests';

    classes += this.state.isSuggestsHidden ?
      ' geosuggest__suggests--hidden' : '';

    return classes;
  }

  getContainerClasses() {
    let classes = 'geosuggest-window row';

    classes += this.state.isSuggestsHidden ?
      ' geosuggest__suggests--hidden hidden' : '';

    return classes;
  }

  /**
   * When the input loses focused
   */
  hideSuggests() {
    this.props.onBlur();
    setTimeout(() => {
      if (this._isMounted) { // eslint-disable-line
        this.setState({ isSuggestsHidden: true });
      }
    }, 500);
  }

  /**
   * When the input gets focused
   */
  showSuggests() {
    this.searchSuggests();
    this.setState({ isSuggestsHidden: false });
  }

  /**
   * Update the suggests
   * @param  {Object} suggestsGoogle The new google suggests
   */
  updateSuggests(suggestsGoogle = []) {
    const suggests = [];
    const recents = [];
    // const regex = new RegExp(this.state.userInput, 'gim');
    const skipSuggest = this.props.skipSuggest;

    let index = 0;
    const fixturesLen = this.props.fixtures.length;
    // const limit = fixturesLen > this.props.recentsLimit ? this.props.recentsLimit : fixturesLen;
    // ugh i hate for-loops but seems like i have to
    // utilize it here so i can break out
    for (; index < fixturesLen; index++) { // eslint-disable-line
      const recent = this.props.fixtures[index];
      recent.placeId = recent.id;
      recent.altLabel = this.props.getRecentLabel(recent);
      recents.push(recent);
    }

    suggestsGoogle.forEach((suggest) => {
      if (!skipSuggest(suggest)) {
        suggests.push({
          label: this.props.getSuggestLabel(suggest),
          placeId: suggest.place_id
        });
      }
    });

    this.setState({ suggests });
    this.setState({ recents });
  }

  /**
   * Search for new suggests
   */
  searchSuggests() {
    if (!this.state.userInput) {
      this.updateSuggests();
      return;
    }

    const options = {
      input: this.state.userInput
    };

    if (this.props.location) {
      options.location = this.props.location;
    }

    if (this.props.radius) {
      options.radius = this.props.radius;
    }

    if (this.props.bounds) {
      options.bounds = this.props.bounds;
    }

    if (this.props.types) {
      options.types = this.props.types;
    }

    if (this.props.country) {
      options.componentRestrictions = {
        country: this.props.country
      };
    }

    this.autocompleteService.getPlacePredictions(
      options,
      (suggestsGoogle) => {
        this.updateSuggests(suggestsGoogle);

        if (this.props.autoActivateFirstSuggest) {
          this.activateSuggest('next');
        }
      }
    );
  }

  /*
   * Clear the input and close the suggestion pane
   * () => this.hideSuggests()
   *
   */
  clear(cb = () => {}) {
    this.setState({
      userInput: ''
    }, cb);
  }

  /**
   * Update the value of the user input
   * @param {String} value the new value of the user input
   */
  update(value) {
    this.setState({ userInput: value });
    this.props.onChange(value);
  }

  /**
   * A helper to run one time when the Component is constructed. This allows
   * for instance methods to be passed as props without having to bind the
   * context. This also allows for equality checks to pass when comparing props,
   * since `foo.bind(bar) !== foo.bind(bar)`
   */
  bindInstanceMethods() {
    const methods = [
      'setInputValue',
      'onInputChange',
      'onFocus',
      'onClick',
      'onClearClick',
      'update',
      'clear',
      'searchSuggests',
      'updateSuggests',
      'showSuggests',
      'hideSuggests',
      'onInputKeyDown',
      'activateSuggest',
      'selectSuggest',
    ];

    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render() {
    let suggestionsSection = () => {};
    let recentsSection = () => {};
    if (this.state.suggests.length) {
      suggestionsSection = () => (
        <div className="geosuggest-suggestions">
          <span className="geosuggest-label allcaps">Suggestions</span>
          <ul className="geosuggest__suggests">
            {this.getSuggestItems()}
          </ul>
        </div>
      );
    } else if (this.state.userInput) {
      suggestionsSection = this.props.noSuggestionsMarkup;
    }

    if (this.state.recents.length) {
      recentsSection = () => (
        <div className="geosuggest-recents">
          <span className="geosuggest-label allcaps">Recent Addresses</span>
          <ul className="geosuggest__recents">
            {this.getRecentItems()}
          </ul>
        </div>
      );
    }
    return (
      <div className={`geosuggest-container ${this.props.className}`}>
        <input
          className="geosuggest__input"
          ref="geosuggestInput" // eslint-disable-line
          type="text"
          value={this.state.userInput}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          onKeyDown={::this.onInputKeyDown}
          onChange={::this.onInputChange}
          onFocus={::this.onFocus}
          onClick={::this.onClick}
          onBlur={::this.hideSuggests} />
        {!!this.state.userInput || this.props.hideClearButton &&
          <button className="icon icon-close geosuggest-clear" onClick={::this.onClearClick}></button>
        }
        <div className={this.getContainerClasses()}>
          {suggestionsSection()}
          {recentsSection()}
        </div>
        {this.props.showButton && this.props.buttonMarkup()}
      </div>
    );
  }
}

Geosuggest.propTypes = {
  autoActivateFirstSuggest: React.PropTypes.bool,
  bounds: React.PropTypes.any,
  buttonMarkup: React.PropTypes.func,
  className: React.PropTypes.string,
  country: React.PropTypes.any,
  disabled: React.PropTypes.bool,
  fixtures: React.PropTypes.array,
  getRecentLabel: React.PropTypes.func,
  getSuggestLabel: React.PropTypes.func,
  googleMaps: React.PropTypes.any,
  hideClearButton: React.PropTypes.bool.isRequired,
  initialValue: React.PropTypes.string,
  location: React.PropTypes.any,
  noSuggestionsMarkup: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onClearClick: React.PropTypes.func,
  onClick: React.PropTypes.func,
  onEmptySuggests: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onSuggestSelect: React.PropTypes.func,
  placeholder: React.PropTypes.string,
  radius: React.PropTypes.any,
  recentListItemMarkup: React.PropTypes.func,
  recentsLimit: React.PropTypes.any,
  showButton: React.PropTypes.bool,
  skipSuggest: React.PropTypes.func,
  types: React.PropTypes.any,
};

Geosuggest.defaultProps = {
  autoActivateFirstSuggest: false,
  bounds: null,
  buttonMarkup: K(<button>Enter</button>),
  className: '',
  country: null,
  disabled: false,
  fixtures: [],
  getRecentLabel: prop('zipcode'),
  getSuggestLabel: prop('description'),
  googleMaps: null,
  initialValue: '',
  location: null,
  noSuggestionsMarkup: noop,
  onBlur: noop,
  onChange: noop,
  onClearClick: noop,
  onClick: noop,
  onEmptySuggests: noop,
  onFocus: noop,
  onSuggestSelect: noop,
  placeholder: 'Search places',
  radius: null,
  recentListItemMarkup: RecentListItem,
  recentsLimit: 5,
  showButton: false,
  skipSuggest: noop,
  types: null,
};

export default Geosuggest;
