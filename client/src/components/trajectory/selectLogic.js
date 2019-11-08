// The trajectory menu.
// jshint esversion: 6

import React from "react";
import { connect } from 'react-redux'
import { resized } from "../app"
import * as globals from "../../globals"
import SelectPres from "./selectPres"

const list = [
    'trajectory-1',
    'trajectory-2',
    'trajectory-3',
]

const mapStateToProps = (state) => {
    console.log('selected:', state.trajectory.viewSelected)
    return {
        list,
        selected: state.trajectory.viewSelected,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: ev => {
            console.log('onChange:ev.target.value:', ev.target.value)
            dispatch({
                type: "trajectory.viewSelected.setUi",
                value: ev.target.value,
            })
            resized()
        },
    }
}

const Select = connect(
    mapStateToProps, mapDispatchToProps
)(SelectPres)

export default Select
