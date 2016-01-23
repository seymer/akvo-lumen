import React, { Component } from 'react';

export default class LibraryDisplayMenu extends Component {
  render() {
    const { sortOrder, onChangeSortOrder, displayMode, onChangeDisplayMode } = this.props;
    return (
      <div>
        <select
          value={sortOrder}
          onChange={evt => onChangeSortOrder(evt.target.value)}
        >
          <option value="LAST_MODIFIED">Last Modified</option>
          <option value="CREATED">Created</option>
          <option value="NAME">Name</option>
        </select>
        <select
          value={displayMode}
          onChange={evt => onChangeDisplayMode(evt.target.value)}
        >
          <option value="GRID">Grid</option>
          <option value="LIST">List</option>
        </select>
      </div>
    );
  }
}

LibraryDisplayMenu.propTypes = {
  sortOrder: React.PropTypes.oneOf(['LAST_MODIFIED', 'CREATED', 'NAME']).isRequired,
  onChangeSortOrder: React.PropTypes.func,
  displayMode: React.PropTypes.oneOf(['GRID', 'LIST']).isRequired,
  onChangeDisplayMode: React.PropTypes.func,
};
