import React from "react";
import { LicenseManager } from "@ag-grid-enterprise/core";
import Panel from "./components/panel.jsx";
import Favicon from "./favicon.jsx";
import "./app.css";

const App = () => {
    document.title = table_json.name;
    table_json.licenseKey && LicenseManager.setLicenseKey(table_json.licenseKey);

    console.log(table_json);
    return <>
        <Favicon />
        <Panel table={table_json}/>
    </>;
}

export default App;
