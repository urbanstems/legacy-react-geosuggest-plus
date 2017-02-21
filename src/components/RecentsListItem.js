import React from 'react';

const RecentListItem = ({ classes, onClick, suggest }) => (
  <li key={suggest} className={classes} onClick={onClick}>
    <span className="icon icon-house" />
    <strong>
      {suggest.firstname}{'\u0020'}
      {suggest.lastname}
    </strong><br />
    {suggest.place_name}
    {suggest.address1}{suggest.address2 ? ` ${suggest.address2}` : ''},{'\u0020'}
    {suggest.city}, {suggest.state_name}
  </li>
);

RecentListItem.propTypes = {
  classes: React.PropTypes.string,
  suggest: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired,
};

RecentListItem.defaultProps = {
  classes: '',
  onClick() {},
};

export default RecentListItem;
