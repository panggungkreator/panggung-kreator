import React from "react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-[#2c2c2c] dark:bg-[#2c2c2c] dark:text-white transition-colors duration-300 min-h-screen flex flex-col font-sans selection:bg-[#2c2c2c] selection:text-white dark:selection:bg-white dark:selection:text-[#2c2c2c]">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

