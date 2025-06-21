import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface InfoModalProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export const InfoModal = ({ title, children, trigger }: InfoModalProps) => (
  <Dialog>
    <DialogTrigger asChild>
      {trigger}
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="brand-heading text-xl text-symbol-black">{title}</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);
