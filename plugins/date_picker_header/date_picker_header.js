import React from "react"
import DateObject from "react-date-object"
import "./date_picker_header.css"

export default function DatePickerHeader({
    state,
    setState,
    position,
    size = "big",
    isChildInTop,
    isChildInBottom,
    isChildInLeft,
    isChildInRight,
    calendar = state.calendar,
    local = state.local,
    ...props
}) {
    let selectedDate, isSingle

    if (state.selectedDate && !state.multiple && !state.range && !Array.isArray(state.selectedDate)) {
        //single mode
        selectedDate = state.selectedDate
        isSingle = true
    } else if (Array.isArray(state.selectedDate)) {
        selectedDate = state.focused || getLastItem(state.selectedDate)
        isSingle = false
    } else if (!selectedDate) {
        selectedDate = new DateObject()
        isSingle = false
    }

    selectedDate = new DateObject(selectedDate).set({ calendar, local })

    let classNames = ["rmdp-header-plugin", position, size]

    if (!isSingle) classNames.push("not-single")

    if (["left", "right"].includes(position)) {
        if (isChildInTop) classNames.push("no-border-radius-top-" + position)
        if (isChildInBottom) classNames.push("no-border-radius-bottom-" + position)
        if (isChildInLeft) classNames.push("no-border-radius-left")
        if (isChildInRight) classNames.push("no-border-radius-right")
    } else {
        if (isChildInTop) classNames.push("no-border-radius-top")
        if (isChildInBottom) classNames.push("no-border-radius-bottom")
    }

    delete props.registerListener

    return (
        <div
            className={classNames.join(" ")}
            {...props}
        >
            <div className="rmdp-hp-dddd">{selectedDate.format("dddd")}</div>
            <div className="rmdp-hp-dd">{selectedDate.format("DD")}</div>
            <div className="rmdp-hp-my">{selectedDate.format("MMM YYYY")}</div>
        </div>
    )

    function getLastItem(array) {
        return array[array.length - 1]
    }
}