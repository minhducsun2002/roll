import {useContext, useEffect, useState} from "react";
import {getAuth} from "./Data";
import {CredentialContext} from "./App";

function Record({ record, keys, tableName, onSave, add, isHide } : 
                { record: any, keys: string[], tableName: string, onSave?: () => void, add?: boolean, isHide?: boolean }
) {
    const [edited, setEdited] = useState(false);
    const [newRecord, setNewRecord] = useState<typeof record>({});
    const creds = useContext(CredentialContext);
    
    useEffect(() => {
        setNewRecord(record);
        setEdited(false);
    }, [record])
    
    return (
        <tr className={add ? 'bg-gray-100' : ''}>
            {keys.map(k => {
                if (typeof record[k] !== 'object')
                    return (
                        <td key={record[k]} className='p-2'>
                            <input type={(isHide && k !== 'name') ? 'number' : 'text'} className='border border-b' value={newRecord[k]} onChange={ev => {
                                let n = { ...newRecord, [k]: (isHide && k !== 'name') ? ev.target.valueAsNumber : ev.target.value };
                                setNewRecord(n);
                                setEdited(true);
                            }} />
                        </td>
                    );
                return <td key={''}></td>
            })}
            <td className='p-2'>
                <button
                    disabled={!edited}
                    className={'border border-black p-1 rounded-md disabled:opacity-50 disabled:pointer-events-none ' + (add ? 'bg-green-300' : 'bg-yellow-300')}
                    onClick={() => {
                        let r = newRecord;
                        if (isHide) {
                            r.prefix = +r.prefix || 0;
                            r.suffix = +r.suffix || 0;
                        }
                        fetch(add ? `/data/table/${tableName}` : `/data/table/${tableName}/${record._id.$oid}`, {
                            method: add ? 'POST' : 'PUT',
                            body: JSON.stringify(r),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': getAuth(creds)
                            }
                        })
                            .then(res => {
                                if (res.status === 200) {
                                    setEdited(false);
                                    onSave?.();
                                }
                                else {
                                    alert('saving failed : status code was ' + res.status);
                                }
                            })
                            .catch(console.log)
                    }}>
                    {add ? 'Add' : 'Save'}
                </button>
            </td>
            {!add && (
                <td>
                    <button
                        onClick={() => {
                            fetch(`/data/table/${tableName}/${record._id.$oid}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': getAuth(creds)
                                }
                            })
                                .then(res => {
                                    if (res.status === 200) {
                                        setEdited(false);
                                        onSave?.();
                                    }
                                    else {
                                        alert('saving failed : status code was ' + res.status);
                                    }
                                })
                                .catch(console.log)
                        }}
                        className='border border-black p-1 rounded-md disabled:opacity-50 disabled:pointer-events-none bg-red-300'>
                        Delete
                    </button>
                </td>
            )}
        </tr>
    )
}

export default Record;