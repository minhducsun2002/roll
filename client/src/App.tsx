import React, {createContext, useState} from "react";
import Data, {getAuth} from "./Data";
import {Route, Routes} from "react-router";
import Roll from "./Roll";
import {BrowserRouter} from "react-router-dom";

export let CredentialContext = createContext<[string, string]>(['', '']);
function App() {
    let [creds, setCreds] = useState<[string, string]>(['', '']);
    let [loggingIn, setLoggingIn] = useState(false);

    if (!creds[0] || !creds[1]) {
        return (
            <button
                disabled={loggingIn}
                className="p-2 bg-teal-600 m-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => {
                    let username = window.prompt("Enter username");
                    if (!username) {
                        return alert('Username cannot be empty!')
                    }
                    let password = window.prompt("Enter password");
                    if (!password) {
                        return alert('Password cannot be empty!')
                    }
                    setLoggingIn(true);
                    fetch('/data/tables', {
                        headers: {
                            'Authorization': getAuth([username, password])
                        }
                    })
                        .then(res => {
                            if (res.status === 200) {
                                setCreds([username!, password!])
                            }
                            else {
                                alert('Wrong credentials!');
                            }
                        })
                        .catch(console.log)
                        .finally(() => setLoggingIn(false))
                }}>
                {loggingIn ? 'Logging in...' : 'Login'}
            </button>
        )
    }
    
    return (
        <CredentialContext.Provider value={creds}>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/*" element={<Data />}></Route>
                    <Route path="*" element={<Roll />}></Route>
                </Routes>
            </BrowserRouter>
        </CredentialContext.Provider>
    )
}

export default App;