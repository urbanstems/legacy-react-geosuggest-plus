/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */
import React from 'react';

class GeosuggestItem extends React.Component {

  static propTypes = {
    isActive: React.PropTypes.boolean,
    suggest: React.PropTypes.object,
    onSuggestSelect: React.PropTypes.func
  }

  /**
   * When the element gets clicked
   * @param  {Event} event The click event
   */
  onClick(event) {
    event.preventDefault();
    this.props.onSuggestSelect(this.props.suggest);
  }

  /**
   * The classes for the suggest item
   * @return {String} The classes
   */
  getSuggestClasses() {
    const className = this.props.suggest.className;
    let classes = 'geosuggest-item';

    classes += this.props.isActive ? ' geosuggest-item--active' : '';
    classes += className ? ' ' + className : '';

    return classes;
  }

  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render() {
    return (
      <li className={this.getSuggestClasses()}
        onClick={this.onClick}>
        <span className="icon icon-house"></span>
        <strong>{this.props.suggest.firstname}
        {this.props.suggest.lastname}</strong><br />
        {this.props.suggest.place_name}
        {this.props.suggest.address1} {this.props.suggest.address2},
        {this.props.suggest.city}, {this.props.suggest.state_name}
      </li>
    );
  }
}

GeosuggestItem.defaultProps = {
  isActive: false,
  suggest: {
    label: ''
  },
  onSuggestSelect: function() {}
};

export default GeosuggestItem;