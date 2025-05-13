
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ShareButton: React.FC = () => {
  const handleShare = () => {
    // In a real implementation, this would generate a shareable link
    // For now, just show a toast notification
    toast({
      title: "Share Feature",
      description: "Sharing functionality will be implemented in a future update.",
    });
  };
  
  return (
    <Button size="sm" variant="outline" className="bg-white" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};

export default ShareButton;
