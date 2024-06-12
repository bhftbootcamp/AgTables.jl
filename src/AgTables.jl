module AgTables

export ag_panel,
    ag_table,
    ag_show,
    ag_save

export AGPanel,
    AGTable,
    AGFormatter,
    AGThreshold

export AbstractColumnDef

export AgNumberColumnDef,
    AgStringColumnDef,
    AgTimeColumnDef

export AG_FILTER_TYPES,
    AG_STYLE_TYPES,
    AG_TEXTALIGN_TYPES,
    AG_SORT_MODES

export AG_TEXT_FILTER,
    AG_NUMBER_FILTER,
    AG_DATE_FILTER,
    AG_NULL_FILTER

export AG_DATE_TIME,
    AG_DATE,
    AG_TIME

export AG_CURRENCY,
    AG_DECIMAL,
    AG_PERCENT

export AG_LEFT,
    AG_CENTER,
    AG_RIGHT

export AG_ASC,
    AG_DESC

using Serde
using OrderedCollections
using Dates, SHA, UUIDs

abstract type AbstractColumnDef end

const AG_TABLE_ID = Ref{Int64}(0)

function datetime2epoch end
function format_value end

include("currency_codes.jl")

include("column/column.jl")
using .AGColumns

include("data_utils.jl")

"""
    AGTable

A base type that contains the necessary information to visualize a table.

See also: [`ag_table`](@ref), [`ag_show`](@ref), [`ag_save`](@ref).
"""
Base.@kwdef struct AGTable
    name::String
    row_data::Vector{Dict{String,Any}}
    resize::Bool
    flex::Bool
    header_height::Integer
    row_height::Integer
    column_filter::Bool
    column_defs::Vector{<:AbstractColumnDef}
end

function Base.show(io::IO, h::AGTable)
    return println(io, "AgTables.AGTable($(h.name))")
end

"""
    ag_table(data::Vector{T}, column_defs::AbstractColumnDef...; kw...) -> AGTable

Creates a table using `data`, where elements can be `NamedTuple`s, `Dict`s, or custom types.
With `column_defs` you can configure parameters and formatting of [`columns`](@ref column).

!!! warning
    Adding more than 100K `data` rows to a table may cause performance issues.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:-------------------------|:------------|
| `name::String` |` "AgTables ❤️ Julia"` | Table name and tab title. |
| `resize::Bool` | `true` | Column width flexibility. |
| `flex::Bool` | `true` | Stretching columns to fit the available width. |
| `header_height::Integer` | `40` | Header height in px. |
| `row_height::Integer` | `39` | Row height in px. |
| `column_filter::Bool` | `false` | If a filter for column names should be used. |

See also: [`ag_show`](@ref), [`ag_save`](@ref).
"""
function ag_table(
    row_data::AbstractVector{T},
    column_defs::AbstractColumnDef...;
    name::AbstractString = "Sheet$(AG_TABLE_ID[] += 1)",
    resize::Bool = true,
    flex::Bool = true,
    header_height::Integer = 40,
    row_height::Integer = 39,
    column_filter::Bool = false,
)::AGTable where {T}
    new_column_defs, new_row_data = format_row_data(column_defs, row_data)
    return AGTable(
        name = name,
        row_data = new_row_data,
        resize = resize,
        flex = flex,
        header_height = header_height,
        row_height = row_height,
        column_filter = column_filter,
        column_defs = new_column_defs,
    )
end

"""
    AGPanel

A type that allows you to combine multiple table for visualization.

See also: [`ag_panel`](@ref), [`ag_show`](@ref), [`ag_save`](@ref).
"""
Base.@kwdef struct AGPanel
    name::String
    tables::Tuple{Vararg{AGTable}}
    bottom::Bool
    uuid_key::String
    license_key::String
end

function Base.show(io::IO, h::AGPanel)
    return println(io, "AgTables.AGPanel($(h.name))")
end

"""
    ag_panel(tables::AGTable...; kw...) -> AGPanel

Creates a panel combining several [`tables`](@ref table).

## Keyword arguments
| Name::Type | Default/Posible values | Description |
|:-----------|:-----------------------|:------------|
| `name::String` |` "AgTables ❤️ Julia"` | Panel name (will be displayed in the browser tab title). |
| `bottom::Bool` | `false` | Move the table tabs to the bottom of the page. |

See also: [`ag_show`](@ref), [`ag_save`](@ref).
"""
function ag_panel(
    tables::AGTable...;
    name::AbstractString = "AgTables ❤️ Julia",
    bottom::Bool = false,
)::AGPanel
    return AGPanel(
        name = name,
        tables = tables,
        bottom = bottom,
        uuid_key = string(UUIDs.uuid4()),
        license_key = get(ENV, "AG_GRID_LICENSE_KEY", ""),
    )
end

function Base.string(panel::AGPanel)
    html = read(joinpath(@__DIR__, "..", "frontend", "dist", "agtable.html"), String)
    bundle = read(joinpath(@__DIR__, "..", "frontend", "dist", "index_boundle.js"), String)

    return replace(
        html,
        Regex("{{\\s*(bundle)\\s*}}") => bundle,
        Regex("{{\\s*(table_json)\\s*}}") => Serde.to_json(panel),
    )
end

function Base.string(table::AGTable)
    return string(ag_panel(table))
end

function to_camelcase(x::String)
    w = split(x, "_")
    return if length(w) > 1
        w[1] * join(titlecase.(w[2:end]))
    else
        x
    end
end

function to_camelcase(x::Symbol)
    return Symbol(to_camelcase(string(x)))
end

function Serde.SerJson.ser_name(::Type{<:AGPanel}, ::Val{T}) where {T}
    return to_camelcase(T)
end

function Serde.SerJson.ser_name(::Type{<:AGTable}, ::Val{T}) where {T}
    return to_camelcase(T)
end

function Serde.SerJson.ser_name(::Type{<:AbstractColumnDef}, ::Val{T}) where {T}
    return to_camelcase(T)
end

function open_browser(url::String)::Bool
    if Sys.isapple()
        Base.run(`open $url`)
        true
    elseif Sys.islinux()
        Base.run(`xdg-open $url`)
        true
    elseif Sys.iswindows() || detectwsl()
        Base.run(`powershell.exe Start "'$url'"`)
        true
    else
        false
    end
end

"""
    ag_save([, filepath], table)

Saves the table to a location specified by `filepath` (the preferred file extension is html).
By default, saves the table to the home directory.

See also [`ag_show`](@ref).
"""
function ag_save(filepath::String, table)::String
    write(filepath, string(table))
    return filepath
end

"""
    ag_show(table; filepath = joinpath(homedir(), "agtable.html"))

Saves the table to a location specified by `filepath` and displays it in the browser.

See also [`ag_save`](@ref).
"""
function ag_show(table; filepath = joinpath(homedir(), "agtable.html"))::Bool
    return open_browser(ag_save(filepath, table))
end

include("sample_data.jl")

end
