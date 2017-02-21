import React from 'react'; // eslint-disable-line

class GeosuggestItem extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleClick = this.handleClick.bind(this);
    this.getSuggestClasses = this.getSuggestClasses.bind(this);
  }

  /**
   * The classes for the suggest item
   * @return {String} The classes
   */
  getSuggestClasses() {
    const className = this.props.suggest.className;
    let classes = 'geosuggest-item';

    classes += this.props.isActive ? ' geosuggest-item--active' : '';
    classes += className ? ' ' + className : ''; // eslint-disable-line

    return classes;
  }

  /**
   * When the element gets clicked
   * @param  {Event} event The click event
   */
  handleClick(event) {
    event.preventDefault();
    this.props.onSuggestSelect(this.props.suggest);
  }

  renderSaved() {
    return (
      <li className={this.getSuggestClasses()} onClick={this.handleClick}>
        <span className="icon icon-house" />
        <strong>
          {this.props.suggest.firstname}{'\u0020'}
          {this.props.suggest.lastname}
        </strong><br />
        {this.props.suggest.place_name}
        {this.props.suggest.address1}{this.props.suggest.address2 ? ` ${this.props.suggest.address2}` : ''},{'\u0020'}
        {this.props.suggest.city}, {this.props.suggest.state_name}
      </li>
    );
  }

  renderGoogle() {
    return (
      <li className={this.getSuggestClasses()} onClick={this.handleClick}>
        {this.props.suggest.label}
      </li>
    );
  }
  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render() {
    return this.props.suggest.label ? this.renderGoogle() : this.renderSaved();
  }

}

GeosuggestItem.defaultProps = {
  isActive: false,
  suggest: {
    label: '',
  },
  onSuggestSelect() {},
};

GeosuggestItem.propTypes = {
  isActive: React.PropTypes.bool,
  suggest: React.PropTypes.object,
  onSuggestSelect: React.PropTypes.func,
};

export default GeosuggestItem;
