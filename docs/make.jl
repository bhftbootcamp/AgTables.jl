using AgTable
using Documenter

DocMeta.setdocmeta!(AgTable, :DocTestSetup, :(using AgTable); recursive = true)

makedocs(;
    modules = [AgTable],
    sitename = "AgTable.jl",
    format = Documenter.HTML(;
        repolink = "https://github.com/bhftbootcamp/AgTable.jl",
        canonical = "https://bhftbootcamp.github.io/AgTable.jl",
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
    repo = "github.com/bhftbootcamp/AgTable.jl",
    devbranch = "master",
    push_preview = true,
)
