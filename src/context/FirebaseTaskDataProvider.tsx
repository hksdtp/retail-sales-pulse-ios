
import React, { ReactNode } from 'react';
import { TaskDataProvider } from './TaskDataProvider';

interface FirebaseTaskDataProviderProps {
  children: ReactNode;
}

export const FirebaseTaskDataProvider: React.FC<FirebaseTaskDataProviderProps> = ({ children }) => {
  return (
    <TaskDataProvider>
      {children}
    </TaskDataProvider>
  );
};
