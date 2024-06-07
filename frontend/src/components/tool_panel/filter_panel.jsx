import React, { useEffect, useMemo, useRef, useState } from "react";
import TextFilter from "./text_filter.jsx";
import DateFilter from "./date_filter.jsx";
import NumberFilter from "./number_filter.jsx";
import ColumnFilter from "./column_filter.jsx";

const FilterPanel = ({ api, filters, uuidKey }) => {
    const [refresh, setRefresh] = useState({ state: false, filter: "" });
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            const observer = new ResizeObserver(() => localStorage.setItem(uuidKey + "width", ref.current.clientWidth));
            observer.observe(ref.current);

            return () => observer.disconnect();
        }
    }, [ref]);

    const textFilterCount = useMemo(() => {
        return filters.text.length + (filters.cols ? 1 : 0);
    }, [filters]);

    const otherFiltersCount = useMemo(() => {
        return filters.number.length + filters.date.length;
    }, [filters]);

    const calculateHeight = () => {
        return `calc((100% - (75px * ${otherFiltersCount})) / ${textFilterCount})`;
    };

    return (
        <div id="filter_panel" className="filter_panel" style={{ height: "100vh", width: "100%" }} ref={ref}>
            {filters.text.map((filter, index) => (
                <div style={{ height: calculateHeight() }} key={index}>
                    <TextFilter api={api} filter={filter.name} header={filter.header} refresh={refresh} setRefresh={setRefresh} />
                </div>
            ))}
            {filters.cols && (
                <div style={{ height: calculateHeight() }}>
                    <ColumnFilter api={api} />
                </div>
            )}
            {filters.number.map((filter, index) => (
                <div style={{ height: `74px` }} key={index}>
                    <NumberFilter api={api} filter={filter.name} header={filter.header} formatter={filter.formatter} setRefresh={setRefresh} />
                </div>
            ))}
            {filters.date.map((filter, index) => (
                <div style={{ height: `74px` }} key={index}>
                    <DateFilter api={api} filter={filter.name} header={filter.header} formatter={filter.formatter} setRefresh={setRefresh} />
                </div>
            ))}
        </div>
    )
};

export default FilterPanel;
