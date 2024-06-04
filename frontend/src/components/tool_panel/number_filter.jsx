import React, { useMemo, useRef, useState } from "react";

const NumberFilter = ({ api, filter, header, formatter, setRefresh }) => {
    const [minValue, setminValue] = useState(0);
    const [maxValue, setmaxValue] = useState(0);
    const [isMinEditing, setIsMinEditing] = useState(false);
    const [isMaxEditing, setIsMaxEditing] = useState(false);
    const ref = useRef(null);

    const calculateStep = (min, max) => {
        const range = max - min;
        if (range === 0) return 1;

        const numberOfSteps = 100;
        let step = range / numberOfSteps;

        return step;
    };

    const [max, min, step] = useMemo(() => {
        let values = [];
        let displayedValues = [];
        api.forEachNode((node) => {
            values.push(node.data[filter]);
            if (node.displayed) displayedValues.push(node.data[filter]);
        });

        let max = Math.max(...values);
        let min = Math.min(...values);
        let maxV = Math.max(...displayedValues);
        let minV = Math.min(...displayedValues);

        if (isNaN(max)) {
            max = 0;
            maxV = 0
        }
        if (isNaN(min)) {
            min = 0;
            minV = 0;
        }

        setmaxValue(maxV);
        setminValue(minV);

        setTimeout(() => {
            let percent1 = ((minV - min) / (max - min)) * 100;
            let percent2 = ((maxV - min) / (max - min)) * 100;

            let slider = document.getElementById(`slider_track_${filter}`)
            slider.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
        }, 10);

        return [max, min, calculateStep(min, max)];
    }, [api]);

    const valueFormatter = (value) => {
        if (!value || !formatter) return value;

        let settings = {};

        if (formatter.short) {
            settings["notation"] = "compact";
            settings["compactDisplay"] = "short";
        }

        settings["useGrouping"] = formatter.separator;
        settings["style"] = formatter.style;
        settings["currencyDisplay"] = "narrowSymbol";
        settings["minimumFractionDigits"] = formatter.mindigits;
        settings["maximumFractionDigits"] = formatter.maxdigits;

        if (formatter.currency !== "") settings["currency"] = formatter.currency;

        let formatter_ = new Intl.NumberFormat("en-GB", settings);
        return formatter_.format(Number(value));
    };

    const slideOne = (value) => {
        if (Number(value) >= Number(maxValue)) {
            setminValue(Number(maxValue));
            fillColor(Number(maxValue), maxValue);
        } else {
            setminValue(value);
            fillColor(Number(value), maxValue);
        }
    }

    const slideTwo = (value) => {
        if (Number(value) <= Number(minValue)) {
            setmaxValue(minValue);
            fillColor(minValue, Number(minValue));
        } else {
            setmaxValue(value);
            fillColor(minValue, Number(value));
        }
    }

    const fillColor = (minValue, maxValue) => {
        let percent1 = ((minValue - min) / (max - min)) * 100;
        let percent2 = ((maxValue - min) / (max - min)) * 100;

        ref.current.style.background = `linear-gradient(to right, #e5e5e5 ${percent1}% , #666666 ${percent1}% , #666666 ${percent2}%, #e5e5e5 ${percent2}%)`;
    }

    const clickApplyNumeric = (minValue, maxValue) => {
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

    const inputNumeric = (event, ismin = true) => {
        let number = Number(event.target.value);

        if (!isNaN(number)) {
            if (ismin) {
                setminValue(number);
                clickApplyNumeric(number, maxValue)
            } else {
                setmaxValue(number);
                clickApplyNumeric(minValue, number)
            }
        } else {
            ismin ? event.target.value = minValue : event.target.value = maxValue;
        }
    }

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
        var onMouseUp = function (evtUp) {
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
            <div
                className='numeric_filter'
            >
                <div>
                    <span className='name_filter'>
                        {header}
                    </span>
                    <div className='values'>
                        <input
                            className='input_numeric_slider'
                            value={isMinEditing ? minValue : valueFormatter(minValue)}
                            onChange={inputNumeric}
                            onBlur={() => setIsMinEditing(false)}
                            onFocus={() => setIsMinEditing(true)}
                            type='text'
                        >
                        </input>
                        <input
                            className='input_numeric_slider'
                            style={{ textAlign: "end" }}
                            value={isMaxEditing ? maxValue : valueFormatter(maxValue)}
                            onChange={e => inputNumeric(e, false)}
                            onBlur={() => setIsMaxEditing(false)}
                            onFocus={() => setIsMaxEditing(true)}
                            type='text'
                        >
                        </input>
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
                            type='range'
                            min={min}
                            max={max}
                            step={step}
                            value={minValue}
                            className='input_slider1'
                            onInput={e => slideOne(e.target.value)}
                            onMouseUp={() => clickApplyNumeric(minValue, maxValue)}
                        />
                        <input
                            type='range'
                            min={min}
                            max={max}
                            step={step}
                            value={maxValue}
                            className='input_slider2'
                            onInput={e => slideTwo(e.target.value)}
                            onMouseUp={() => clickApplyNumeric(minValue, maxValue)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default NumberFilter;
