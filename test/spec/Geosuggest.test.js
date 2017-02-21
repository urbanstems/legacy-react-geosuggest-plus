import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { describe, it } from 'mocha';

import Geosuggest from '../../src/Geosuggest';
import RecentListItem from '../../src/components/RecentsListItem';

import createRecentsList from '../fixtures/recents';

describe('<Geosuggest />', function () {
  describe('General functionality', function () {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<Geosuggest />);
    });

    afterEach(() => {
      wrapper = null;
    });

    it('should hide the suggestions initially', function () {
      expect(wrapper.state().isSuggestsHidden).to.be.true;
    });

    it('should show the suggestions once the input is focused', function () {
      wrapper.find('input').simulate('focus');
      expect(wrapper.state().isSuggestsHidden).to.be.false;
    });
  });

  describe('Rendering fixtures', function () {
    let wrapper;
    let props = {
      recentsLimit: 3,
      fixtures: createRecentsList(),
    };

    beforeEach(() => {
      wrapper = mount(<Geosuggest {...props} />);
      wrapper.find('input').simulate('focus');
    });

    afterEach(() => {
      wrapper = null;
    });

    it('should not render more items than the limit', function () {
      expect(wrapper.find('.geosuggest-item')).to.have.length(props.recentsLimit);
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
