"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className=" bg-background w-full h-full">
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 w-full h-full flex flex-col items-center justify-center p-8">
        <div className="bg-white/80 rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center max-w-2xl">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">
            Welcome to the SMU Form Application Dashboard
          </h1>
          <p className="text-xl text-gray-700 mb-8 text-center max-w-xl">
            This is your central hub for managing forms, applications, and user
            tasks.
            <br />
            <span className="text-gray-500">
              Use the sidebar to navigate to the features you need.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
