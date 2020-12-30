import React, { useState, useEffect } from "react"
import DayPicker from "../day_picker/day_picker"
import Header from "../header/header"
import MonthPicker from "../month_picker/month_picker"
import YearPicker from "../year_picker/year_picker"
import DaysPanel from "../days_panel/days_panel"
import TimePicker from "../time_picker/time_picker"
import DateObject from "react-date-object"
import "./calendar.css"

export default function Calendar({
    value,
    calendar = "gregorian",
    local = "en",
    format,
    timePicker,
    onlyTimePicker,
    onlyMonthPicker,
    onlyYearPicker,
    range = false,
    multiple = false,
    mustShowDates = true,
    className,
    weekDays,
    months,
    children,
    onChange,
    showOtherDays,
    minDate,
    maxDate,
    mapDays,
    disableMonthPicker,
    disableYearPicker,
    formattingIgnoreList,
    onReady,
    eachDaysInRange,
    onlyShowInRangeDates = true,
    zIndex = 100,
    plugins = []
}) {
    let [state, setState] = useState({}),
        listeners = {}

    useEffect(() => {
        setState(state => {
            let { date, selectedDate, initialValue, focused } = state

            function getFormat() {
                if (format) return format
                if (timePicker && !range && !multiple) return "YYYY/MM/DD HH:mm:ss"
                if (onlyTimePicker) return "HH:mm:ss"
                if (onlyMonthPicker) return "MM/YYYY"
                if (onlyYearPicker) return "YYYY"
                if (range || multiple) return "YYYY/MM/DD"
            }

            function checkDate(date) {
                if (date.calendar !== calendar) date.setCalendar(calendar)
                if (date.local !== local) date.setLocal(local)
                if (date._format !== $format) date.setFormat($format)

                return date
            }

            let $mustShowDates = multiple || range || Array.isArray(value) ? mustShowDates : false,
                $timePicker = timePicker,
                $onlyTimePicker = onlyTimePicker,
                $onlyMonthPicker = onlyMonthPicker,
                $onlyYearPicker = onlyYearPicker,
                $multiple = multiple,
                $format = getFormat(),
                $value = value

            if (!$value) {
                if (!date) date = new DateObject({ date, calendar, local, format: $format })
                if (initialValue) selectedDate = undefined
            }

            if ($value) {
                let values = [].concat($value)
                let isValid = values.every(val => isValidDateObject(val, calendar, local, $format))

                let isValueSameAsInitialValue = false

                if (!isValid) {
                    initialValue = initialValue ? [].concat(initialValue) : []

                    isValueSameAsInitialValue = values.every((val, index) => isSame(val, initialValue[index]))
                }

                if (!isValid && !isValueSameAsInitialValue) {
                    date = new DateObject({
                        date: Array.isArray($value) ? $value[$value.length - 1] : $value,
                        calendar,
                        local,
                        format: $format
                    })

                    if (!date.isValid) date = new DateObject({ calendar, local, format: $format })

                    selectedDate = getSelectedDate($value, calendar, local, $format)
                } else {
                    selectedDate = isValid ? $value : getSelectedDate($value, calendar, local, $format)
                }

                if (Array.isArray(selectedDate)) {
                    if (!date) {
                        let lastSelectedDate = selectedDate[selectedDate.length - 1]

                        date = new DateObject(lastSelectedDate)
                    }
                } else {
                    date = new DateObject(selectedDate)
                }
            }

            checkDate(date)

            if (Array.isArray(selectedDate)) {
                selectedDate = selectedDate.map(checkDate)
            } else if (selectedDate) {
                checkDate(selectedDate)
            }

            if ($multiple || range || Array.isArray($value)) {
                if (!selectedDate) selectedDate = []
                if (!Array.isArray(selectedDate)) selectedDate = [selectedDate]
                if (!range && !$multiple) $multiple = true
                if (range && selectedDate.length > 2) {
                    let lastItem = selectedDate[selectedDate.length - 1]

                    selectedDate = [selectedDate[0], lastItem]
                    focused = lastItem
                }

                $timePicker = false
                $onlyTimePicker = false
                $onlyMonthPicker = false
                $onlyYearPicker = false
            } else {
                if (Array.isArray(selectedDate)) selectedDate = selectedDate[selectedDate.length - 1]

                $mustShowDates = false
            }

            return {
                ...state,
                date,
                selectedDate,
                multiple: $multiple,
                range,
                mustShowDates: $mustShowDates,
                timePicker: $timePicker,
                onlyTimePicker: $onlyTimePicker,
                onlyMonthPicker: $onlyMonthPicker,
                onlyYearPicker: $onlyYearPicker,
                initialValue: state.initialValue || $value,
                weekDays,
                months,
                value: $value,
                focused,
                calendar,
                local,
                format: $format
            }
        })
    }, [
        value,
        calendar,
        local,
        format,
        timePicker,
        onlyTimePicker,
        onlyMonthPicker,
        onlyYearPicker,
        range,
        multiple,
        mustShowDates,
        weekDays,
        months
    ])

    useEffect(() => {
        if (!minDate && !maxDate) return

        setState(state => {
            let { calendar, local, format } = state

            let [selectedDate, $minDate, $maxDate] = getDateInRangeOfMinAndMaxDate(
                getSelectedDate(value, calendar, local, format),
                minDate,
                maxDate
            )

            return {
                ...state,
                inRangeDates: onlyShowInRangeDates ? selectedDate : state.selectedDate,
                minDate: $minDate,
                maxDate: $maxDate
            }
        })
    }, [minDate, maxDate, onlyShowInRangeDates, value])

    useEffect(() => {
        if (state.ready && onReady instanceof Function) onReady()
    }, [state.ready, onReady])

    let isRTL = ["fa", "ar"].includes(state.date?.local),
        topClassName = getBorderClassName(["top", "bottom"]),
        clonedPlugins = { top: [], bottom: [], left: [], right: [] }

    initPlugins(arguments[0])

    return (state.date ?
        <div
            className={`rmdp-wrapper ${state.ready ? "active" : ""} ${className || ""} ${(state.range || state.multiple) && state.mustShowDates ? "" : "rmdp-single"}`}
            style={{ zIndex, direction: "ltr" }}
        >
            {clonedPlugins.top}
            <div style={{ display: "flex" }} className={topClassName}>
                {clonedPlugins.left}
                <div style={{ display: "flex" }} className={`${isRTL ? "rmdp-rtl" : ""} ${getBorderClassName(["left", "right"])}`}>
                    <div style={{ height: "max-content", margin: "auto" }}>
                        <Header
                            state={state}
                            setState={setState}
                            onChange={handleChange}
                            disableYearPicker={disableYearPicker}
                            disableMonthPicker={disableMonthPicker}
                        />
                        <div style={{ position: "relative" }}>
                            <DayPicker
                                state={state}
                                setState={setState}
                                onChange={handleChange}
                                showOtherDays={showOtherDays}
                                mapDays={mapDays}
                                listeners={listeners}
                                onlyShowInRangeDates={onlyShowInRangeDates}
                            />
                            <MonthPicker
                                state={state}
                                setState={setState}
                                onChange={handleChange}
                            />
                            <YearPicker
                                state={state}
                                setState={setState}
                                onChange={handleChange}
                            />
                        </div>
                        <TimePicker
                            state={state}
                            setState={setState}
                            onChange={handleChange}
                            formattingIgnoreList={formattingIgnoreList}
                        />
                        {children}
                    </div>
                    <DaysPanel
                        state={state}
                        setState={setState}
                        onChange={handleChange}
                        formattingIgnoreList={formattingIgnoreList}
                        eachDaysInRange={eachDaysInRange}
                    />
                </div>
                {clonedPlugins.right}
            </div>
            {clonedPlugins.bottom}
        </div>
        :
        null
    )

    function initPlugins(calendarArguments) {
        if (!state.ready) return

        let getPosition = index => plugins[index].props.position

        plugins.forEach((plugin, index) => {
            let obj = {},
                position = plugin.props.position

            if (!clonedPlugins[position] || plugin.props.disabled) return

            if (["top", "bottom"].includes(position)) {
                for (let i = 0; i < plugins.length; i++) {
                    if (["left", "right"].includes(getPosition(i)) || plugins[i].props.disabled) continue
                    if (obj.isChildInTop && obj.isChildInBottom) break
                    if (getPosition(i) === position && i < index) obj.isChildInTop = true
                    if (getPosition(i) === position && i > index) obj.isChildInBottom = true
                }
            } else {
                if (topClassName.includes("top")) obj.isChildInTop = true
                if (topClassName.includes("bottom")) obj.isChildInBottom = true

                for (let i = 0; i < plugins.length; i++) {
                    if (["top", "bottom"].includes(getPosition(i)) || plugins[i].props.disabled) continue
                    if (obj.isChildInLeft && obj.isChildInRight) break
                    if (getPosition(i) === "left" && i < index) obj.isChildInLeft = true
                    if (getPosition(i) === "right" && i > index) obj.isChildInRight = true
                }
            }

            clonedPlugins[position].push(React.cloneElement(plugin, {
                key: index,
                state,
                setState,
                position,
                registerListener,
                calendarArguments,
                ...obj
            }))
        })
    }

    function handleChange(selectedDate, state) {
        if (selectedDate && listeners.change) listeners.change.forEach(callback => callback(selectedDate))
        if (state) setState(state)
        if (selectedDate && onChange instanceof Function) onChange(selectedDate)
    }

    function getBorderClassName(positions) {
        return Array.from(
            new Set(
                plugins.map(plugin => {
                    if (
                        positions.includes(plugin.props.position) &&
                        !plugin.props.disabled
                    ) return "border-" + plugin.props.position

                    return ""
                })
            )
        ).join(" ")
    }

    function registerListener(event, callback) {
        if (!listeners[event]) listeners[event] = []

        listeners[event].push(callback)
    }
}

