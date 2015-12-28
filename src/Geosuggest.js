/* global google */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */
import React from 'react';
import GeosuggestItem from './GeosuggestItem';

class Geosuggest extends React.Component {

  /**
   * Get the initial state
   * @param {Object} Props
   */
  constructor(props) {
    super(props);
    this.state = {
      isSuggestsHidden: true,
      userInput: this.props.initialValue,
      activeSuggest: null,
      suggests: [], // google predictions
      recents: [] // recent/saved addresses
    };
  }

  /**
   * Called on the client side after component is mounted.
   * Google api sdk object will be obtained and cached as a instance property.
   * Necessary objects of google api will also be determined and saved.
   */
  componentDidMount() {
    this.setInputValue(this.props.initialValue);

    var googleMaps = this.props.googleMaps
      || google && google.maps || this.googleMaps;

    if (!googleMaps) {
      console.error('Google map api was not found in the page.');
    } else {
      this.googleMaps = googleMaps;
    }

    this.autocompleteService = new googleMaps.places.AutocompleteService();
    this.geocoder = new googleMaps.Geocoder();
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

  /**
   * Method used for setting initial value.
   * @param {string} value to set in input
   */
  setInputValue(value) {
    this.setState({
      userInput: value
    });
  }

  /**
   * When the input got changed
   */
  onInputChange() {
    var userInput = this.refs.geosuggestInput.value;

    this.setState({ userInput: userInput }, () => {
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

  /**
   * Update the value of the user input
   * @param {String} value the new value of the user input
   */
  update(value) {
    this.setState({ userInput: value });
    this.props.onChange(value);
  }

  /*
   * Clear the input and close the suggestion pane
   */
  clear() {
    this.setState({ userInput: '' }, () => {
      this.hideSuggests();
    });
  }

  /**
   * Search for new suggests
   */
  searchSuggests() {
    if (!this.state.userInput) {
      this.updateSuggests();
      return;
    }

    var options = {
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
        console.log('++++++', suggestsGoogle);
        this.updateSuggests(suggestsGoogle);

        if (this.props.autoActivateFirstSuggest) {
          this.activateSuggest('next');
        }
      }
    );
  }

  /**
   * Update the suggests
   * @param  {Object} suggestsGoogle The new google suggests
   */
  updateSuggests(suggestsGoogle) {
    if (!suggestsGoogle) {
      suggestsGoogle = [];
    }

    let suggests = [];
    let recents = [];
    const regex = new RegExp(this.state.userInput, 'gim');
    const skipSuggest = this.props.skipSuggest;

    // recent/saved
    this.props.fixtures.forEach(recent => {
      if (!skipSuggest(recent)) {
        recent.placeId = recent.id;
        recent.altLabel = this.props.getRecentLabel(recent);
        recents.push(recent);
      }
    });

    suggestsGoogle.forEach(suggest => {
      if (!skipSuggest(suggest)) {
        suggests.unshift({
          label: this.props.getSuggestLabel(suggest),
          placeId: suggest.place_id
        });
      }
    });

    this.setState({ suggests: suggests });
    this.setState({ recents: recents });
  }

  /**
   * When the input gets focused
   */
  showSuggests() {
    this.searchSuggests();
    this.setState({ isSuggestsHidden: false });
  }

  /**
   * When the input loses focused
   */
  hideSuggests() {
    this.props.onBlur();
    setTimeout(() => {
      this.setState({ isSuggestsHidden: true });
    }, 100);
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
        this.selectSuggest(this.state.activeSuggest);
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
   * Activate a new suggest
   * @param {String} direction The direction in which to activate new suggest
   */
  activateSuggest(direction) { // eslint-disable-line
    if (this.state.isSuggestsHidden) {
      this.showSuggests();
      return;
    }

    var suggestsCount = this.state.suggests.length - 1,
      next = direction === 'next',
      newActiveSuggest = null,
      newIndex = 0,
      i = 0; // eslint-disable-line id-length

    for (i; i <= suggestsCount; i++) {
      if (this.state.suggests[i] === this.state.activeSuggest) {
        newIndex = next ? i + 1 : i - 1;
      }
    }

    if (!this.state.activeSuggest) {
      newIndex = next ? 0 : suggestsCount;
    }

    if (newIndex >= 0 && newIndex <= suggestsCount) {
      newActiveSuggest = this.state.suggests[newIndex];
    }

    this.setState({ activeSuggest: newActiveSuggest });
  }

  /**
   * When an item got selected
   * @param {GeosuggestItem} suggest The selected suggest item
   */
  selectSuggest(suggest) {
    if (!suggest) {
      suggest = {
        label: this.state.userInput
      };
    }

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
    this.geocoder.geocode(
      { address: suggest.label || suggest.altLabel },
      (results, status) => {
        if (status !== this.googleMaps.GeocoderStatus.OK) {
          return;
        }

        var gmaps = results[0],
          location = gmaps.geometry.location;

        suggest.gmaps = gmaps;
        suggest.location = {
          lat: location.lat(),
          lng: location.lng()
        };

        this.props.onSuggestSelect(suggest);
      }
    );
  }

  /**
   * Get the recent/saved items for the list
   * @return {Array} The recent/saved items
   */
  getRecentItems() {
    return this.state.recents.map((suggest, index) => {
      var isActive = this.state.activeSuggest &&
        suggest.placeId === this.state.activeSuggest.placeId;
        
      // shut off at 5
      if (index > 4) {
        return;
      }

      return (// eslint-disable-line no-extra-parens
        <GeosuggestItem
          key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onSuggestSelect={::this.selectSuggest} />
      );
    });
  }

  /**
   * Get the suggest items for the list
   * @return {Array} The suggestions
   */
  getSuggestItems() {
    return this.state.suggests.map((suggest, index) => {
      var isActive = this.state.activeSuggest &&
        suggest.placeId === this.state.activeSuggest.placeId;

      return (// eslint-disable-line no-extra-parens
        <GeosuggestItem
          key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onSuggestSelect={::this.selectSuggest} />
      );
    });
  }

  /**
   * The classes for the suggests list
   * @return {String} The classes
   */
  getSuggestsClasses() {
    var classes = 'geosuggest__suggests';

    classes += this.state.isSuggestsHidden ?
      ' geosuggest__suggests--hidden' : '';

    return classes;
  }

  getContainerClasses() {
    var classes = 'geosuggest-container row';

    classes += this.state.isSuggestsHidden ?
      ' geosuggest__suggests--hidden hidden' : '';

    return classes;
  }

  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render() {
    return (
      <div className={'geosuggest ' + this.props.className}>
        <input
          className="geosuggest__input"
          ref="geosuggestInput"
          type="text"
          value={this.state.userInput}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          onKeyDown={::this.onInputKeyDown}
          onChange={::this.onInputChange}
          onFocus={::this.onFocus}
          onBlur={::this.hideSuggests} />

        <div className={this.getContainerClasses()}>
          <span className="geosuggest-label allcaps">Suggestions</span>
          <ul className="geosuggest__suggests">
            {this.getSuggestItems()}
          </ul>
          <span className="geosuggest-label allcaps">Recent Addresses</span>
          <ul className="geosuggest__recents">
            {this.getRecentItems()}
          </ul>
        </div>
      </div>
    );
  }
}

Geosuggest.propTypes = {
  autoActivateFirstSuggest: React.PropTypes.bool,
  bounds: React.PropTypes.any,
  className: React.PropTypes.string,
  country: React.PropTypes.any,
  disabled: React.PropTypes.bool,
  fixtures: React.PropTypes.array,
  getRecentLabel: React.PropTypes.func,
  getSuggestLabel: React.PropTypes.func,
  googleMaps: React.PropTypes.any,
  initialValue: React.PropTypes.string,
  location: React.PropTypes.any,
  onBlur: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onSuggestSelect: React.PropTypes.func,
  placeholder: React.PropTypes.string,
  radius: React.PropTypes.any,
  skipSuggest: React.PropTypes.func,
  types: React.PropTypes.any
};

Geosuggest.defaultProps = {
  fixtures: [],
  initialValue: '',
  placeholder: 'Search places',
  disabled: false,
  className: '',
  location: null,
  radius: null,
  bounds: null,
  country: null,
  types: null,
  googleMaps: null,
  onSuggestSelect: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onChange: () => {},
  skipSuggest: () => {},
  getRecentLabel: recent => recent.zipcode,
  getSuggestLabel: suggest => suggest.description,
  autoActivateFirstSuggest: false
};

export default Geosuggest;
