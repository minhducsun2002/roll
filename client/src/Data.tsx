import {useContext, useEffect, useState} from "react";
import Table from "./Table";
import {CredentialContext} from "./App";

function validate(s: string) {
    if (s.includes('$')) return false;
    if (s.startsWith('system.')) return false;
    return !!s;
    
}

export const maskingCollection = '_hide';
export function getAuth(creds : [string, string]) {
    return `${btoa(creds[0])},${btoa(creds[1])}`;
}
function Data() {
    let [tables, setTables] = useState<string[]>([]);
    let [file, setFile] = useState<File | null>(null);
    let [currentTable, setCurrentTable] = useState<string>('');
    let [loading, setLoading] = useState(true);
    let creds = useContext(CredentialContext);
    
    let load = () => fetch('/data/tables', {
        headers: {
            'Authorization': getAuth(creds)
        }
    })
        .then(res => res.json())
        .then(r => {
            setTables(r);
            return r;
        })
        .catch(console.log)
        .finally(() => setLoading(false));

    useEffect(() => {
        load();
    }, []);
    
    return (
        <CredentialContext.Provider value={creds}>
            <div className="m-1">
                <h2 className="text-lg font-bold">
                    {currentTable ? 'Current table : ' + currentTable : 'Tables :'}
                </h2>
                <div className="flex flex-row gap-2 items-center mb-2">
                    <button
                        disabled={!file}
                        className="border border-teal-600 p-1 rounded-md bg-teal-600 text-white disabled:pointer-events-none disabled:opacity-50"
                        onClick={() => {
                            let output = window.prompt("Enter table name");
                            if (output && validate(output) && file) {
                                setLoading(true);
                                let formData = new FormData();
                                formData.set('file', file);
                                fetch(`/import/xlsx/${output}`, {
                                    method: 'POST',
                                    body: formData,
                                    headers: {
                                        'Authorization': getAuth(creds)
                                    }
                                })
                                    .then(res => {
                                        if (res.status === 200) {
                                            load().then(tables => {
                                                if (tables?.includes?.(output!.toLowerCase())) {
                                                    setCurrentTable(output!);
                                                }
                                            });
                                        }
                                        else {
                                            res.text().then(r => alert(r))
                                        }
                                    })
                            }
                            else {
                                if (output) alert(output + ' is not a valid table name');
                            }
                        }}>
                        Create
                    </button>
                    <input type="file" className="border rounded-md p-1" onChange={event => {
                        setFile(event.target.files?.[0] || null)
                    }} />
                </div>
                <div className={"flex flex-row gap-2 " + (loading ? 'pointer-events-none opacity-50' : '')}>
                    <div>
                        <div className="flex flex-row rounded-md">
                            <button
                                    onClick={() => setCurrentTable(maskingCollection)}
                                    className="border border-teal-600 p-1">
                                <b>[Masking configuration]</b>
                            </button>
                        </div>
                    </div>
                    {tables
                        .filter(t => t !== '_hide')
                        .map(t => {
                        return (
                            <div className="flex flex-row rounded-md">
                                <button key={t}
                                        onClick={() => setCurrentTable(t)}
                                        className="border-y border-l border-teal-600 p-1">
                                    {t}
                                </button>
                                <button
                                    className="border-y border-r border-red-600 bg-red-600 text-white py-1 px-2"
                                    onClick={() => {
                                        if (window.confirm('Delete table ' + t + '?')) {
                                            fetch('/data/table/' + encodeURIComponent(t.toLowerCase()), {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': getAuth(creds)
                                                }
                                            })
                                                .then(res => {
                                                    if (res.status === 200) {
                                                        if (currentTable.toLowerCase() === t.toLowerCase()) {
                                                            setCurrentTable('');
                                                        }
                                                        load();
                                                    }
                                                    else {
                                                        res.text().then(r => alert(r))
                                                    }
                                                })
                                        }
                                    }}>
                                    x
                                </button>
                            </div>
                        )
                    })}
                </div>
                {currentTable && (
                    <div className="pt-2">
                        <Table name={currentTable} />
                    </div>
                )}
            </div>
        </CredentialContext.Provider>
    )
}

export default Data;