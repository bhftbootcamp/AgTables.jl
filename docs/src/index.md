![animation](assets/animation_light.gif)

# AgTables.jl

AgTables is an easy-to-use wrapper for the [AG Grid](https://www.ag-grid.com/) library, designed for quick visualization and easy sharing of tabular data.

## Installation
If you haven't installed our [local registry](https://github.com/bhftbootcamp/Green) yet, do that first:
```
] registry add https://github.com/bhftbootcamp/Green.git
```

To install AgTables, simply use the Julia package manager:

```julia
] add AgTables
```

## Usage

In the most basic scenario, the user just needs to parse the data and put it in a table:

```julia
using AgTables

julia> order_data = ag_order_sample_data()
100-element Vector{AgTables.Order}:
 AgTables.Order("LTCUSDT", DateTime("2024-05-29T13:40:00"), "ORD00001", ...)
 AgTables.Order("ETHUSDT", DateTime("2024-05-29T12:30:00"), "ORD00002", ...)
 AgTables.Order("XRPUSDT", DateTime("2024-05-29T13:00:00"), "ORD00003", ...)

julia> order_table = ag_table(order_data)
AgTables.AGTable(Sheet1)

julia> ag_show(order_table)
true
```

![order_table](/docs/src/assets/order_table.png)

To go further, the user can composite panels from tables and configure different parameters for each column of the table:

```julia
using AgTables

ag_show(
    ag_panel(
        ag_table(
            ag_stock_sample_data(),
            AgNumberColumnDef(;
                field_name = "price",
                str_format = "%s <span style='font-size:10px;color:rgb(120,123,134);font-weight:400'>USD</span>",
                visible = true,
            ),
            AgNumberColumnDef(;
                field_name = "h24",
                header_name = "24h%",
                formatter = AGFormatter(;
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
            AgNumberColumnDef(;
                field_name = "volume",
                formatter = AGFormatter(;
                    short = true,
                ),
            ),
            AgNumberColumnDef(;
                field_name = "mkt",
                header_name = "market сap",
                formatter = AGFormatter(;
                    style = AG_CURRENCY,
                    currency = AgTables.USD,
                    separator = true,
                ),
            ),
            AgStringColumnDef(;
                field_name = "sector",
                filter = true,
            );
            column_filter = true,
            name = "Stocks",
        ),
        ag_table(
            ag_order_sample_data(),
            AgStringColumnDef(;
                field_name = "symbol",
                filter = true,
            ),
            AgStringColumnDef(;
                field_name = "orderSide",
                color_map = Dict(
                    "BUY" => "green",
                    "SELL" => "red",
                ),
                filter = true,
            ),
            name = "Orders",
        ),
    ),
)
```

![stock_order_panel](/docs/src/assets/stock_order_panel.png)

## Using AG Grid Enterprise

Set `AG_GRID_LICENSE_KEY` at runtime to enable AG Grid's enterprise features:

```julia
ENV["AG_GRID_LICENSE_KEY"] = "YOUR_LICENSE_KEY_HERE"
```
