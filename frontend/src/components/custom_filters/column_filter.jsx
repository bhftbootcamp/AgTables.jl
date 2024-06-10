import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const ColumnFilter = forwardRef(({ api, filterLayout }, ref) => {
    const [searchValue, setSearchValue] = useState("");
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [all, setAll] = useState(true);

    useEffect(() => {
        let columnNodes = api.getAllGridColumns()
            .filter(node => node.colId !== "columnFilter")
            .map(elem => ({
                colId: elem.colId,
                header: elem.colDef.headerName,
                checked: elem.visible,
            }));

        const allChecked = columnNodes.every((col) => col.checked);

        setNodes(columnNodes);
        setFilteredNodes(columnNodes);
        setAll(allChecked);
    }, [api]);

    const handleCheck = (e) => {
        const updatedNodes = nodes.map(node => {
            return node.header === e.target.value
                ? { ...node, checked: !node.checked }
                : node
        }
        );

        const allChecked = updatedNodes.every(node => node.checked);

        setAll(allChecked);
        setNodes(updatedNodes);
        setFilteredNodes(updatedNodes);
        searchValue && inputSearch(searchValue, updatedNodes)
    };

    const handleCheckAll = (e) => {
        let updatedNodes = nodes.map(node => ({
            ...node,
            checked: e.target.checked,
        }));

        setAll(e.target.checked);
        setFilteredNodes(updatedNodes);
        setNodes(updatedNodes);
    };

    const updateFilter = () => {
        const visibleColumns = nodes.filter((node) => node.checked).map((node) => node.colId);

        let columnDefs = api.getColumnDefs().map((colDef) => ({
            ...colDef,
            hide: !visibleColumns.includes(colDef.field),
        }));

        api.setGridOption('columnDefs', columnDefs);
        api.getToolPanelInstance("filters").setFilterLayout([filterLayout]);
        setSearchValue("");
    };

    const resetFilter = () => {
        const columnDefs = api.getColumnDefs().map((colDef) => ({
            ...colDef,
            hide: colDef.colId == "columnFilter" ? true : false,
        }));

        let updatedNodes = nodes.map((item) => ({
            ...item,
            checked: true
        }));

        api.setGridOption('columnDefs', columnDefs);
        api.getToolPanelInstance("filters").setFilterLayout([filterLayout]);
        setAll(true);
        setNodes(updatedNodes);
        setFilteredNodes(updatedNodes);
    };

    const filterNodes = (value, nodesToFilter = nodes) => {
        setSearchValue(value);
        if (!value) {
            return;
        }

        const searchRegex = new RegExp(value.toLowerCase(), "g");
        const filteredNodes = nodesToFilter.filter((node) =>
            node.colId.toLowerCase().match(searchRegex)
        );

        setFilteredNodes(filteredNodes);
    };

    useImperativeHandle(ref, () => ({
        getModel: () => ({}),
        doesFilterPass: () => true,
        isFilterActive: () => false,
    }));

    return (
        <div className="column_filter_wrapper">
            <div className='column_filter'>
                <div className='column_filter_wrapper'>
                    <input
                        type='text'
                        className='searcher'
                        placeholder={`Search for columns...`}
                        value={searchValue}
                        onInput={e => filterNodes(e.target.value)}
                    />
                    <div className='column_filter_items'>
                        <div className='column_filter_item'>
                            <input
                                id='allcols'
                                className='input_cols_filter'
                                type='checkbox'
                                value='all'
                                onChange={handleCheckAll}
                                checked={all}
                            />
                            <label htmlFor='allcols' className='input_column_name'>(All)</label>
                        </div>
                        {filteredNodes.map((node, index) => (
                            <div className='column_filter_item' key={index}>
                                <input
                                    id={`cols${index}`}
                                    className='input_cols_filter'
                                    onChange={handleCheck}
                                    type='checkbox'
                                    value={node.header}
                                    checked={node.checked}
                                />
                                <label htmlFor={`cols${index}`} className='input_column_name'>{node.header}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='apply_button_wrapper'>
                    <button className='apply_button' onClick={resetFilter}>Reset</button>
                    <button className='apply_button' onClick={updateFilter}>Apply</button>
                </div>
            </div>
        </div>
    )
});

export default ColumnFilter;
