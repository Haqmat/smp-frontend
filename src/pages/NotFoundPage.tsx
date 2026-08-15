import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#a38413]">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mt-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mt-2">
          The page you are looking for does not exist.
        </p>
        <Link to="/dashboard">
          <Button className="mt-6 rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;