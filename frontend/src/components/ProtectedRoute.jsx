import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function ProtectedRoute({ children }) {
    const { isAdmin } = useAdmin();
    const location = useLocation();

    if (!isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
