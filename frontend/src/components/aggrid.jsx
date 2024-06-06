import React, { useCallback, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import FilterPanel from "./tool_panel/filter_panel.jsx";
import * as util from 'util';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./aggrid.css";
import { displayDateString, displayDateTimeString, displayTimeString, extractTimeInMilliseconds } from "./utils.ts";

const AgGrid = ({ table }) => {
    const [filters, setFilters] = useState(null);
    const [initialState, setInitialState] = useState(JSON.parse(localStorage.getItem(table.uuidKey)));
    const initialWidth = localStorage.getItem(table.uuidKey + "width");

    const getCellRenderer = (column) => (params) => {
        let value = params.value;
        if (column.formatterType === "number") {
            value = formatNumber(value, column.formatter);
        } else if (column.formatterType === "date") {
            value = formatDate(value, column.formatter);
        }
        return <div className="cell" style={{ backgroundColor: column.rectBackground }} dangerouslySetInnerHTML={{ __html: util.format(column.strFormat, value) }} />;
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

    const columnDefs = useMemo(() => {
        let colDefs = [];
        let colsFilters = { text: [], number: [], date: [] };
        let hasFilters = false;

        table.columnDefs.map((column) => {
            const colDef = {
                field: column.fieldName,
                headerName: column.headerName,
                initialHide: !column.visible,
                filter: column.filter === "text" ? "agSetColumnFilter" : column.filter === "number" ? "agNumberColumnFilter" : column.filter === "date" ? "agNumberColumnFilter" : undefined,
                cellRenderer: getCellRenderer(column),
                cellStyle: (params) => getCellStyle(params, column),
                width: column.width,
                flex: !column.width && table.flex && 1,
                initialSort: column.defaultSort,
                autoHeight: true,
            };

            if (column.filter) {
                colsFilters[column.filter].push({ name: column.fieldName, header: column.headerName, formatter: column.formatter });
                hasFilters = true;

                if (column.formatterType == "date" && column.formatter == "time") {
                    colDef.filterValueGetter = (params) => extractTimeInMilliseconds(params.data[column.fieldName]);
                }
            }

            colDefs.push(colDef);
        });

        if (hasFilters || table.columnFilter) setFilters(colsFilters);
        return colDefs;
    }, []);

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            sortable: true,
            resizable: table.resize,
            filter: true,
            minWidth: 20,
        }
    }, []);

    const sideBar = useMemo(() => {
        if (filters)
            return {
                toolPanels: [
                    {
                        id: 'customStats',
                        labelDefault: 'Custom Stats',
                        labelKey: 'customStats',
                        iconKey: 'custom-stats',
                        toolPanel: api => FilterPanel(api, filters, table.uuidKey),
                        toolPanelParams: {
                            title: 'Filters',
                            filters: filters,
                            uuidKey: table.uuidKey
                        },
                        width: parseInt(initialWidth) || 223,
                    },
                ],
                defaultToolPanel: 'customStats',
            }
    }, [filters]);

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

    const onStateUpdated = useCallback((params) => {
        console.log('State updated', params.state);
        setInitialState(params.state);
        localStorage.setItem(table.uuidKey, JSON.stringify(params.state));
    }, []);

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
        })
    }, []);

    const applyFilter = (params, colId, values) => {
        params.api.setColumnFilterModel(colId, {
            filterType: 'text',
            type: 'set',
            values: values,
        }).then(() => {
            params.api.onFilterChanged();
        });
    };

    return (
        <div className="ag-theme-quartz aggrid">
            <AgGridReact
                rowData={table.rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                sideBar={sideBar}
                initialState={initialState}
                headerHeight={table.headerHeight}
                rowHeight={table.rowHeight}
                multiSortKey={"ctrl"}
                onStateUpdated={onStateUpdated}
                onFirstDataRendered={onFirstDataRendered}
            />
        </div>
    );
};

export default AgGrid;
