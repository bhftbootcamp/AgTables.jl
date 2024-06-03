import React from "react";
import { LicenseManager } from "@ag-grid-enterprise/core";
import AgGrid from "./components/aggrid.jsx";
import Favicon from "./favicon.jsx";
import "./app.css";

const App = () => {
    document.title = table_json.name;
    table_json.licenseKey && LicenseManager.setLicenseKey(table_json.licenseKey);

    console.log(table_json);
    return <>
        <Favicon />
        <AgGrid table={table_json} />
    </>;
}

export default App;
