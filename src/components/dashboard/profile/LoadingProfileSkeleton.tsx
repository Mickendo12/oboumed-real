
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const LoadingProfileSkeleton: React.FC = () => {
  return (
    <Card className="dark-container">
      <CardContent className="pt-6">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingProfileSkeleton;
