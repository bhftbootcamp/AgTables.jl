import React, { useEffect, useMemo, useRef, useState } from "react";
import { displayDateString, displayDateTimeString, displayTimeString, extractTimeInMilliseconds, parseDateTimeValue } from "../utils.ts";

const DateFilter = ({ api, filter, header, formatter, setRefresh }) => {
    const [inputMin, setInputMin] = useState(0);
    const [inputMax, setInputMax] = useState(0);
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    const ref = useRef(null);

    const [max, min] = useMemo(() => {
        let values = [];
        let displayedValues = [];

        api.forEachNode((node) => {
            const value = formatter == "time" ? extractTimeInMilliseconds(node.data[filter]) : node.data[filter];
            values.push(value)
            if (node.displayed) displayedValues.push(value);
        });

        let maxVal = Math.max(...values);
        let minVal = Math.min(...values);
        let minDisplayed = Math.min(...displayedValues);
        let maxDisplayed = Math.max(...displayedValues);

        if (isNaN(maxVal)) return [0, 0];
        if (isNaN(minVal)) return [0, 0];

        const formatValue = (value) => {
            switch (formatter) {
                case "datetime": return displayDateTimeString(value);
                case "date": return displayDateString(value);
                case "time": return displayTimeString(value);
                default: return value;
            }
        };

        setInputMin(formatValue(minDisplayed));
        setInputMax(formatValue(maxDisplayed));
        setMinValue(minDisplayed);
        setMaxValue(maxDisplayed);

        return [maxVal, minVal];
    }, [api]);

    useEffect(() => {
        const percent1 = ((minValue - min) / (max - min)) * 100;
        const percent2 = ((maxValue - min) / (max - min)) * 100;
        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    }, [minValue, maxValue, min, max]);

    const [dateFormatter, patern] = useMemo(() => {
        switch (formatter) {
            case "datetime": return [displayDateTimeString, "[0-9]{2}.[0-9]{2}.[0-9]{4}T[0-9]{2}:[0-9]{2}"]
            case "date": return [displayDateString, "[0-9]{2}.[0-9]{2}.[0-9]{4}"]
            case "time": return [displayTimeString, "[0-9]{2}:[0-9]{2}"]
            default: return [(value) => value, ".*"];
        }
    }, [formatter]);

    const hanldeSlide = (setFunc, value, comparator, boundValue, setInputFunc) => {
        if (value >= comparator) {
            setFunc(boundValue);
            setInputFunc(dateFormatter(boundValue));
            fillColor(boundValue, boundValue);
        } else {
            setFunc(value);
            setInputFunc(dateFormatter(value));
            fillColor(value, boundValue);
        }
    };

    const fillColor = (minValue, maxValue) => {
        let percent1 = ((minValue - min) / (max - min)) * 100;
        let percent2 = ((maxValue - min) / (max - min)) * 100;

        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    };

    const updateFilter = (minValue, maxValue) => {
        fillColor(minValue, maxValue);
        api.setColumnFilterModel(filter, {
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThanOrEqual', filter: Number(minValue) },
                { filterType: 'number', type: 'lessThanOrEqual', filter: Number(maxValue) }
            ]
        }).then(() => {
            api.onFilterChanged();
            setRefresh("filter");
        });
    };

    const handleChange = (event, isMin) => {
        const value = parseDateTimeValue(event.target.value, formatter);
        if (value) {
            if (isMin) {
                setMinValue(value);
                setInputMin(event.target.value);
                updateFilter(value, maxValue);
            } else {
                setMaxValue(value);
                setInputMax(event.target.value);
                updateFilter(minValue, value);
            }
        } else {
            if (isMin) {
                setInputMin(dateFormatter(minValue));
                updateFilter(minValue, maxValue);
            } else {
                setInputMax(dateFormatter(maxValue));
                updateFilter(minValue, maxValue);
            }
        }
    };


    const clickTrack = (event) => {
        let dt = (max - min) / ref.current.clientWidth;
        let xStart = event.clientX;
        let minV = minValue;
        let maxV = maxValue;

        const onMouseMove = (evtMove) => {
            evtMove.preventDefault();
            const xNew = xStart - evtMove.clientX;
            xStart = evtMove.clientX;
            if (minV - dt * xNew > min && maxV - dt * xNew < max) {
                setMinValue(minV - dt * xNew);
                setMaxValue(maxV - dt * xNew);
                minV -= dt * xNew;
                maxV -= dt * xNew;
            } else {
                const handleBoundary = (boundary, boundaryValue, delta) => {
                    setMinValue(boundary);
                    setMaxValue(boundaryValue - delta);
                    minV = boundary;
                    maxV -= delta;
                };
                if (minV - dt * xNew < min && minV > min) handleBoundary(min, maxV, minV - min);
                else if (maxV - dt * xNew > max && maxV < max) handleBoundary(max, minV, maxV - max);
            }
            fillColor(minV, maxV);
        }
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            updateFilter(minV, maxV);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    return (
        <div className="filter">
            <div className='date_filter'>
                <div style={{ overflow: "hiden" }}>
                    <span className='name_filter'>{header}</span>
                    <div className='values'>
                        <input
                            className='input_date_slider'
                            value={inputMin}
                            onChange={(e) => handleChange(e, true)}
                            type='text'
                            pattern={patern}
                        />
                        <input
                            className='input_date_slider text_align'
                            value={inputMax}
                            onChange={((e) => handleChange(e, false))}
                            type='text'
                            pattern={patern}
                        />
                    </div>
                    <div className='container'>
                        <div
                            id={`slider_track_${filter}`}
                            className='slider_track'
                            style={{ background: "#666666" }}
                            ref={ref}
                            onMouseDown={clickTrack}
                        ></div>
                        <input
                            className='input_slider1'
                            type='range'
                            min={min}
                            max={max}
                            value={minValue}
                            onInput={(e) => hanldeSlide(setMinValue, Number(e.target.value), maxValue, maxValue, setInputMin)}
                            onMouseUp={() => updateFilter(minValue, maxValue)}
                        />
                        <input
                            className='input_slider2'
                            type='range'
                            min={min}
                            max={max}
                            value={maxValue}
                            onInput={(e) => hanldeSlide(setMaxValue, Number(e.target.value), minValue, minValue, setInputMax)}
                            onMouseUp={() => updateFilter(minValue, maxValue)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateFilter;
