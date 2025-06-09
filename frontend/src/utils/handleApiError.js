import { toast } from '@/components/ui/use-toast';

export function handleApiError(error, fallbackMessage = 'Something went wrong') {
  if (!error?.response) {
    toast({ title: 'Network Error', description: 'Please check your connection.', variant: 'destructive' });
    return;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      toast({ title: 'Bad Request', description: data.message || fallbackMessage, variant: 'destructive' });
      break;
    case 401:
      toast({ title: 'Unauthorized', description: 'Your session may have expired.', variant: 'destructive' });
      break;
    case 403:
      toast({ title: 'Forbidden', description: 'You do not have access.', variant: 'destructive' });
      break;
    case 404:
      toast({ title: 'Not Found', description: data.message || 'Resource not found.', variant: 'destructive' });
      break;
    case 500:
      toast({ title: 'Server Error', description: 'Please try again later.', variant: 'destructive' });
      break;
    default:
      toast({ title: `Error ${status}`, description: data.message || fallbackMessage, variant: 'destructive' });
  }
}

