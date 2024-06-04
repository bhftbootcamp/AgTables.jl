import React, { useEffect, useMemo, useRef, useState } from "react";
import TextFilter from "./text_filter.jsx";
import DateFilter from "./date_filter.jsx";
import NumberFilter from "./number_filter.jsx";
import ColumnFilter from "./column_filter.jsx";

const FilterPanel = ({ api, filters, uuidKey }) => {
    const [refresh, setRefresh] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (ref) {
            const observer = new ResizeObserver(() => localStorage.setItem(uuidKey + "width", ref.current.clientWidth));
            observer.observe(ref.current);

            return () => observer.disconnect();
        }
    }, [ref]);

    const text_len = useMemo(() => {
        let cols = filters.cols ? 1 : 0;
        return filters.text.length + cols;
    }, [filters]);

    const filters_len = useMemo(() => {
        return filters.number.length + filters.date.length;
    }, [filters]);

    return (
        <div id="filter_panel" className="filter_panel" style={{ height: "100vh", width: "100%" }} ref={ref}>
            {
                filters.text.map((filter, index) => {
                    return <div style={{ height: `calc((100% - (75px * ${filters_len})) / ${text_len})` }} key={index}>
                        <TextFilter api={api} filter={filter.name} header={filter.header} refresh={refresh} setRefresh={setRefresh} />
                    </div>
                })
            }
            {
                filters.cols ?
                    <div style={{ height: `calc((100% - (75px * ${filters_len})) / ${text_len})` }}>
                        <ColumnFilter api={api} />
                    </div>
                    : <></>
            }
            {
                filters.number.map((filter, index) => {
                    return <div style={{ height: `74px` }} key={index}>
                        <NumberFilter api={api} filter={filter.name} header={filter.header} formatter={filter.formatter} setRefresh={setRefresh} />
                    </div>
                })
            }
            {
                filters.date.map((filter, index) => {
                    return <div style={{ height: `74px` }} key={index}>
                        <DateFilter api={api} filter={filter.name} header={filter.header} formatter={filter.formatter} setRefresh={setRefresh} />
                    </div>
                })
            }
        </div>
    )
};

export default FilterPanel;
