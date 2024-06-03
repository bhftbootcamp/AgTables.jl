import React, { useMemo, useRef, useState } from "react";
import { displayDateString, displayDateTimeString, displayTimeString, extractTimeInMilliseconds, parseDateTimeValue } from "../utils.ts";

const DateFilter = ({ api, filter, header, formatter, setRefresh }) => {
    const [inputMin, setInputMin] = useState(0);
    const [inputMax, setInputMax] = useState(0);
    const [minValue, setminValue] = useState(0);
    const [maxValue, setmaxValue] = useState(0);
    const ref = useRef(null);

    const [max, min] = useMemo(() => {
        let values = [];
        api.forEachNode((node) => {
            formatter == "time" ? values.push(extractTimeInMilliseconds(node.data[filter])) : values.push(node.data[filter])
        });

        let max = Math.max(...values);
        let min = Math.min(...values);

        if (isNaN(max)) max = 0;
        if (isNaN(min)) min = 0;

        switch (formatter) {
            case "datetime":
                setInputMin(displayDateTimeString(min));
                setInputMax(displayDateTimeString(max));
                setmaxValue(max);
                setminValue(min);
                break
            case "date":
                setInputMin(displayDateString(min));
                setInputMax(displayDateString(max));
                setmaxValue(max);
                setminValue(min);
                break
            case "time":
                setInputMin(displayTimeString(min));
                setInputMax(displayTimeString(max));
                setmaxValue(extractTimeInMilliseconds(max));
                setminValue(extractTimeInMilliseconds(min));
                break
            default:
                setInputMin(min);
                setInputMax(max);
                setmaxValue(max);
                setminValue(min);
                break
        }
        return [max, min];
    }, [api]);

    const [dateFormatter, patern] = useMemo(() => {
        switch (formatter) {
            case "datetime":
                return [displayDateTimeString, "[0-9]{2}.[0-9]{2}.[0-9]{4}T[0-9]{2}:[0-9]{2}"]
            case "date":
                return [displayDateString, "[0-9]{2}.[0-9]{2}.[0-9]{4}"]
            case "time":
                return [displayTimeString, "[0-9]{2}:[0-9]{2}"]
            default:
                return [(value) => value, ".*"];
        }
    }, [formatter]);

    const slideOne = (e) => {
        let value = Number(e.target.value);
        if (value >= Number(maxValue)) {
            setminValue(Number(maxValue));
            setInputMin(dateFormatter(maxValue));
            fillColor(Number(maxValue), maxValue);
        } else {
            setminValue(value);
            setInputMin(dateFormatter(value));
            fillColor(value, maxValue);
        }
    }

    const slideTwo = (e) => {
        let value = Number(e.target.value);
        if (value <= Number(minValue)) {
            setmaxValue(minValue);
            setInputMax(dateFormatter(minValue));
            fillColor(minValue, Number(minValue));
        } else {
            setmaxValue(value);
            setInputMax(dateFormatter(value));
            fillColor(minValue, value);
        }
    }

    const fillColor = (minValue, maxValue) => {
        let percent1 = ((minValue - min) / (max - min)) * 100;
        let percent2 = ((maxValue - min) / (max - min)) * 100;

        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    }

    const clickApply = (minValue, maxValue) => {
        fillColor(minValue, maxValue);
        api.setColumnFilterModel(filter, {
            operator: 'AND',
            conditions: [
                {
                    filterType: 'number',
                    type: 'greaterThanOrEqual',
                    filter: Number(minValue)
                },
                {
                    filterType: 'number',
                    type: 'lessThanOrEqual',
                    filter: Number(maxValue)
                }
            ]
        }).then(() => {
            api.onFilterChanged();
            setRefresh(state => !state);
        });
    }

    const handleChangeMin = (event) => {
        const date = parseDateTimeValue(event.target.value, formatter);
        if (date) {
            setminValue(date);
            setInputMin(event.target.value);
            clickApply(date, maxValue);
        } else {
            setminValue(minValue);
            setInputMin(dateFormatter(minValue));
            clickApply(minValue, maxValue);
        };

    };

    const handleChangeMax = (event) => {
        const date = parseDateTimeValue(event.target.value, formatter);
        if (date) {
            setmaxValue(date);
            setInputMax(event.target.value);
            clickApply(minValue, date);
        } else {
            setmaxValue(maxValue);
            setInputMax(dateFormatter(maxValue));
            clickApply(minValue, maxValue);
        }
    };

    const clickTrack = (event) => {
        let dt = (max - min) / ref.current.clientWidth;
        let xStart = event.clientX;

        let minV = minValue;
        let maxV = maxValue;
        var onMouseMove = function (evtMove) {
            evtMove.preventDefault();
            var xNew = xStart - evtMove.clientX;
            xStart = evtMove.clientX;
            if (minV - dt * xNew > min &&
                maxV - dt * xNew < max) {
                setminValue(minV - dt * xNew);
                setmaxValue(maxV - dt * xNew);
                minV -= dt * xNew;
                maxV -= dt * xNew;
            } else {
                if (minV - dt * xNew < min && minV > min) {
                    let delta = minV - min;
                    setminValue(min);
                    setmaxValue(maxV - delta);
                    minV = min;
                    maxV -= delta;
                } else if (maxV - dt * xNew > max && maxV < max) {
                    let delta = maxV - max;
                    setmaxValue(max);
                    setminValue(minV - delta);
                    minV -= delta;
                    maxV = max;
                }
            }
            fillColor(minV, maxV);
        }
        var onMouseUp = function () {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            api.setColumnFilterModel(filter, {
                operator: 'AND',
                conditions: [
                    {
                        filterType: 'number',
                        type: 'greaterThanOrEqual',
                        filter: Number(minV)
                    },
                    {
                        filterType: 'number',
                        type: 'lessThanOrEqual',
                        filter: Number(maxV)
                    }
                ]
            }).then(() => {
                api.onFilterChanged();
                setRefresh(state => !state);
            });
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    return (
        <div className="filter">
            <div className='date_filter'>
                <div style={{ overflow: "hiden" }}>
                    <span className='name_filter'>
                        {header}
                    </span>
                    <div className='values'>
                        <input
                            className='input_date_slider'
                            value={inputMin}
                            onChange={handleChangeMin}
                            type='text'
                            pattern={patern}
                            min={min}
                            max={max}
                        />
                        <input
                            className='input_date_slider text_align'
                            value={inputMax}
                            onChange={handleChangeMax}
                            type='text'
                            pattern={patern}
                            min={min}
                            max={max}
                        />
                    </div>
                    <div className='container'>
                        <div
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
                            onInput={slideOne}
                            onMouseUp={() => clickApply(minValue, maxValue)}
                        />
                        <input
                            className='input_slider2'
                            type='range'
                            min={min}
                            max={max}
                            value={maxValue}
                            onInput={slideTwo}
                            onMouseUp={() => clickApply(minValue, maxValue)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default DateFilter;
