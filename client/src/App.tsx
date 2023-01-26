import {useEffect, useState} from "react";
import Table from "./Table";

function validate(s: string) {
    if (s.includes('$')) return false;
    if (s.startsWith('system.')) return false;
    return !!s;
    
}

function App() {
    let [tables, setTables] = useState<string[]>([]);
    let [currentTable, setCurrentTable] = useState<string>('');
    let [loading, setLoading] = useState(true);
    let load = () => fetch('/data/tables')
        .then(res => res.json())
        .then(r => setTables(r))
        .catch(console.log)
        .finally(() => setLoading(false));

    useEffect(() => {
        load();
    }, []);
    
    return (
        <div className="m-1">
            <h2 className="text-lg font-bold">
                {currentTable ? 'Current table : ' + currentTable : 'Tables :'}
            </h2>
            <div className={"flex flex-row gap-2 " + (loading ? 'pointer-events-none opacity-50' : '')}>
                <button
                    className="border border-teal-600 p-1 rounded-md bg-teal-600 text-white"
                    onClick={() => {
                        let output = window.prompt("Enter table name");
                        if (output && validate(output)) {
                            setLoading(true);
                            fetch('/data/table', {
                                method: 'POST',
                                body: JSON.stringify(output),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then(res => {
                                    if (res.status === 200) {
                                        load();
                                    }
                                })
                        }
                        else {
                            if (output) alert(output + ' is not a valid table name');
                        }
                    }}>
                    Create
                </button>
                {tables.map(t => {
                    return (
                        <button key={t}
                                onClick={() => setCurrentTable(t)}
                                className="border border-teal-600 p-1 rounded-md">
                            {t}
                        </button>
                    )
                })}
            </div>
            {currentTable && (
                <div className="pt-2">
                    <Table name={currentTable} />
                </div>
            )}
        </div>
    )
}

export default App;