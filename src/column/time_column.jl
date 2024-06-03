# column/time_column

"""
    AgTimeColumnDef(; kw...)

Type defining a time column and its display settings.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:-------------------------|:------------|
| `field_name::String` | `""` | Column name in source data. |
| `header_name::String` | `field_name` | Override `field_name` as default with custom value. |
| `visible::Bool` | `true` | Column visibility. |
| `filter::Bool` | `false` | Enables a filter for column values. |
| `date_formatter::AG_DATE_FORMATTER` | `AG_DATE_TIME` (`AG_TIME`, `AG_DATE`) | Specify time display format. |
| `str_format::String` | `"%s"` | String template for formatting values. The `%s` is replaced with the value. |
| `width::Integer` | `nothing` | Column width. |
| `cell_background::String` | `"#fff"` | Cell background. |
| `rect_background::String` | `"#fff"` | Background color of the rectangle. |
| `color::String` | `"#000"` | Text color. |
| `text_align::AG_TEXTALIGN_TYPES` | `AG_CENTER` (`AG_LEFT`, `AG_RIGHT`) | Text alignment. |
| `equals::Vector` | `Int64[]` | The values that are highlighted in color in the cell. |
| `equals_color::String` | `"#ca3c32"` | The color used to highlight values that match the `equals`. |
| `threshold::AGThreshold` | `nothing` | Settings for highlighting cells based on a threshold value. |
"""
struct AgTimeColumnDef <: AbstractColumnDef
    field_name::String
    header_name::String
    visible::Bool
    filter::AG_FILTER_TYPES
    formatter_type::String
    formatter::Union{AG_DATE_FORMATER,Nothing}
    str_format::String
    width::Union{Integer,Nothing}
    cell_background::String
    rect_background::String
    color::String
    text_align::AG_TEXTALIGN_TYPES
    equals::AbstractVector{<:Union{Real,TimeType}}
    equals_color::String
    threshold::Union{AGThreshold,Nothing}

    function AgTimeColumnDef(;
        field_name::String = "",
        header_name::String = field_name,
        visible::Bool = true,
        filter::Bool = false,
        date_formatter::Union{AG_DATE_FORMATER,Nothing} = AG_DATE_TIME,
        str_format::String = "%s",
        width::Union{Integer,Nothing} = nothing,
        cell_background::AbstractString = "#fff",
        rect_background::AbstractString = "#fff",
        color::AbstractString = "#000",
        text_align::AG_TEXTALIGN_TYPES = AG_RIGHT,
        equals::AbstractVector{<:Union{TimeType,Real}} = Int64[],
        equals_color::AbstractString = "red",
        threshold::Union{AGThreshold,Nothing} = nothing,
    )
        return new(
            field_name,
            header_name,
            visible,
            filter ? AG_DATE_FILTER : AG_NULL_FILTER,
            date_formatter !== nothing ? "date" : "",
            date_formatter,
            str_format,
            width,
            cell_background,
            rect_background !== "#fff" ? rect_background : cell_background,
            color,
            text_align,
            datetime2epoch.(equals),
            equals_color,
            threshold,
        )
    end
end
