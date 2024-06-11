import React, { useCallback, useMemo, useState, forwardRef } from "react";
import { AgGridReact } from "ag-grid-react";
import * as util from 'util';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./aggrid.css";
import { displayDateString, displayDateTimeString, displayTimeString, extractTimeInMilliseconds } from "./utils.ts";
import NumberFilter from "./custom_filters/number_filter.jsx";
import DateFilter from "./custom_filters/date_filter.jsx";
import ColumnFilter from "./custom_filters/column_filter.jsx";

const AgGrid = ({ table }) => {
    const [filters, setFilters] = useState(false);
    const [filterLayout, setFilterLayout] = useState(null);
    const [filterHeight, setFilterHeight] = useState(null);
    const initialState = JSON.parse(localStorage.getItem(table.uuidKey));
    const initialWidth = localStorage.getItem(table.uuidKey + "width");

    const getCellRenderer = (params, column) => {
        let value = params.value;
        if (value == "(Select All)") {
            return <div className="cell" dangerouslySetInnerHTML={{ __html: "(All)" }}></div>;
        }
        if (column.formatterType === "number") {
            value = formatNumber(value, column.formatter);
        } else if (column.formatterType === "date") {
            value = formatDate(value, column.formatter);
        }

        return (
            <div
                className="cell"
                style={{ backgroundColor: column.rectBackground }}
                dangerouslySetInnerHTML={{ __html: util.format(column.strFormat, value) }}
            />
        );
    };

    const getFilterItemRenderer = (params, column) => {
        let value = params.value;
        if (value == "(Select All)") {
            return <div className="cell" dangerouslySetInnerHTML={{ __html: "(All)" }}></div>;
        }

        return (
            <div
                className="cell"
                dangerouslySetInnerHTML={{ __html: util.format(column.strFormat, value) }}
            />
        );
    };

    const getCellStyle = (params, column) => {
        const style = {
            color: column.color,
            background: column.cellBackground,
            justifyContent: column.textAlign,
        };
        if (column.threshold) {
            style.color = params.value >= column.threshold.value ? column.threshold.colorUp : column.threshold.colorDown;
        }
        if (column.colorMap) {
            Object.entries(column.colorMap).forEach(([value, color]) => {
                if (params.value === value) style.color = color;
            });
        }

        return style;
    };

    const getFilterComponent = (coldef) => {
        switch (coldef.filter) {
            case "text":
                return "agSetColumnFilter";
            case "number":
                return forwardRef(({ column, api }, ref) => (
                    <NumberFilter column={column} api={api} formatter={coldef.formatter} ref={ref} />
                ));
            case "date":
                return forwardRef(({ column, api }, ref) => (
                    <DateFilter column={column} api={api} formatter={coldef.formatter} ref={ref} />
                ));
            default:
                return undefined;
        }
    };

    const getFilterHeight = () => {
        const fields = table.columnDefs.filter(coldef => coldef.filter === "text").map(coldef => coldef.fieldName);
        const otherFilterCount = table.columnDefs.filter(coldef => coldef.filter === "number" || coldef.filter === "date").length;
        let setFilterCount = fields.length + (table.columnFilter ? 1 : 0);
        const filterHeight = `calc((100% - ${otherFilterCount} * 70px) / ${setFilterCount})`;
        return { len: setFilterCount, filterHeight };
    };

    const generateFilterLayout = () => {
        const filtersType = { text: [], number: [], date: [] };
        table.columnDefs.forEach(coldef => {
            if (coldef.filter) filtersType[coldef.filter].push(coldef.fieldName);
        });

        const filterLayout = { children: [] };
        filtersType.text.forEach(filter => filterLayout.children.push({ field: filter }));
        if (table.columnFilter) filterLayout.children.push({ field: "columnFilter" });
        filtersType.number.forEach(filter => filterLayout.children.push({ field: filter }));
        filtersType.date.forEach(filter => filterLayout.children.push({ field: filter }));

        return filterLayout;
    };

    const columnDefs = useMemo(() => {
        const colDefs = table.columnDefs.map((coldef) => {
            const colDef = {
                field: coldef.fieldName,
                headerName: coldef.headerName,
                initialHide: !coldef.visible,
                cellRenderer: (params) => getCellRenderer(params, coldef),
                cellStyle: (params) => getCellStyle(params, coldef),
                width: coldef.width,
                flex: !coldef.width && table.flex && 1,
                initialSort: coldef.defaultSort,
                autoHeight: true,
                filter: false,
            };

            if (coldef.filter) {
                if (coldef.formatterType == "date" && coldef.formatter == "time") {
                    colDef.filterValueGetter = (params) => extractTimeInMilliseconds(params.data[coldef.fieldName]);
                }

                colDef.filter = getFilterComponent(coldef);
                if (coldef.filter == "text") {
                    colDef.filterParams = {
                        buttons: ["reset", "apply"],
                        cellRenderer: (params) => getFilterItemRenderer(params, coldef),
                        searchPlaceholder: 'Search for name ...',
                    }
                }
            }

            return colDef;
        });

        if (table.columnFilter) {
            colDefs.push({
                field: "columnFilter",
                hide: true,
                filter: forwardRef(({ api }, ref) => <ColumnFilter api={api} filterLayout={filterLayout} filterHeight={filterHeight} ref={ref} />),
            });
        };

        const filterLayout = generateFilterLayout();
        const filterHeight = getFilterHeight();
        setFilterLayout(filterLayout);
        setFilterHeight(filterHeight);
        setFilters(colDefs.some(colDef => colDef.filter) || table.columnFilter);

        return colDefs;
    }, [table]);

    const defaultColDef = useMemo(() => ({
        editable: false,
        sortable: true,
        resizable: table.resize,
        filter: true,
        minWidth: 20,
    }), [table]);

    const sideBar = useMemo(() => ({
        toolPanels: [
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
                toolPanelParams: {
                    expandFilters: true,
                    suppressExpandAll: false,
                    suppressFilterSearch: false,
                    suppressSyncLayoutWithGrid: true,
                    suppressFiltersToolPanel: true
                },
                width: initialWidth ? parseInt(initialWidth) : 223,
            },
        ],
        defaultToolPanel: 'filters',
    }), [initialWidth]);

    const formatNumber = (value, formatter) => {
        if (isNaN(Number(value))) return value;
        const settings = {
            useGrouping: formatter.separator,
            style: formatter.style,
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: formatter.minimumFractionDigits,
            maximumFractionDigits: formatter.maximumFractionDigits,
        };

        if (formatter.short) {
            settings.notation = "compact";
            settings.compactDisplay = "short";
        }
        if (formatter.currency) settings.currency = formatter.currency;

        return new Intl.NumberFormat("en-GB", settings).format(Number(value));
    };

    const formatDate = (value, formatter) => {
        switch (formatter) {
            case "datetime":
                return displayDateTimeString(value);
            case "date":
                return displayDateString(value);
            case "time":
                return displayTimeString(value);
            default:
                return value;
        }
    };

    const onFirstDataRendered = useCallback((params) => {
        if (initialState) return;

        table.columnDefs.map((column) => {
            if (column.filterInclude && column.filterInclude.length) {
                applyFilter(params, column.fieldName, column.filterInclude.filter(value => !column.filterExclude.includes(value)));
            } else if (column.filterExclude && column.filterExclude.length) {
                let uniqueValues = {};
                params.api.forEachNode(elem => {
                    const value = elem.data[column.fieldName];
                    uniqueValues[value] = elem.displayed || uniqueValues[value];
                });
                const filteredValues = Object.keys(uniqueValues).filter(value => uniqueValues[value]);
                applyFilter(params, column.fieldName, filteredValues.filter(value => !column.filterExclude.includes(value)));
            }
        });
    }, [table]);

    const applyFilter = (params, colId, values) => {
        params.api.setColumnFilterModel(colId, { type: 'set', values: values, })
            .then(() => params.api.onFilterChanged());
    };

    const handleGridReady = (params) => {
        if (!filters) return;

        const filtersToolPanel = params.api.getToolPanelInstance("filters");
        filtersToolPanel.expandFilters();
        filterLayout && filtersToolPanel.setFilterLayout([filterLayout]);

        let filtersList = document.getElementsByClassName("ag-filter-toolpanel-instance");
        Array.from(filtersList).forEach((item, index) => {
            if (index >= filterHeight.len) return;
            item.style.height = filterHeight.filterHeight;
        });
    };

    const onStateUpdated = (params) => {
        localStorage.setItem(table.uuidKey, JSON.stringify(params.state));
        const filtersToolPanel = params.api.getToolPanelInstance("filters");
        localStorage.setItem(table.uuidKey + "width", filtersToolPanel.eGui.clientWidth);
    };

    return (
        <div className="ag-theme-quartz aggrid">
            <AgGridReact
                rowData={table.rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                sideBar={filters && sideBar}
                initialState={initialState}
                headerHeight={table.headerHeight}
                rowHeight={table.rowHeight}
                multiSortKey={"ctrl"}
                onGridReady={handleGridReady}
                onFirstDataRendered={onFirstDataRendered}
                onStateUpdated={onStateUpdated}
            />
        </div>
    );
};

export default AgGrid;
