/* global google */

var React = require('react'),
  ReactDOM = require('react-dom'),
  Geosuggest = require('../../src/Geosuggest'); // eslint-disable-line

var App = React.createClass({ // eslint-disable-line

  /**
   * When the input receives focus
   */
  onFocus: function() {
    console.log('onFocus'); // eslint-disable-line
  },

  /**
   * When the input loses focus
   */
  onBlur: function() {
    console.log('onBlur'); // eslint-disable-line
  },

  onChange: function(value) {
    console.log('input changes to :' + value); // eslint-disable-line
  },

  /**
   * When a suggest got selected
   * @param  {Object} suggest The suggest
   */
  onSuggestSelect: function(suggest) {
    console.log(suggest); // eslint-disable-line
  },

  /**
   * Render the example app
   * @return {Function} React render function
   */
  render: function() {
    var fixtures = [{
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '605 Park Ave',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': 'omgomg',
      'id': 23,
      'createdAt': '2014-12-03T12:55:17.000Z',
      'updatedAt': '2014-12-03T12:55:17.000Z'
    },
    {
      'firstname': 'Raheela',
      'lastname': 'Asifuddin',
      'place_name': null,
      'address1': '521 W 57th St',
      'address2': '3rd Floor',
      'city': 'New York',
      'state_name': 'NY',
      'zipcode': '10019',
      'phone': '(908) 507 - 3415',
      'special_instructions': 'It\'s her bday tomorrow! Thats all.',
      'id': 14934,
      'createdAt': '2015-06-25T15:22:28.000Z',
      'updatedAt': '2015-06-25T15:22:28.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '5 S Street NW Unit 1',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': 'sdfaasdf assadf ',
      'id': 12,
      'createdAt': '2014-12-03T11:16:16.000Z',
      'updatedAt': '2014-12-03T11:16:16.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '5 S Street NW Unit 1',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 16,
      'createdAt': '2014-12-03T11:31:31.000Z',
      'updatedAt': '2014-12-03T11:31:31.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '3300 16th Street NW #201',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': 'asdfasdfads asdf asdf asdf ',
      'id': 15,
      'createdAt': '2014-12-03T11:29:46.000Z',
      'updatedAt': '2014-12-03T11:29:46.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '605 Park Ave',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 22,
      'createdAt': '2014-12-03T12:43:19.000Z',
      'updatedAt': '2014-12-03T12:43:19.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '605 Park Ave',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 21,
      'createdAt': '2014-12-03T12:27:51.000Z',
      'updatedAt': '2014-12-03T12:27:51.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '5 S Street NW Unit 1',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': 'asdfa fasd asdf ',
      'id': 14,
      'createdAt': '2014-12-03T11:18:12.000Z',
      'updatedAt': '2014-12-03T11:18:12.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '5 S Street NW Unit 1',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 18,
      'createdAt': '2014-12-03T11:34:45.000Z',
      'updatedAt': '2014-12-03T11:34:45.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '5 S Street NW Unit 1',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 19,
      'createdAt': '2014-12-03T12:12:55.000Z',
      'updatedAt': '2014-12-03T12:12:55.000Z'
    },
    {
      'firstname': 'Chetan',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '122 E 65th St',
      'address2': '',
      'city': 'Manhattan',
      'state_name': 'NY',
      'zipcode': '10065',
      'phone': '2023025573',
      'special_instructions': '',
      'id': 20,
      'createdAt': '2014-12-03T12:17:12.000Z',
      'updatedAt': '2014-12-03T12:17:12.000Z'
    },
    {
      'firstname': 'Chai',
      'lastname': 'Shenoy',
      'place_name': null,
      'address1': '1111 20th Street Northwest',
      'address2': 'Peace Corps',
      'city': 'Washington',
      'state_name': 'DC',
      'zipcode': '20526',
      'phone': '(301) 520 - 7638',
      'special_instructions': '',
      'id': 10639,
      'createdAt': '2015-05-11T05:54:32.000Z',
      'updatedAt': '2015-05-11T05:54:32.000Z'
    },
    {
      'firstname': 'Test',
      'lastname': 'Order',
      'place_name': null,
      'address1': '987 Florida Ave NW',
      'address2': '',
      'city': 'Washington',
      'state_name': 'DC',
      'zipcode': '20001',
      'phone': '(999) 999 - 9999',
      'special_instructions': 'TEST; JUST DELETE',
      'id': 10338,
      'createdAt': '2015-05-08T17:25:09.000Z',
      'updatedAt': '2015-05-08T17:25:09.000Z'
    }];

    return ( // eslint-disable-line
      <div>
        <Geosuggest
          fixtures={fixtures}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onSuggestSelect={this.onSuggestSelect}
          location={new google.maps.LatLng(53.558572, 9.9278215)}
          radius="20" />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('app')); // eslint-disable-line
