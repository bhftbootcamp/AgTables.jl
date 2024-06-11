import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import {
    displayDateString,
    displayDateTimeString,
    displayTimeString,
    extractTimeInMilliseconds,
    parseDateTimeValue,
} from "../utils.ts";

const DateFilter = forwardRef(({ column, api, formatter }, ref) => {
    const [inputMin, setInputMin] = useState(0);
    const [inputMax, setInputMax] = useState(0);
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    const [isSlide, setIsSlide] = useState(false);
    const filter = column.colId;
    const header = column.userProvidedColDef.headerName;
    const sliderRef = useRef(null);

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
        let maxDisplayed = displayedValues.length ? Math.max(...displayedValues) : 0;
        let minDisplayed = displayedValues.length ? Math.min(...displayedValues) : 0;

        if (isNaN(minVal) || isNaN(minVal)) return [0, 0];

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
        sliderRef.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    }, [minValue, maxValue, min, max]);

    useEffect(() => {
        const handleMouseUp = () => {
            if (isSlide) {
                updateFilter();
                setIsSlide(false);
            }
        };

        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isSlide]);

    const [dateFormatter, patern] = useMemo(() => {
        switch (formatter) {
            case "datetime": return [displayDateTimeString, "[0-9]{2}.[0-9]{2}.[0-9]{4}T[0-9]{2}:[0-9]{2}"]
            case "date": return [displayDateString, "[0-9]{2}.[0-9]{2}.[0-9]{4}"]
            case "time": return [displayTimeString, "[0-9]{2}:[0-9]{2}"]
            default: return [(value) => value, ".*"];
        }
    }, [formatter]);

    const handleSlide = (value, isMin) => {
        const newValue = isMin ? Math.min(value, maxValue) : Math.max(value, minValue);
        if (isMin) {
            setMinValue(newValue);
            setInputMin(dateFormatter(newValue));
        } else {
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
        let dt = (max - min) / sliderRef.current.clientWidth;
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
            updateFilter();
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    useImperativeHandle(ref, () => ({
        getModel: () => ({
            min: minValue,
            max: maxValue,
        }),
        doesFilterPass: (params) => {
            const value = params.data[filter];
            return value >= minValue && value <= maxValue;
        },
        isFilterActive: () => minValue !== min || maxValue !== max,
    }));

    const updateFilter = () => {
        api.onFilterChanged();
    };

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
                            ref={sliderRef}
                            onMouseDown={clickTrack}
                        ></div>
                        <div className='slider_click_area' onMouseDown={clickTrack}></div>
                        <input
                            className='input_slider1'
                            type='range'
                            min={min}
                            max={max}
                            value={minValue}
                            onInput={(e) => handleSlide(Number(e.target.value), true)}
                            onMouseDown={() => setIsSlide(true)}
                        />
                        <input
                            className='input_slider2'
                            type='range'
                            min={min}
                            max={max}
                            value={maxValue}
                            onInput={(e) => handleSlide(Number(e.target.value), false)}
                            onMouseDown={() => setIsSlide(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default DateFilter;
