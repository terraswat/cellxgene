// The trajectory menu.
// jshint esversion: 6

import React from "react";
import * as globals from "../../globals";

const SelectPres = ({ list, selected, onChange }) => {
    return (
        <div
            style={{
                padding: globals.leftSidebarSectionPadding
            }}
        >
            <p
                style={
                    Object.assign({},
                        globals.leftSidebarSectionHeading,
                        { marginTop: 4 }
                    )}
            >
                Trajectory
            </p>
            <select
                value={selected}
                onChange={onChange}
                style={{
                    fontSize: '1.1em',
                }}
            >
                <option value=''>
                    Select to view...
                </option>
                {list.map((opt, i) => (
                    <option
                        value={opt}
                        key={i}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SelectPres
