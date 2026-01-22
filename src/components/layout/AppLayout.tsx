import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6 pt-24">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
