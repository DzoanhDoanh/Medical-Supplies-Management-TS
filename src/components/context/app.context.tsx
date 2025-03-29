import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { HashLoader } from 'react-spinners';
import { getUserByIdApi } from '../../services/api';
interface IAppContext {
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    setUser: (v: IUser | null) => void;
    user: IUser | null;
    appLoading: boolean;
    setAppLoading: (v: boolean) => void;
}
interface DecodedToken {
    email: string;
    exp: number;
    iat: number;
    sub: string;
}
type TProps = {
    children: React.ReactNode;
};
const CurrentAppContext = createContext<IAppContext | null>(null);

export const AppProvider = (props: TProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [appLoading, setAppLoading] = useState<boolean>(true);

    useEffect(() => {
        const getUserInfo = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const decoded: DecodedToken = jwtDecode(token);
                const res = await getUserByIdApi(decoded.sub);
                if (res.data) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                }
            }
            const timeout = setTimeout(() => {
                setAppLoading(false);
            }, 1000);
            return () => {
                clearTimeout(timeout);
            };
        };
        getUserInfo();
    }, []);
    return (
        <>
            {appLoading === false ? (
                <CurrentAppContext.Provider
                    value={{
                        isAuthenticated,
                        user,
                        setIsAuthenticated,
                        setUser,
                        appLoading,
                        setAppLoading,
                    }}
                >
                    {props.children}
                </CurrentAppContext.Provider>
            ) : (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <HashLoader size={30} color="red" />
                </div>
            )}
        </>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrentApp = () => {
    const currentAppContext = useContext(CurrentAppContext);
    if (!currentAppContext) {
        throw new Error('useCurrentApp has to be used within <CurrentAppContext.Provider>');
    }
    return currentAppContext;
};
