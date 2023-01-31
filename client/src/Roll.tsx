import {useContext, useEffect, useState} from "react";
import {getAuth, maskingCollection} from "./Data";
import {CredentialContext} from "./App";

function Roll() {
    let [tables, setTables] = useState<string[]>([]);
    let [currentTable, setCurrentTable] = useState<string>('');
    let [hide, setHide] = useState<{ prefix: number, suffix: number, name: string }[]>([]);
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
        <div>
            <div className="text-lg text-center pt-2">
                <b>Chương trình quay số may mắn</b>
                <br/>
                {loading && <div>Loading...</div>}
                <br/>
                {!currentTable && (
                    <div className="flex flex-row gap-2 justify-center">
                        {tables
                            .filter(t => t !== '_hide')
                            .map(t => {
                                return (
                                    <div className="flex flex-row rounded-md" key={t}>
                                        <button
                                                onClick={() => setCurrentTable(t)}
                                                className="border border-teal-600 p-1">
                                            {t}
                                        </button>
                                    </div>
                                )
                            })}
                    </div>
                )}
                {currentTable && (
                    <button className="border border-teal-600 p-2 bg-teal-600 text-white rounded-md">
                        Roll
                    </button>
                )}
            </div>
        </div>
    )
}

export default Roll;