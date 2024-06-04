<picture>
  <source media="(prefers-color-scheme: dark)" srcset=docs/src/assets/animation_dark.gif>
  <source media="(prefers-color-scheme: light)" srcset=docs/src/assets/animation_light.gif>
  <img src=docs/src/assets/animation_light.gif>
</picture>

# AgTable.jl

[![Stable](https://img.shields.io/badge/docs-stable-blue.svg)](https://bhftbootcamp.github.io/AgTable.jl/stable/)
[![Dev](https://img.shields.io/badge/docs-dev-blue.svg)](https://bhftbootcamp.github.io/AgTable.jl/dev/)
[![Build Status](https://github.com/bhftbootcamp/AgTable.jl/actions/workflows/Coverage.yml/badge.svg?branch=master)](https://github.com/bhftbootcamp/AgTable.jl/actions/workflows/Coverage.yml?query=branch%3Amaster)
[![Coverage](https://codecov.io/gh/bhftbootcamp/AgTable.jl/branch/master/graph/badge.svg)](https://codecov.io/gh/bhftbootcamp/AgTable.jl)
[![Registry](https://img.shields.io/badge/registry-Green-green)](https://github.com/bhftbootcamp/Green)

AgTable is an easy-to-use wrapper for the [AG Grid](https://www.ag-grid.com/) library, designed for quick visualization and easy sharing of tabular data.

## Installation
If you haven't installed our [local registry](https://github.com/bhftbootcamp/Green) yet, do that first:
```
] registry add https://github.com/bhftbootcamp/Green.git
```

To install AgTable, simply use the Julia package manager:

```julia
] add AgTable
```

## Usage

In the most basic scenario, the user just needs to parse the data and put it in a table:

```julia
using AgTable

julia> order_data = ag_order_sample_data()
100-element Vector{AgTable.Order}:
 AgTable.Order("LTCUSDT", DateTime("2024-05-29T13:40:00"), "ORD00001", ...)
 AgTable.Order("ETHUSDT", DateTime("2024-05-29T12:30:00"), "ORD00002", ...)
 AgTable.Order("XRPUSDT", DateTime("2024-05-29T13:00:00"), "ORD00003", ...)

julia> order_table = ag_table(order_data)
AgTable.AGTable(AgTable ❤️ Julia)

julia> ag_show(order_table)
```

![order_table](/docs/src/assets/order_table.png)

To go further, the user can customize various settings for each column:

```julia
using AgTable

ag_stock_column_defs = [
    AgStringColumnDef(
        field_name = "name",
        header_name = "Name",
        text_align = AG_LEFT,
        width = 150,
        filter = true,
    ),
    AgNumberColumnDef(
        field_name = "price",
        header_name = "Price",
        str_format = "%s <span style='font-size:10px;color:rgb(120,123,134);font-weight:400'>USD</span>",
        visible = true,
    ),
    AgNumberColumnDef(
        field_name = "h24",
        header_name = "24h%",
        formatter = AGFormatter(
            style = AG_PERCENT,
            maximum_fraction_digits = 2,
        ),
        threshold = AGThreshold(
            0;
            color_up = "#22ab94",
            color_down = "#f23645",
        ),
        filter = true,
    ),
    AgNumberColumnDef(
        field_name = "volume",
        header_name = "Volume(24h)",
        formatter = AGFormatter(short = true),
    ),
    AgNumberColumnDef(
        field_name = "mkt",
        header_name = "Market Cap",
        formatter = AGFormatter(
            style = AG_CURRENCY,
            currency = AgTable.USD,
            separator = true,
        ),
    ),
    AgStringColumnDef(
        field_name = "sector",
        header_name = "Sector",
        text_align = AG_LEFT,
        filter = true,
    ),
]

ag_show(
    ag_table(
        ag_stock_sample_data(),
        ag_stock_column_defs...,
        column_filter = true,
    ),
)
```

![stock_screener_table](/docs/src/assets/stock_screener_table.png)

## Using AG Grid Enterprise

Set `AG_GRID_LICENSE_KEY` at runtime to enable AG Grid's enterprise features:

```julia
ENV["AG_GRID_LICENSE_KEY"] = "YOUR_LICENSE_KEY_HERE"
```

## Contributing

Contributions to AgTable are welcome! If you encounter a bug, have a feature request, or would like to contribute code, please open an issue or a pull request on GitHub.
