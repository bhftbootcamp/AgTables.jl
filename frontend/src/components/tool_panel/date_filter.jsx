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
            node.displayed && displayedValues.push(value);
        });

        let maxVal = Math.max(...values);
        let minVal = Math.min(...values);
        let minDisplayed = Math.min(...displayedValues);
        let maxDisplayed = Math.max(...displayedValues);

        if (isNaN(minVal) || isNaN(minVal) || !displayedValues.length) return [0, 0];


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

    useEffect(() => {
        api.setColumnFilterModel(filter, {
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'greaterThanOrEqual', filter: Number(minValue) },
                { filterType: 'number', type: 'lessThanOrEqual', filter: Number(maxValue) }
            ]
        }).then(() => {
            api.onFilterChanged();
            setRefresh(prev => !prev);
        });
    }, [minValue, maxValue]);

    const [dateFormatter, patern] = useMemo(() => {
        switch (formatter) {
            case "datetime": return [displayDateTimeString, "[0-9]{2}.[0-9]{2}.[0-9]{4}T[0-9]{2}:[0-9]{2}"]
            case "date": return [displayDateString, "[0-9]{2}.[0-9]{2}.[0-9]{4}"]
            case "time": return [displayTimeString, "[0-9]{2}:[0-9]{2}"]
            default: return [(value) => value, ".*"];
        }
    }, [formatter]);

    const handleSlide = (value, isMin) => {
        if (isMin) {
            const newValue = value >= maxValue ? maxValue : value;
            setMinValue(newValue);
            setInputMin(dateFormatter(newValue));
        } else {
            const newValue = value <= minValue ? minValue : value;
            setMaxValue(newValue);
            setInputMax(dateFormatter(newValue));
        }
    };

    const handleChange = (event, isMin) => {
        const value = parseDateTimeValue(event.target.value, formatter);
        if (value) {
            if (isMin) {
                setMinValue(value);
                setInputMin(event.target.value);
            } else {
                setMaxValue(value);
                setInputMax(event.target.value);
            }
        } else {
            isMin ? setInputMin(dateFormatter(minValue)) : setInputMax(dateFormatter(maxValue));
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
                setMinValue(minV -= dt * xNew);
                setMaxValue(maxV -= dt * xNew);
            } else {
                if (minV - dt * xNew < min) {
                    const delta = minV - min;
                    setMinValue(min);
                    setMaxValue(maxV -= delta);
                    minV = min;
                }
                if (maxV - dt * xNew > max) {
                    const delta = maxV - max;
                    setMaxValue(max);
                    setMinValue(minV -= delta);
                    maxV = max;
                }
            }
            setInputMin(dateFormatter(minV));
            setInputMax(dateFormatter(maxV));
        }
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
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
                            onInput={(e) => handleSlide(Number(e.target.value), true)}
                        />
                        <input
                            className='input_slider2'
                            type='range'
                            min={min}
                            max={max}
                            value={maxValue}
                            onInput={(e) => handleSlide(Number(e.target.value), false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateFilter;
