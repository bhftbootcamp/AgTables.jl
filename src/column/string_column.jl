# column/string_column

"""
    AgStringColumnDef(; kw...)

Type defining a string column and its display settings.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:-------------------------|:------------|
| `field_name::String` | `""` | Column name in source data. |
| `header_name::String` | `field_name` | Override `field_name` as default with custom value. |
| `visible::Bool` | `true` | Column visibility. |
| `filter::Bool` | `false` | Enables a selector filter for column values. |
| `str_format::String` | `"%s"` | String template for formatting values. The `%s` is replaced with the value. |
| `width::Integer` | `nothing` | Column width. |
| `cell_background::String` | `"#fff"` | Cell background. |
| `rect_background::String` | `"#fff"` | Background color of the rectangle. |
| `color::String` | `"#000"` | Text color. |
| `text_align::AG_TEXTALIGN_TYPES` | `AG_CENTER` (`AG_LEFT`, `AG_RIGHT`) | Text alignment. |
| `equals::Vector{<:String}` | `String[]` | The values that are highlighted in color in the cell. |
| `equals_color::String` | `"#ca3c32"` | The color used to highlight values that match the `equals`. |
| `threshold::AGThreshold` | `nothing` | Settings for highlighting cells based on a threshold value. |
"""
struct AgStringColumnDef <: AbstractColumnDef
    field_name::String
    header_name::String
    visible::Bool
    filter::AG_FILTER_TYPES
    str_format::String
    width::Union{Integer,Nothing}
    cell_background::String
    rect_background::String
    color::String
    text_align::AG_TEXTALIGN_TYPES
    equals::AbstractVector{<:String}
    equals_color::String
    threshold::Union{AGThreshold,Nothing}

    function AgStringColumnDef(;
        field_name::String,
        header_name::String = field_name,
        visible::Bool = true,
        filter::Bool = false,
        str_format::String = "%s",
        width::Union{Integer,Nothing} = nothing,
        cell_background::AbstractString = "#fff",
        rect_background::AbstractString = "#fff",
        color::AbstractString = "#000",
        text_align::AG_TEXTALIGN_TYPES = AG_LEFT,
        equals::AbstractVector{<:String} = String[],
        equals_color::AbstractString = "red",
        threshold::Union{AGThreshold,Nothing} = nothing,
    )
        new(
            field_name,
            header_name,
            visible,
            filter ? AG_TEXT_FILTER : AG_NULL_FILTER,
            str_format,
            width,
            cell_background,
            rect_background !== "#fff" ? rect_background : cell_background,
            color,
            text_align,
            equals,
            equals_color,
            threshold,
        )
    end
end
