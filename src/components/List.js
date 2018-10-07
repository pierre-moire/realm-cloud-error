import React, {Component} from "react";
import PropTypes from 'prop-types';

class List extends Component {

    render() {
        return (
            <div>
                {this.props.items.map(i => {
                    return <div style={{
                        position: 'absolute',
                        x: i.x,
                        y: i.y,
                        width: '50px',
                        height: '50px',
                        background: 'blue'
                    }}>{i.name}</div>
                })}
            </div>);
    }
}

List.defaultProps = {
    items: []
};

List.propTypes = {
    items: PropTypes.array
};

export default List;
