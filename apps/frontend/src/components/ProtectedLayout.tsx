import { Navigate, Outlet } from 'react-router-dom';
import { useGlobalStateStore } from '../app/GlobalState';
import SidebarWithHeader from '../components/SidebarWithHeader/SidebarWithHeader';

export const ProtectedLayout = () => {
    const { user } = useGlobalStateStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarWithHeader>
            <Outlet />
        </SidebarWithHeader>
    );
};
