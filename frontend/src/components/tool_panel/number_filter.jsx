import React, { useEffect, useMemo, useRef, useState } from "react";

const NumberFilter = ({ api, filter, header, formatter, setRefresh }) => {
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    const [isMinEditing, setIsMinEditing] = useState(false);
    const [isMaxEditing, setIsMaxEditing] = useState(false);
    const [minInputValue, setMinInputValue] = useState("0");
    const [maxInputValue, setMaxInputValue] = useState("0");
    const ref = useRef(null);

    const calculateStep = (min, max) => {
        const range = max - min;
        return range === 0 ? 1 : range / 100;
    };

    const [max, min, step] = useMemo(() => {
        const values = [];
        const displayedValues = [];
        api.forEachNode((node) => {
            values.push(node.data[filter]);
            if (node.displayed) displayedValues.push(node.data[filter]);
        });

        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const maxDisplayed = Math.max(...displayedValues);
        const minDisplayed = Math.min(...displayedValues);

        if (isNaN(minVal) || isNaN(minVal) || !displayedValues.length) return [0, 0, 1];

        setMaxValue(maxDisplayed);
        setMinValue(minDisplayed);
        setMaxInputValue(maxDisplayed.toString())
        setMinInputValue(minInputValue.toString())

        return [maxVal, minVal, calculateStep(minVal, maxVal)];
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

    const valueFormatter = (value) => {
        if (!value || !formatter) return value;

        const settings = {
            notation: formatter.short ? "compact" : undefined,
            compactDisplay: formatter.short ? "short" : undefined,
            useGrouping: formatter.separator,
            style: formatter.style,
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: formatter.minimumFractionDigits,
            maximumFractionDigits: formatter.maximumFractionDigits,
            currency: formatter.currency || undefined,
        };

        return new Intl.NumberFormat("en-GB", settings).format(Number(value));
    };

    const handleSlide = (value, isMin) => {
        const numValue = Number(value);
        if (isMin) {
            const newValue = numValue >= maxValue ? maxValue : numValue;
            setMinValue(newValue);
            setMinInputValue(newValue.toString());
        } else {
            const newValue = numValue <= minValue ? minValue : numValue;
            setMaxValue(newValue);
            setMaxInputValue(newValue.toString());
        }
    };

    const handleInputChange = (event, isMin) => {
        const value = event.target.value;
        const number = Number(value);
        if (isMin) {
            setMinInputValue(value);
            if (!isNaN(number) && number <= maxValue) {
                setMinValue(number);
            }
            return;
        }
        setMaxInputValue(value);
        if (!isNaN(number) && number >= minValue) {
            setMaxValue(number);
        }
    };

    const handleBlur = (isMin) => {
        if (isMin) {
            setIsMinEditing(false);
            setMinInputValue(valueFormatter(minValue));
        } else {
            setIsMaxEditing(false);
            setMaxInputValue(valueFormatter(maxValue));
        }
    };

    const handleFocus = (isMin) => {
        if (isMin) {
            setIsMinEditing(true);
            setMinInputValue(minValue.toString());
        } else {
            setIsMaxEditing(true);
            setMaxInputValue(maxValue.toString());
        }
    };

    const handleTrackClick = (event) => {
        const dt = (max - min) / ref.current.clientWidth;
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
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div className="filter">
            <div className='numeric_filter'>
                <div>
                    <span className='name_filter'>{header}</span>
                    <div className='values'>
                        <input
                            className='input_numeric_slider'
                            value={isMinEditing ? minInputValue : valueFormatter(minValue)}
                            onChange={(e) => handleInputChange(e, true)}
                            onBlur={() => handleBlur(true)}
                            onFocus={() => handleFocus(true)}
                            type='text'
                        />
                        <input
                            className='input_numeric_slider'
                            style={{ textAlign: "end" }}
                            value={isMaxEditing ? maxInputValue : valueFormatter(maxValue)}
                            onChange={(e) => handleInputChange(e, false)}
                            onBlur={() => handleBlur(false)}
                            onFocus={() => handleFocus(false)}
                            type='text'
                        />
                    </div>
                    <div className='container'>
                        <div
                            id={`slider_track_${filter}`}
                            className='slider_track'
                            style={{ background: "#666666" }}
                            ref={ref}
                            onMouseDown={handleTrackClick}
                        />
                        <input
                            type='range'
                            min={min}
                            max={max}
                            step={step}
                            value={minValue}
                            className='input_slider1'
                            onInput={(e) => handleSlide(e.target.value, true)}
                        />
                        <input
                            type='range'
                            min={min}
                            max={max}
                            step={step}
                            value={maxValue}
                            className='input_slider2'
                            onInput={(e) => handleSlide(e.target.value, false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NumberFilter;
