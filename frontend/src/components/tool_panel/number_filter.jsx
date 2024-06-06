import React, { useEffect, useMemo, useRef, useState } from "react";

const NumberFilter = ({ api, filter, header, formatter, setRefresh }) => {
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    const [isMinEditing, setIsMinEditing] = useState(false);
    const [isMaxEditing, setIsMaxEditing] = useState(false);
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

        if (isNaN(maxVal)) return [0, 0, 1];
        if (isNaN(minVal)) return [0, 0, 1];

        setMaxValue(maxDisplayed);
        setMinValue(minDisplayed);

        return [maxVal, minVal, calculateStep(minVal, maxVal)];
    }, [api]);

    useEffect(() => {
        const percent1 = ((minValue - min) / (max - min)) * 100;
        const percent2 = ((maxValue - min) / (max - min)) * 100;
        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    }, [minValue, maxValue, min, max]);

    const valueFormatter = (value) => {
        if (!value || !formatter) return value;

        const settings = {
            notation: formatter.short ? "compact" : undefined,
            compactDisplay: formatter.short ? "short" : undefined,
            useGrouping: formatter.separator,
            style: formatter.style,
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: formatter.mindigits,
            maximumFractionDigits: formatter.maxdigits,
            currency: formatter.currency || undefined,
        };

        return new Intl.NumberFormat("en-GB", settings).format(Number(value));
    };

    const handleSlide = (value, isMin) => {
        const numValue = Number(value);
        if (isMin) {
            const newValue = numValue >= maxValue ? maxValue : numValue;
            setMinValue(newValue);
            fillColor(newValue, maxValue);
        } else {
            const newValue = numValue <= minValue ? minValue : numValue;
            setMaxValue(newValue);
            fillColor(minValue, newValue);
        }
    };

    const fillColor = (minValue, maxValue) => {
        const percent1 = ((minValue - min) / (max - min)) * 100;
        const percent2 = ((maxValue - min) / (max - min)) * 100;
        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}%, #666666 ${percent1}%, #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
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
            setRefresh(filter);
        });
    };

    // const handleInputChange = (event, isMin) => {
    //     const number = Number(event.target.value);
    //     if (!isNaN(number)) {
    //         if (isMin) {
    //             setMinValue(number);
    //             updateFilter(number, maxValue);
    //         } else {
    //             setMaxValue(number);
    //             updateFilter(minValue, number);
    //         }
    //     } 
    // };

    const handleInputChange = (event, isMin) => {
        const value = event.target.value;
        
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            if (isMin) {
                setMinValue(parsedValue);
                updateFilter(parsedValue, maxValue);
            } else {
                setMaxValue(parsedValue);
                updateFilter(minValue, parsedValue);
            }
        };
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
            fillColor(minV, maxV);
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            updateFilter(minV, maxV);
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
                            value={isMinEditing ? minValue : valueFormatter(minValue)}
                            onChange={(e) => handleInputChange(e, true)}
                            onBlur={() => setIsMinEditing(false)}
                            onFocus={() => setIsMinEditing(true)}
                            type='text'
                        />
                        <input
                            className='input_numeric_slider'
                            style={{ textAlign: "end" }}
                            value={isMaxEditing ? maxValue : valueFormatter(maxValue)}
                            onChange={(e) => handleInputChange(e, false)}
                            onBlur={() => setIsMaxEditing(false)}
                            onFocus={() => setIsMaxEditing(true)}
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
                            onMouseUp={() => updateFilter(minValue, maxValue)}
                        />
                        <input
                            type='range'
                            min={min}
                            max={max}
                            step={step}
                            value={maxValue}
                            className='input_slider2'
                            onInput={(e) => handleSlide(e.target.value, false)}
                            onMouseUp={() => updateFilter(minValue, maxValue)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NumberFilter;
