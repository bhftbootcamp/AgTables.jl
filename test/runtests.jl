# runtests

using Test
using Dates
using UUIDs
using Serde
using AgTable

const skip_fileds = Set{Symbol}([
    :uuid_key,
    :license_key,
])

function Base.:(==)(l::T, r::T) where {T<:Union{<:AGTable,<:AbstractColumnDef}}
    for field in fieldnames(typeof(l))
        if field ∉ skip_fileds
            l_field = getfield(l, field)
            r_field = getfield(r, field)
            if l_field != r_field
                @warn "$field\n$l_field\n!=\n$r_field"
                return false
            end
        end
    end
    return true
end

const tests = [
    "table",
    "common",
]

@testset "AgTable" begin
    @info("Running tests:")

    for test ∈ tests
        @info("\t * $test ...")
        include("$test.jl")
    end
end
