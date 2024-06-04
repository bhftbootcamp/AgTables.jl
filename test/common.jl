# runtests/common

@testset verbose = true "Settings serialization" begin
    @testset "Case №1: Filters" begin
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_TEXT_FILTER) == "text"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_NUMBER_FILTER) == "number"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_DATE_FILTER) == "date"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_NULL_FILTER) |> isnothing
    end

    @testset "Case №1: Time formatting" begin
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_DATE_TIME) == "datetime"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_DATE) == "date"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_TIME) == "time"
    end

    @testset "Case №1: Number styles" begin
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_CURRENCY) == "currency"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_DECIMAL) == "decimal"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_PERCENT) == "percent"
    end

    @testset "Case №1: Text align" begin
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_LEFT) == "left"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_CENTER) == "center"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_RIGHT) == "right"
    end

    @testset "Case №1: Sort" begin
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_ASC) == "asc"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_DESC) == "desc"
        @test Serde.SerJson.ser_type(AbstractColumnDef, AG_NULL_SORT) |> isnothing
    end
end
