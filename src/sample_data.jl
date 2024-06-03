# sample_data

export ag_stock_sample_data,
    ag_order_sample_data,
    ag_currencies_sample_data,
    ag_flights_sample_data

struct StockItem
    name::String
    price::Float64
    h24::Float64
    volume::Float64
    mkt::Float64
    sector::String
end

struct Order
    symbol::String
    createdAt::DateTime
    orderId::String
    orderStatus::String
    orderSide::String
    orderType::String
    timeInForce::String
    origQty::Float64
    executedQty::Float64
    price::Float64
end

function Serde.deser(::Type{Order}, ::Type{DateTime}, x::String)
    return unix2datetime(parse(Int64, x))
end

function ag_stock_sample_data()
    return deser_json(Vector{StockItem}, read(joinpath(@__DIR__, "../assets/stock_sample_data.json")))
end

function ag_currencies_sample_data()
    return parse_csv(read(joinpath(@__DIR__, "../assets/currencies_sample_data.csv")))
end

function ag_flights_sample_data()
    return parse_csv(read(joinpath(@__DIR__, "../assets/flights_sample_data.csv")))
end

function ag_order_sample_data()
    sample_data = deser_csv(Order, read(joinpath(@__DIR__, "../assets/order_sample_data.csv")))
    return [sample_data; rand(sample_data, 80)]
end
