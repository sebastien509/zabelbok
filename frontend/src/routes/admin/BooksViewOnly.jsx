// ✅ BooksViewOnly.jsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BooksViewOnly() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get('/books').then(res => setBooks(res.data));
  }, []);

  return (
    <div className="p-4 space-y-4">
      {books.map(book => (
        <Card key={book.id}>
          <CardHeader><CardTitle>{book.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">Course ID: {book.course_id}</p>
            <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open PDF</a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
