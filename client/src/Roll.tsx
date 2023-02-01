import {useContext, useEffect, useState} from "react";
import {getAuth, maskingCollection} from "./Data";
import {CredentialContext} from "./App";
import Record from "./Record";

function Roll() {
    let [tables, setTables] = useState<string[]>([]);
    let [currentTable, setCurrentTable] = useState<string>('');
    let [rollCount, setRollCount] = useState(0);
    let [loading, setLoading] = useState(true);
    let [rolling, setRolling] = useState(false);
    let [rollResult, setRollResult] = useState<any[]>([]);
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

    let keys = new Set<string>();
    for (let obj of rollResult)
    {
        for (let k in obj)
        {
            if (k === '_id') continue;
            if (k === '__count') continue;
            keys.add(k);
        }
    }
    
    return (
        <div>
            <div className="text-lg text-center pt-2">
                <b>Chương trình quay số may mắn</b>
                <br/>
                {loading && <div>Loading...</div>}
                <br/>
                {!currentTable && (
                    <div>
                        <div>
                            <b>Choose a table :</b>
                        </div>
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
                    </div>
                )}
                {currentTable && (
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <button className='border border-blue-600 p-2 bg-blue-600 text-white rounded-md'
                                onClick={() => setCurrentTable('')}>
                            Go back
                        </button>
                        <button
                            disabled={!rollCount || rolling}
                            className="border border-teal-600 p-2 bg-teal-600 text-white rounded-md disabled:pointer-events-none disabled:opacity-50"
                            onClick={() => {
                                setRolling(true);
                                fetch(`/roll/${encodeURIComponent(currentTable)}/${rollCount}`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': getAuth(creds)
                                    }
                                })
                                    .then(res => res.json())
                                    .then(obj => {
                                        if (Array.isArray(obj)) {
                                            setRollResult(obj);
                                        }
                                    })
                                    .catch(console.log)
                                    .finally(() => setRolling(false))
                            }}>
                            Roll : <b>{currentTable}</b>
                        </button>
                        <div>for</div>
                        <input className="p-1 border"
                               type='number'
                               value={rollCount} onChange={e => setRollCount(e.target.valueAsNumber)} />
                        <div>entries</div>
                    </div>
                )}
                {rolling && (<b>Rolling...</b>)}
                {!!rollResult.length && !rolling && (
                    <div>
                        <br/>
                        <table className="data-table mx-auto">
                            <thead>
                            <tr>
                                {[...keys].map(k => (<th>{k}</th>))}
                            </tr>
                            </thead>
                            <tbody>
                                {rollResult
                                    .sort((a, b) => a.__count - b.__count)
                                    .map(row => {
                                    return <tr>{[...keys].map(k => (<td>{row[k]}</td>))}</tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Roll;