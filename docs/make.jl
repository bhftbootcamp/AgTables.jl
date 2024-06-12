using AgTables
using Documenter

DocMeta.setdocmeta!(AgTables, :DocTestSetup, :(using AgTables); recursive = true)

makedocs(;
    modules = [AgTables],
    sitename = "AgTables.jl",
    format = Documenter.HTML(;
        repolink = "https://github.com/bhftbootcamp/AgTables.jl",
        canonical = "https://bhftbootcamp.github.io/AgTables.jl",
        edit_link = "master",
        assets = ["assets/favicon.ico"],
        sidebar_sitename = true,  # Set to 'false' if the package logo already contain its name
    ),
    pages = [
        "Home" => "index.md",
        "API Reference" => [
            "pages/table.md",
            "pages/utils.md"
        ]
    ],
    warnonly = [:doctest, :missing_docs],
)

deploydocs(;
    repo = "github.com/bhftbootcamp/AgTables.jl",
    devbranch = "master",
    push_preview = true,
)
