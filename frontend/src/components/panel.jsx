import React, { useState, useCallback, useMemo } from "react";
import AgGrid from "./aggrid.jsx";

const Panel = React.memo(({ table }) => {
    const [displayedIndex, setDisplayedIndex] = useState(() => localStorage.getItem(table.uuidKey) || 0);

    const handleChangeTable = useCallback((index) => {
        setDisplayedIndex(index);
        localStorage.setItem(table.uuidKey, index);
    }, [table.uuidKey]);

    const tabClass = useCallback((index) => {
        return `tabs ${displayedIndex == index ? table.bottom ? "active_top_tab" : "active_bottom_tab" : ""}`;
    }, [displayedIndex, table.bottom]);

    const containerStyle = useMemo(() => ({
        flexDirection: table.bottom ? "column-reverse" : ""
    }), [table.bottom]);

    const borderStyle = useMemo(() => ({
        borderTop: table.bottom ? "1px solid #dbdddf" : undefined,
    }), [table.bottom]);

    const tableHeight = useMemo(() => ({
        height: table.tables.length > 1 ? "calc(100 vh - 33px" : "100vh",
    }), [table.tables]);

    return (
        <div className="agtables" style={containerStyle}>
            <div className="table_wrapper" style={borderStyle}>
                {table.tables.length > 1 && table.tables.map((t, index) => (
                    <div
                        key={index}
                        className={tabClass(index)}
                        onClick={() => handleChangeTable(index)}
                    >
                        {t.name}
                    </div>
                ))}
            </div>
            <AgGrid table={table.tables[displayedIndex]} height={tableHeight} index={displayedIndex} uuidKey={table.uuidKey} />
        </div>
    );
});

export default Panel;
