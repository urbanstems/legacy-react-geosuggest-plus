import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { describe, it } from 'mocha';

import Geosuggest from '../../src/Geosuggest';

describe('<Geosuggest />', function () {
  it('should render without crashing and burning', function () {
    mount(<Geosuggest />);
  });
});
