import React, { createContext, useContext } from 'react';

const AuthContext = createContext({ usuario: null });

export function AuthProvider({ usuario, children }) {
    return (
        <AuthContext.Provider value={{ usuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
