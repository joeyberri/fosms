import { Route, Routes } from 'react-router-dom';
import SidebarWithHeader from '../components/SidebarWithHeader/SidebarWithHeader';
import { ProtectedLayout } from '../components/ProtectedLayout';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../utils/trpc';
import SignUpCard from '../components/Auth/SignUpCard/SignUpCard';
import SignInCard from '../components/Auth/SignInCard/SignInCard';
import { useQueryTrpcClient } from './useQueryClient';
import AuthVerify from '../components/Auth/AuthVerify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Heading, Box } from '@chakra-ui/react';
import Home from '../pages/Home';
import Schedule from '../pages/Schedule';
import Swaps from '../pages/Swaps';
import ManageUsers from '../pages/admin/ManageUsers';
import Reports from '../pages/admin/Reports';

export function App() {
  const { queryClient, trpcClient } = useQueryTrpcClient();
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="colored"
        hideProgressBar
        closeOnClick
      />
      <QueryClientProvider client={queryClient}>
        <AuthVerify />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<SignInCard />} />
          <Route path="/sign-up" element={<SignUpCard />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/swaps" element={<Swaps />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Box p={4}><Heading>404 Not Found</Heading></Box>} />
        </Routes>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
