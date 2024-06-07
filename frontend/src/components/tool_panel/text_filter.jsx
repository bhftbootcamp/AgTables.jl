import React, { useEffect, useState } from "react";

const TextFilter = ({ api, filter, header, refresh, setRefresh }) => {
    const [searchValue, setSearchValue] = useState("");
    const [nodes, setNodes] = useState([]);
    const [filteredNodes, setFilteredNodes] = useState([]);
    const [all, setAll] = useState(true);

    useEffect(() => {
        if (filter == refresh.filter) return;

        let uniqueValues = new Set();

        api.forEachNode(elem => {
            const value = elem.data[filter];
            if (elem.displayed) uniqueValues.add(value);
        });

        let nodes = Array.from(uniqueValues).map(value => ({
            value,
            checked: true,
        }));
        nodes = nodes.sort((a, b) => a.value.localeCompare(b.value));

        setNodes(nodes);
        setFilteredNodes(nodes);
        setAll(true);
    }, [api, refresh]);

    const handleCheck = (e) => {
        const updatedNodes = nodes.map((item) => {
            if (String(item.value) === e.target.value) {
                item.checked = !item.checked;
            }
            return item
        });

        const isAllChecked = updatedNodes.every(item => item.checked);

        setAll(isAllChecked);
        setNodes(updatedNodes);
        setFilteredNodes(updatedNodes);
        if (searchValue) filterNodes(searchValue, updatedNodes);
    };

    const handleCheckAll = (e) => {
        let updatedNodes = nodes.map((item) => ({
            ...item,
            checked: e.target.checked
        }));

        setAll(e.target.checked);
        setFilteredNodes(updatedNodes);
        setNodes(updatedNodes);
    }

    const updateFilter = () => {
        let checkedValues = nodes.filter(item => item.checked).map(item => String(item.value));

        api.setColumnFilterModel(filter, {
            filterType: 'text',
            type: 'set',
            values: checkedValues
        }).then(() => {
            api.onFilterChanged();
            setRefresh((prev) => ({ state: prev.state, filter: filter }));
        });

        setSearchValue("");
    };

    const resetFilter = () => {
        api.setColumnFilterModel(filter, null).then(() => {
            api.onFilterChanged();
            setRefresh((prev) => ({ state: prev.state, filter: "" }));
        });

        setSearchValue("");
    }

    const filterNodes = (value, nodesList = nodes) => {
        setSearchValue(value);

        if (value.len == 0) {
            return;
        }

        const regex = new RegExp(value.toLowerCase(), 'g');
        const filtered = nodesList.filter(node => String(node.value).toLowerCase().match(regex));

        setFilteredNodes(filtered);
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
                        onInput={e => filterNodes(e.target.value)}
                    />
                    <div className='column_filter_items'>
                        <div className='column_filter_item'>
                            <input
                                id={`all${filter}`}
                                className='input_cols_filter'
                                type='checkbox'
                                value='all'
                                onChange={handleCheckAll}
                                checked={all}
                            />
                            <label htmlFor={`all${filter}`} onChange={handleCheckAll} className='input_column_name'>(All)</label>
                        </div>
                        {filteredNodes.map((node, index) => (
                            <div className='column_filter_item' key={index}>
                                <input
                                    id={`checkbox${filter}${index}`}
                                    className='input_cols_filter'
                                    onChange={handleCheck}
                                    type='checkbox'
                                    value={node.value}
                                    checked={node.checked}
                                />
                                <label htmlFor={`checkbox${filter}${index}`} className='input_column_name'>
                                    <div className="label_cell" dangerouslySetInnerHTML={{ __html: node.value }}></div>
                                </label>
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
};

export default TextFilter;
