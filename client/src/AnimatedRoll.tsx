import {useEffect, useState} from "react";

function AnimatedRoll({ rollConfig, entries, keys } : { rollConfig: number[], entries: any[], keys: string[] }) {
    let [stage, setStage] = useState(new Map<number, boolean>);
    useEffect(() => {
        setStage(new Map);
    }, [rollConfig, entries]);
    
    let indices = new Array(rollConfig.length).fill(0);
    for (let [index, el] of rollConfig.entries()) {
        indices[index] = (indices[index - 1] ?? 0) + el;
    }
    return (
        <div>
            <div className="w-fit mx-auto flex flex-col gap-2">
                {indices.map((count, index) => {
                    if (stage.get(index)) {
                        let prev = indices[index - 1] ?? 0;
                        let out = entries.slice(prev, indices[index]);
                        return (
                            <div className="pb-2">
                                <div className="mx-auto text-center text-xl font-bold pb-0.5">
                                    Giải {index + 1}
                                </div>
                                <table className="data-table mx-auto">
                                    <thead>
                                    <tr>
                                        {[...keys].map(k => (<th>{k}</th>))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {out
                                        .sort((a, b) => a.__count - b.__count)
                                        .map(row => {
                                            return <tr>{[...keys].map(k => (<td>{row[k]}</td>))}</tr>
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                    return (
                        <button
                            className='bg-orange-500 p-1 rounded-md'
                            onClick={() => {
                                let entries = [...stage];
                                let n = new Map(entries);
                                n.set(index, true);
                                setStage(n);
                            }}>
                            Quay giải {index + 1}
                        </button>
                    )
                })}
            </div>
        </div>
    )
    
    return null;
}

export default AnimatedRoll;