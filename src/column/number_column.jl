# column/number_column

"""
    AGFormatter(; kw...)

Type used to configure the formatting of numeric column values.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:--------------------------|:------------|
| `short::Bool` | `false` | Uses letter abbreviations to represent large numbers. |
| `style::AG_STYLE_TYPES` | `AG_DECIMAL` (`AG_CURRENCY`, `AG_PERCENT`) | The formatting style to use. Displays the corresponding `currency` or percent symbol next to the value. |
| `currency::AG_CURRENCY_CODES` | `USD` | The currency symbol used in formatting. |
| `separator::Bool` | `false` | Separates thousandths values with a comma. |
| `minimum_fraction_digits::Integer` | `0` | The minimum number of fraction digits to use. |
| `maximum_fraction_digits::Integer` | `3` | The maximum number of fraction digits to use. |
"""
struct AGFormatter <: AbstractColumnDef
    short::Bool
    style::AG_STYLE_TYPES
    currency::AG_CURRENCY_CODES
    separator::Bool
    minimum_fraction_digits::Int64
    maximum_fraction_digits::Int64

    function AGFormatter(;
        short::Bool = false,
        style::AG_STYLE_TYPES = AG_DECIMAL,
        currency::AG_CURRENCY_CODES = USD,
        separator::Bool = false,
        minimum_fraction_digits::Integer = 0,
        maximum_fraction_digits::Integer = 3,
    )
        return new(
            short,
            style,
            currency,
            separator,
            minimum_fraction_digits,
            maximum_fraction_digits,
        )
    end
end

"""
    AgNumberColumnDef(; kw...)

Type defining a numeric column and its display settings.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:-------------------------|:------------|
| `field_name::String` | `""` | Column name in source data. |
| `header_name::String` | `field_name` | Override `field_name` as default with custom value. |
| `visible::Bool` | `true` | Column visibility. |
| `filter::Bool` | `false` | Enables a filter for column values. |
| `default_sort::AG_SORT_MODES` | `nothing` (`AG_ASC`, `AG_DESC`) | Initial sorting in the column (ascending or descending order). |
| `formatter::AGFormatter` | `nothing` | Formatting of the numbers. |
| `str_format::String` | `"%s"` | String template for formatting values. The `%s` is replaced with the value. |
| `width::Integer` | `nothing` | Column width. |
| `cell_background::String` | `"#fff"` | Cell background. |
| `rect_background::String` | `"#fff"` | Background color of the rectangle. |
| `color::String` | `"#000"` | Text color. |
| `text_align::AG_TEXTALIGN_TYPES` | `AG_CENTER` (`AG_LEFT`, `AG_RIGHT`) | Text alignment. |
| `color_map::Dict{Number,String}` | `Dict{Number,String}()` | Dictionary with colors of values (`value` => `color`). |
| `threshold::AGThreshold` | `nothing` | Settings for highlighting cells based on a threshold value. |
"""
struct AgNumberColumnDef <: AbstractColumnDef
    field_name::String
    header_name::String
    visible::Bool
    filter::AG_FILTER_TYPES
    default_sort::Union{AG_SORT_MODES,Nothing}
    formatter_type::String
    formatter::Union{AGFormatter,Nothing}
    str_format::String
    width::Union{Integer,Nothing}
    cell_background::String
    rect_background::String
    color::String
    text_align::AG_TEXTALIGN_TYPES
    color_map::AbstractDict{T,String} where {T<:Number}
    threshold::Union{AGThreshold,Nothing}

    function AgNumberColumnDef(;
        field_name::String = "",
        header_name::String = field_name,
        visible::Bool = true,
        filter::Bool = false,
        default_sort::Union{AG_SORT_MODES,Nothing} = nothing,
        formatter::Union{AGFormatter,Nothing} = nothing,
        str_format::String = "%s",
        width::Union{Integer,Nothing} = nothing,
        cell_background::AbstractString = "#fff",
        rect_background::AbstractString = "#fff",
        color::AbstractString = "#000",
        text_align::AG_TEXTALIGN_TYPES = AG_RIGHT,
        color_map::AbstractDict{<:Number,String} = Dict{Number,String}(),
        threshold::Union{AGThreshold,Nothing} = nothing,
    )
        return new(
            field_name,
            header_name,
            visible,
            filter ? AG_NUMBER_FILTER : AG_NULL_FILTER,
            default_sort,
            formatter !== nothing ? "number" : "",
            formatter,
            str_format,
            width,
            cell_background,
            rect_background !== "#fff" ? rect_background : cell_background,
            color,
            text_align,
            color_map,
            threshold,
        )
    end
end
