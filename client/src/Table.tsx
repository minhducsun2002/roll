import {useEffect, useState} from "react";
import Record from "./Record";

function Table({ name } : { name: string }) {
    let [loading, setLoading] = useState(false);
    let [data, setData] = useState<any[]>([]);
    
    let load = () => {
        setLoading(true);
        fetch('/data/table/' + encodeURIComponent(name))
            .then(res => res.json())
            .then(data => setData(data))
            .catch(console.log)
            .finally(() => setLoading(false));
    }
    
    useEffect(() => {
        load();
    }, [name])
    
    if (loading) {
        return (
            <div>
                <b>Loading...</b>
            </div>
        )
    }
    
    let keys = new Set<string>();
    for (let obj of data)
    {
        for (let k in obj)
        {
            if (k === '_id') continue;
            keys.add(k);
        }
    }
    
    return (
        <div>
            <table className="data-table">
                <thead>
                    <tr>
                        {[...keys].map(k => (<th>{k}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(d => {
                        return (
                            <Record tableName={name} keys={[...keys]} onSave={load} record={d} key={d._id?.$oid} />
                        )
                    })}
                    <Record add={true} tableName={name} keys={[...keys]} onSave={load} record={{}} key={'nope'} />
                </tbody>
            </table>
        </div>
    )
}

export default Table;