# [Table](@id table)

```@docs
AGTable
ag_table
```

### Example

```@example
using AgTables

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

# Panel

```@docs
AGPanel
ag_panel
```

### Example

```@example
using AgTables

cars = [
    (id = 1, make = "Toyota", model = "Corolla", year = 2020),
    (id = 2, make = "Ford", model = "Mustang", year = 2019),
    (id = 3, make = "Honda", model = "Civic", year = 2021),
    (id = 4, make = "Chevrolet", model = "Implata", year = 2018),
]

customers = [
    (id = 1, name = "John", email = "john@example.com"),
    (id = 2, name = "Jane", email = "jane@example.com"),
    (id = 3, name = "Emily", email = "emily@example.com"),
    (id = 4, name = "Michael", email = "michael@example.com"),
]

rentals = [
    (rental_id = 1, car_id = 1, customer_id = 1, rental_date = "2024-06-01"),
    (rental_id = 2, car_id = 2, customer_id = 2, rental_date = "2024-06-05"),
    (rental_id = 3, car_id = 3, customer_id = 3, rental_date = "2024-06-07"),
    (rental_id = 4, car_id = 4, customer_id = 4, rental_date = "2024-06-09"),
]

table1 = ag_table(cars, name = "Cars")
table2 = ag_table(customers, name = "Customers")
table3 = ag_table(rentals, name = "Rentals")
panel = ag_panel(table1, table2, table3)

ag_save("panel_example.html", panel)
nothing # hide
```

```@raw html
    <iframe src="../panel_example.html" style="height:200px;width:100%;"></iframe>
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
using AgTables

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
        filter_exclude = ["Guatemala City", "Boston, MA"],
    ),
    AgStringColumnDef(
        field_name = "status",
        header_name = "Status",
        filter = true,
        rect_background = "#f0efeb",
        color_map = Dict(
            "In Air" => "#8ac926",
            "Canceled" => "#ff595e",
            "Scheduled" => "#999999",
        ),
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
using AgTables

currencies_sample_data = ag_currencies_sample_data()

table = ag_table(
    currencies_sample_data,
    AgStringColumnDef(
        field_name = "currency_code",
        header_name = "Currency",
        filter = true,
        text_align = AG_CENTER,
        rect_background = "#f0efeb",
        default_sort = AG_ASC,
    ),
    AgNumberColumnDef(
        field_name = "exchange_rate",
        header_name = "Exchange Rate",
        filter = true,
        formatter = AGFormatter(style = AG_PERCENT),
        threshold = AGThreshold(0.0, color_down = "#ff595e", color_up = "#8ac926"),
    ),
    AgNumberColumnDef(
        field_name = "market_cap",
        header_name = "Market Cap",
        filter = true,
        formatter = AGFormatter(
            style = AG_CURRENCY,
            currency = AgTables.USD,
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
using AgTables

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
    header_height = 60,
)

ag_save("time_example.html", table)
nothing # hide
```

```@raw html
    <iframe src="../time_example.html" style="height:500px;width:100%;"></iframe>
```
