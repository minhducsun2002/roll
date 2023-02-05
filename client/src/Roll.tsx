import {useContext, useEffect, useState} from "react";
import {getAuth, maskingCollection} from "./Data";
import {CredentialContext} from "./App";
import Record from "./Record";
import AnimatedRoll from "./AnimatedRoll";

function validate(s : string) {
    let r = s.split(',').map(piece => +piece);
    if (r.some(v => isNaN(v) || !Number.isSafeInteger(v))) {
        return;
    }
    
    return r.filter(Boolean);
}

function Roll() {
    let [tables, setTables] = useState<string[]>([]);
    let [currentTable, setCurrentTable] = useState<string>('');
    let [loading, setLoading] = useState(true);
    let [rolling, setRolling] = useState(false);
    let [rollConfigString, setRollConfigStringString] = useState('');
    let [rollConfig, setRollConfig] = useState<number[]>([]);
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
                            disabled={!validate(rollConfigString) || !rollConfigString || rolling}
                            className="border border-teal-600 p-2 bg-teal-600 text-white rounded-md disabled:pointer-events-none disabled:opacity-50"
                            onClick={() => {
                                let cfg = validate(rollConfigString)!;
                                setRollConfig(cfg);
                                setRolling(true);
                                let rollCount = cfg.reduce((a, b) => a + b, 0);
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
                        <input className={"p-1 border outline-none " + (validate(rollConfigString) ? '' : 'border-red-500')}
                               type='text'
                               value={rollConfigString} onChange={e => setRollConfigStringString(e.target.value)}/>
                        <div>
                            {`${Array.isArray(validate(rollConfigString)) ? `(total ${validate(rollConfigString)?.reduce((a, b) => a + b,  0)})` : ''} entries`}
                        </div>
                    </div>
                )}
                {rolling && (<b>Rolling...</b>)}
                {!!rollResult.length && !rolling && (
                    <div>
                        <br/>
                        <AnimatedRoll rollConfig={rollConfig} keys={[...keys]} entries={rollResult} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Roll;