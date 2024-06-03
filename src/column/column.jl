module AGColumns

export AGFormatter,
    AGThreshold

export AgStringColumnDef,
    AgNumberColumnDef,
    AgTimeColumnDef

export AG_FILTER_TYPES,
    AG_STYLE_TYPES,
    AG_TEXTALIGN_TYPES

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

using Serde
using Dates

import ..AbstractColumnDef,
    ..datetime2epoch

import ..AG_CURRENCY_CODES, ..USD

@enum AG_FILTER_TYPES begin
    AG_TEXT_FILTER = 0
    AG_NUMBER_FILTER = 1
    AG_DATE_FILTER = 2
    AG_NULL_FILTER = 3
end

@enum AG_DATE_FORMATER begin
    AG_DATE_TIME = 0
    AG_DATE = 1
    AG_TIME = 2
end

@enum AG_TEXTALIGN_TYPES begin
    AG_LEFT = 0
    AG_CENTER = 1
    AG_RIGHT = 2
end

@enum AG_STYLE_TYPES begin
    AG_CURRENCY = 0
    AG_DECIMAL = 1
    AG_PERCENT = 2
end

function Serde.SerJson.ser_type(::Type{<:AbstractColumnDef}, x::AG_FILTER_TYPES)
    x == AG_TEXT_FILTER && return "text"
    x == AG_NUMBER_FILTER && return "number"
    x == AG_DATE_FILTER && return "date"
    return nothing
end

function Serde.SerJson.ser_type(::Type{<:AbstractColumnDef}, x::AG_DATE_FORMATER)
    x == AG_DATE_TIME && return "datetime"
    x == AG_DATE && return "date"
    return "time"
end

function Serde.SerJson.ser_type(::Type{<:AbstractColumnDef}, x::AG_TEXTALIGN_TYPES)
    x == AG_LEFT && return "left"
    x == AG_CENTER && return "center"
    return "right"
end

function Serde.SerJson.ser_type(::Type{<:AbstractColumnDef}, x::AG_STYLE_TYPES)
    x == AG_CURRENCY && return "currency"
    x == AG_DECIMAL && return "decimal"
    return "percent"
end

"""
    AGThreshold(value; kw...)

Type used to visually color-code column values based on a threshold.
Can be used for numeric, string, and time columns.

## Keyword arguments
| Name::Type | Default (Possible values) | Description |
|:-----------|:--------------------------|:------------|
| `color_up::String` | `"#399746"` | Color for values above the threshold. |
| `color_down::String` | `"#ca3c32"` | Color for values below the threshold. |
"""
struct AGThreshold <: AbstractColumnDef
    value::T where {T<:Union{Real,String}}
    color_up::String
    color_down::String

    function AGThreshold(
        value::Real;
        color_up::AbstractString = "#399746",
        color_down::AbstractString = "#ca3c32",
    )
        return new(value, color_up, color_down)
    end

    function AGThreshold(
        value::String;
        color_up::AbstractString = "#399746",
        color_down::AbstractString = "#ca3c32",
    )
        return new(value, color_up, color_down)
    end

    function AGThreshold(
        value::TimeType;
        color_up::AbstractString = "#399746",
        color_down::AbstractString = "#ca3c32",
    )
        return new(datetime2epoch(value), color_up, color_down)
    end
end

include("time_column.jl")
include("number_column.jl")
include("string_column.jl")

end
