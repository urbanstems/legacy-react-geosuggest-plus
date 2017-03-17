import React from 'react';
import { spy } from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { describe, it } from 'mocha';

import RecentListItem from '../../src/components/RecentsListItem';

import createRecentsList from '../fixtures/recents';

describe('<Geosuggest />', function () {
  describe('Rendering fixtures', function () {
    let wrapper;
    let props = {
      classes: '',
      onClick: spy(),
      suggest: createRecentsList()[0],
    };

    beforeEach(() => {
      wrapper = shallow(<RecentListItem {...props} />);
    });

    afterEach(() => {
      wrapper = null;
    });

    it('should call "onClick" with the suggestion', function () {
      wrapper.simulate('click');
      expect(props.onClick.calledWith(props.suggest)).to.be.true;
    });
  });

  describe('Using custom markup for the recent suggestions', function () {
    it('should default to using <RecentListItem />', function () {
      const wrapper = mount(<Geosuggest fixtures={createRecentsList()} />);
      wrapper.find('input').simulate('focus');
      expect(wrapper.find(RecentListItem)).to.have.length(5);
    });

    it('should use the custom markup used', function () {
      // The custom component to be used.
      function CustomMarkup(){ return <div></div>; }

      // Create the wrapper and simulate a focus so the list is rendered.
      const wrapper = mount(
        <Geosuggest
          fixtures={createRecentsList()}
          recentListItemMarkup={CustomMarkup}
        />
      );
      wrapper.find('input').simulate('focus');

      // The default should not be used
      expect(wrapper.find(RecentListItem)).to.have.length(0);

      // Instead, our custom markup should be used
      expect(wrapper.find(CustomMarkup)).to.have.length(5);
    });
  });
});
