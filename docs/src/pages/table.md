# Table

```@docs
AGTable
ag_table
```

### Example

```@example
using AgTable

struct Foo
    a::String
    b::String
    c::String
end

sample_data = [
    (a = "1", b = "2024-01-01", c = "tuple"),
    Dict("a" => "2", "b" => "2024-01-01", "d" => "dict"),
    Foo("3", "2024-01-01", "struct"),
]

table = ag_table(sample_data)

ag_save("table_example.html", table)
nothing # hide
```

```@raw html
    <iframe src="../table_example.html" style="height:200px;width:100%;"></iframe>
```

# [Columns](@id column)

```@docs
AGThreshold
```

## String column

```@docs
AgStringColumnDef
```

### Example

```@example
using AgTable

flights_sample_data = ag_flights_sample_data()

table = ag_table(
    flights_sample_data,
    AgStringColumnDef(
        field_name = "airline_name",
        header_name = "Airlines",
        cell_background = "#e8e8e8",
    ),
    AgNumberColumnDef(
        field_name = "flight_number",
        header_name = "Flight",
        color = "#00b4d8",
        width = 100,
    ),
    AgStringColumnDef(
        field_name = "destination",
        header_name = "Destination",
        filter = true,
    ),
    AgStringColumnDef(
        field_name = "status",
        header_name = "Status",
        filter = true,
        rect_background = "#f0efeb",
        equals = ["In Air"],
        equals_color = "#8ac926",
        threshold = AGThreshold("In Air", color_up = "#999999", color_down = "#ff595e"),
        text_align = AG_CENTER,
    ),
)

ag_save("string_example.html", table)
nothing # hide
```

```@raw html
    <iframe src="../string_example.html" style="height:500px;width:100%;"></iframe>
```

## Number column

```@docs
AGFormatter
AgNumberColumnDef
```

### Example

```@example
using AgTable

currencies_sample_data = ag_currencies_sample_data()

table = ag_table(
    currencies_sample_data,
    AgStringColumnDef(
        field_name = "currency_code",
        header_name = "Currency",
        filter = true,
        text_align = AG_CENTER,
        rect_background = "#f0efeb",
    ),
    AgNumberColumnDef(
        field_name = "exchange_rate",
        header_name = "Exchange Rate",
        filter = true,
        formatter = AGFormatter(style = AG_PERCENT),
        threshold = AGThreshold(0.0, color_down = "#8ac926", color_up = "#ff595e"),
    ),
    AgNumberColumnDef(
        field_name = "market_cap",
        header_name = "Market Cap",
        filter = true,
        formatter = AGFormatter(
            style = AG_CURRENCY,
            currency = AgTable.USD,
            separator = true,
        ),
    ),
    AgNumberColumnDef(
        field_name = "daily_volume",
        header_name = "Daily Volume",
        filter = true,
        formatter = AGFormatter(short = true),
    ),
)

ag_save("number_example.html", table)
nothing # hide
```

```@raw html
    <iframe src="../number_example.html" style="height:500px;width:100%;"></iframe>
```

## Time column

```@docs
AgTimeColumnDef
```

### Example

```@example
using AgTable

order_sample_data = ag_order_sample_data()

table = ag_table(
    order_sample_data,
    AgStringColumnDef(
        field_name = "symbol",
        text_align = AG_CENTER,
        width = 120,
    ),
    AgTimeColumnDef(
        field_name = "createdAt",
        filter = true,
        date_formatter = AG_DATE_TIME,
        text_align = AG_CENTER,
    ),
    AgStringColumnDef(
        field_name = "orderStatus",
        rect_background = "#f0efeb",
    ),
    AgStringColumnDef(field_name = "orderId", visible = false),
    AgStringColumnDef(field_name = "orderSide", visible = false),
    AgStringColumnDef(field_name = "orderType", visible = false),
    AgStringColumnDef(field_name = "timeInForce", visible = false),
    AgStringColumnDef(field_name = "origQty", visible = false),
    AgStringColumnDef(field_name = "executedQty", visible = false),
    AgStringColumnDef(field_name = "price", visible = false);
    column_filter = true,
)

ag_save("time_example.html", table)
nothing # hide
```

```@raw html
    <iframe src="../time_example.html" style="height:500px;width:100%;"></iframe>
```
