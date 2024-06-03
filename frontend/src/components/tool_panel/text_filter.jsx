import React, { useEffect, useState } from "react";

const TextFilter = ({ api, filter, header, refresh, setRefresh }) => {
    const [searchValue, setSearchValue] = useState("");
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [all, setAll] = useState(true);

    useEffect(() => {
        let uniqueValues = {};
        let isAll = true;
        api.forEachNode(elem => {
            const value = elem.data[filter];
            if (!(value in uniqueValues)) {
                uniqueValues[value] = elem.displayed;
            } else {
                if (elem.displayed) uniqueValues[value] = true;
            }
        });
        const result = Object.entries(uniqueValues).map(([value, checked]) => {
            if (!checked) isAll = false;
            return {
                value,
                checked
            }
        });

        result.sort((a, b) => a.value.localeCompare(b.value));

        setNodes(result);
        setFilteredNodes(result);
        setAll(isAll);
    }, [api, refresh]);

    const clickCheck = (e) => {
        let isAll = true;
        const updatedCheckedState = nodes.map((item) => {
            if (String(item.value) === e.target.value) {
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
        if (searchValue) inputSearch(searchValue, updatedCheckedState);
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

    const apply = (event) => {
        let checkedValues = []
        nodes.forEach((item) => {
            if (item.checked) checkedValues.push(String(item.value))
        });

        api.setColumnFilterModel(filter, {
            filterType: 'text',
            type: 'set',
            values: checkedValues
        }).then(() => {
            api.onFilterChanged();
        }).then(() => {
            setRefresh(state => !state);
        });
        setSearchValue("");
    }

    const reset = (event) => {
        let updatedCheckedState = nodes.map((item) => {
            return {
                ...item,
                checked: true
            }
        })

        let checkedValues = []
        nodes.forEach((item) => {
            checkedValues.push(String(item.value))
        });

        api.setColumnFilterModel(filter, null).then(() => {
            api.onFilterChanged();
            setRefresh(state => !state);
        });

        setAll(true);
        setFilteredNodes(updatedCheckedState);
        setNodes(updatedCheckedState);
        event.preventDefault();
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
            const nodeValue = String(node.value);
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
                        placeholder={`Search for ${header}...`}
                        value={searchValue}
                        onInput={e => inputSearch(e.target.value)}
                    />
                    <div className='column_filter_items'>
                        <div className='column_filter_item'>
                            <input
                                id={`all${filter}`}
                                className='input_cols_filter'
                                type='checkbox'
                                value='all'
                                onChange={clickAll}
                                checked={all}
                            />
                            <label
                                htmlFor={`all${filter}`}
                                onChange={clickAll}
                                className='input_column_name'
                            >
                                (All)
                            </label>
                        </div>
                        {
                            filteredNodes.map((node, index) => {
                                return <div className='column_filter_item' key={index}>
                                    <input
                                        id={`checkbox${filter}${index}`}
                                        className='input_cols_filter'
                                        onChange={clickCheck}
                                        type='checkbox'
                                        value={node.value}
                                        checked={node.checked}
                                    />
                                    <label htmlFor={`checkbox${filter}${index}`} className='input_column_name'><div className="label_cell" dangerouslySetInnerHTML={{ __html: node.value }}></div></label>
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

export default TextFilter;
