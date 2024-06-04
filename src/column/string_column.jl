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
| `initial_sort::AG_SORT_TYPES` | `AG_NULL_SORT` (`AG_ASC`, `AG_DESC`) | Initial sorting in the column. |
| `str_format::String` | `"%s"` | String template for formatting values. The `%s` is replaced with the value. |
| `width::Integer` | `nothing` | Column width. |
| `cell_background::String` | `"#fff"` | Cell background. |
| `rect_background::String` | `"#fff"` | Background color of the rectangle. |
| `color::String` | `"#000"` | Text color. |
| `text_align::AG_TEXTALIGN_TYPES` | `AG_CENTER` (`AG_LEFT`, `AG_RIGHT`) | Text alignment. |
| `equals::Dict{String, String}` | `Dict{String,String}()` | A dictionary of colors by their values. |
| `threshold::AGThreshold` | `nothing` | Settings for highlighting cells based on a threshold value. |
| `include::Vector{String}` | `String[]` | Values that are active in the filter by default. |
| `exclude::Vector{String}` | `String[]` | Values that are disabled in the filter by default. |
"""
struct AgStringColumnDef <: AbstractColumnDef
    field_name::String
    header_name::String
    visible::Bool
    filter::AG_FILTER_TYPES
    initial_sort::AG_SORT_TYPES
    str_format::String
    width::Union{Integer,Nothing}
    cell_background::String
    rect_background::String
    color::String
    text_align::AG_TEXTALIGN_TYPES
    equals::AbstractDict{T,String} where {T<:String}
    threshold::Union{AGThreshold,Nothing}
    include::Vector{I} where {I<:String}
    exclude::Vector{E} where {E<:String}

    function AgStringColumnDef(;
        field_name::String,
        header_name::String = field_name,
        visible::Bool = true,
        filter::Bool = false,
        initial_sort::AG_SORT_TYPES = AG_NULL_SORT,
        str_format::String = "%s",
        width::Union{Integer,Nothing} = nothing,
        cell_background::AbstractString = "#fff",
        rect_background::AbstractString = "#fff",
        color::AbstractString = "#000",
        text_align::AG_TEXTALIGN_TYPES = AG_LEFT,
        equals::AbstractDict{String,String} = Dict{String,String}(),
        threshold::Union{AGThreshold,Nothing} = nothing,
        include::AbstractArray{String} = String[],
        exclude::AbstractArray{String} = String[],
    )
        return new(
            field_name,
            header_name,
            visible,
            filter ? AG_TEXT_FILTER : AG_NULL_FILTER,
            initial_sort,
            str_format,
            width,
            cell_background,
            rect_background !== "#fff" ? rect_background : cell_background,
            color,
            text_align,
            equals,
            threshold,
            include,
            exclude,
        )
    end
end
