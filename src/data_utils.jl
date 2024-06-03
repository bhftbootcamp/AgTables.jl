# data_utils

issimple(::Any)::Bool = false
issimple(::AbstractString)::Bool = true
issimple(::Symbol)::Bool = true
issimple(::AbstractChar)::Bool = true
issimple(::Number)::Bool = true
issimple(::Enum)::Bool = true
issimple(::Type)::Bool = true
issimple(::Dates.TimeType)::Bool = true
issimple(::UUID)::Bool = true

function flatten(data::AbstractDict{K,V}; delimiter::AbstractString = "_") where {K,V}
    result = OrderedDict{String,Any}()
    for (key, value) in data
        key = string(key)
        if isa(value, AbstractDict)
            for (k, v) in flatten(value; delimiter = delimiter)
                result[key * delimiter * k] = v
            end
        else
            result[key] = value
        end
    end
    return result
end

function flatten(data::T; delimiter::AbstractString = "_") where {T}
    result = OrderedDict{String,Any}()
    for key in fieldnames(T)
        value = getproperty(data, key)
        key = string(key)
        if !issimple(value)
            for (k, v) in flatten(value; delimiter = delimiter)
                result[key * delimiter * k] = v
            end
        else
            result[key] = value
        end
    end
    return result
end

function add_missing_column_defs(
    cols_names::AbstractSet{String},
    column_defs::Tuple{Vararg{AbstractColumnDef}},
)
    defs_names = [def.field_name for def in column_defs]
    if !allunique(defs_names)
        error("Column definitions must have unique names")
    end

    incorrect_names = setdiff(defs_names, cols_names)
    if !isempty(incorrect_names)
        error("Incorrect column names: $(join(incorrect_names, ", "))")
    end

    missing_defs = setdiff(cols_names, defs_names)
    new_column_defs::Vector{AbstractColumnDef} = collect(column_defs)

    for name in missing_defs
        push!(new_column_defs, AgStringColumnDef(; field_name = name))
    end

    return sort(
        new_column_defs,
        by = x -> findfirst(z -> z == x.field_name, collect(cols_names)),
    )
end

datetime2epoch(x::DateTime)::Int64 = @inline (Dates.value(x) - Dates.UNIXEPOCH)
datetime2epoch(x::Date)::Int64 = @inline datetime2epoch(DateTime(x))
datetime2epoch(x::Real)::Int64 = x

format_value(::AgStringColumnDef, x) = x
format_value(::AgNumberColumnDef, x::Number) = x
format_value(::AgNumberColumnDef, x::AbstractString) = @inline parse(Float64, x)
format_value(::AgTimeColumnDef, x::AbstractString) = DateTime(x)
format_value(::AgTimeColumnDef, x) = datetime2epoch(x)

function format_row_data(
    column_defs::Tuple{Vararg{AbstractColumnDef}},
    row_data::Vector{T},
) where {T}
    cols = OrderedSet{String}()
    vals = Vector{Dict{String,Any}}(undef, length(row_data))
    for (index, row) in enumerate(row_data)
        val = flatten(row)
        push!(cols, keys(val)...)
        vals[index] = val
    end
    n_defs = add_missing_column_defs(cols, column_defs)
    n_rows = Dict{String,Any}[]
    for row in vals
        n_row = Dict{String,Any}()
        for def in n_defs
            col_val = get(row, def.field_name, nothing)
            n_row[def.field_name] = if col_val === nothing
                "―"
            else
                @inline format_value(def, col_val)
            end
        end
        push!(n_rows, n_row)
    end
    return n_defs, n_rows
end
