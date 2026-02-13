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
        <main className="p-4 sm:p-6 3xl:p-8 4xl:p-10 pt-24">
          <div className="max-w-[2200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