function isValidDateObject(date, calendar, local, format) {
    return date instanceof DateObject &&
        date.isValid &&
        date.calendar === calendar &&
        date.local === local &&
        date._format === format
}

function isSame(arg1, arg2) {
    if ((arg1 instanceof Date) && !(arg2 instanceof Date)) return false
    if ((arg1 instanceof DateObject) && !(arg2 instanceof DateObject)) return false
    if ((arg1 instanceof Date) || (arg1 instanceof DateObject)) {
        if (arg1 instanceof Date && !isValidDate(arg1) && !isValidDate(arg2)) return true

        return arg1 - arg2 === 0
    }

    return arg1 === arg2
}

function isValidDate(date) {
    return Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime())
}

function getDateInRangeOfMinAndMaxDate(date, minDate, maxDate) {
    let { calendar } = date

    if (minDate) minDate = toDateObject(minDate, calendar).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    if (maxDate) maxDate = toDateObject(maxDate, calendar).set({ hour: 23, minute: 59, second: 59, millisecond: 999 })

    if (Array.isArray(date)) {
        date = date.filter(dateObject => {
            if (minDate && dateObject < minDate) return false
            if (maxDate && dateObject > maxDate) return false

            return true
        })
    }

    return [date, minDate, maxDate]
}

function toDateObject(date, calendar) {
    if (typeof date === "number" && date > 9999999999) date = new Date(date)

    if (date instanceof DateObject) {
        if (date.calendar !== calendar) date.setCalendar(calendar)
    } else {
        date = new DateObject({ date, calendar })
    }

    return date
}

function getSelectedDate(value, calendar, local, format) {
    let selectedDate = undefined
    let getObject = date => { return { date, calendar, local, format } }

    if (Array.isArray(value)) {
        selectedDate = value.map(val => {
            if (val instanceof DateObject) return val

            let date = new DateObject(getObject(val))

            return date.isValid ? date : undefined
        }).filter(i => i !== undefined)
    } else if (value instanceof DateObject) {
        selectedDate = value.isValid ? value : undefined
    } else {
        selectedDate = new DateObject(getObject(value))

        if (!selectedDate.isValid) selectedDate = undefined
    }

    return selectedDate
}