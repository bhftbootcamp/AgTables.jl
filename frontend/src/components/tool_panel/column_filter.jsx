import React, { useEffect, useState } from "react";

const ColumnFilter = ({ api }) => {
    const [searchValue, setSearchValue] = useState("");
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [all, setAll] = useState(true);

    useEffect(() => {
        let result = [];
        let isAll = true;
        api.getAllGridColumns().map(elem => {
            if (!elem.visible) isAll = false;
            result.push({
                colId: elem.colId,
                header: elem.colDef.headerName,
                checked: elem.visible,
            });
        });

        setNodes(result);
        setFilteredNodes(result);
        setAll(isAll);
    }, [api]);

    const clickCheck = (e) => {
        let isAll = true;
        const updatedCheckedState = nodes.map((item) => {
            if (String(item.header) === e.target.value) {
                if (item.checked) isAll = false;
                return {
                    ...item,
                    checked: !item.checked
                };
            }
            if (!item.checked) isAll = false;
            return item
        });

        setAll(isAll);
        setNodes(updatedCheckedState);
        setFilteredNodes(updatedCheckedState);
        if (searchValue) inputSearch(searchValue, updatedCheckedState)
    };

    const clickAll = (e) => {
        let updatedCheckedState = [];
        updatedCheckedState = nodes.map((item) => {
            return {
                ...item,
                checked: e.target.checked
            }
        })

        setAll(state => !state);
        setFilteredNodes(updatedCheckedState);
        setNodes(updatedCheckedState);
    }

    const apply = () => {
        let checkedValues = []
        nodes.forEach((item) => {
            if (item.checked) checkedValues.push(String(item.colId))
        });

        let columnDefs = api.getColumnDefs();
        columnDefs.forEach((colDef) => {
            if (checkedValues.includes(colDef.field)) {
                colDef.hide = false;
            } else {
                colDef.hide = true;
            }
        });

        api.setGridOption('columnDefs', columnDefs);
        setSearchValue("");
    }

    const reset = () => {
        const columnDefs = api.getColumnDefs()
        columnDefs.forEach((colDef) => {
            colDef.hide = false;
        });

        let updatedCheckedState = nodes.map((item) => {
            return {
                ...item,
                checked: true
            }
        })

        api.setGridOption('columnDefs', columnDefs);

        setAll(true);
        setFilteredNodes(updatedCheckedState);
        setNodes(updatedCheckedState);
    }

    const inputSearch = (value, nodes_ = nodes) => {
        setSearchValue(value);
        if (value.len == 0) {
            return;
        }
        const searchValue = value.toLowerCase();
        let regex = new RegExp(searchValue, 'g');

        let searchedArray = new Array();

        for (let node of nodes_) {
            const nodeValue = String(node.colId);
            if (!!nodeValue.toLowerCase().match(regex)) {
                searchedArray.push(node);
            }
        }

        setFilteredNodes(searchedArray);
    }

    return (
        <div className="filter">
            <div className='column_filter'>
                <div className='column_filter_wrapper'>
                    <input
                        type='text'
                        className='searcher'
                        placeholder={`Search for columns...`}
                        value={searchValue}
                        onInput={e => inputSearch(e.target.value)}
                    />
                    <div className='column_filter_items'>
                        <div className='column_filter_item'>
                            <input
                                id='allcols'
                                className='input_cols_filter'
                                type='checkbox'
                                value='all'
                                onChange={clickAll}
                                checked={all}
                            />
                            <label
                                htmlFor='allcols'
                                className='input_column_name'
                            >
                                (All)
                            </label>
                        </div>
                        {
                            filteredNodes.map((node, index) => {
                                return <div className='column_filter_item' key={index}>
                                    <input
                                        id={`cols${index}`}
                                        className='input_cols_filter'
                                        onChange={clickCheck}
                                        type='checkbox'
                                        value={node.header}
                                        checked={node.checked}
                                    />
                                    <label htmlFor={`cols${index}`} className='input_column_name'>{node.header}</label>
                                </div>
                            })
                        }
                    </div>
                </div>
                <div className='apply_button_wrapper'>
                    <button className='apply_button' onClick={reset}>Reset</button>
                    <button className='apply_button' onClick={apply}>Apply</button>
                </div>
            </div>
        </div>
    )
};

export default ColumnFilter;
