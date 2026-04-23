import Link from 'next/link';
import { Microscope, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="border-b border-muted-bg bg-surface/90 sticky top-0 z-50 backdrop-blur-md transition-colors duration-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary active:scale-95 transition-transform">
          <Microscope className="h-6 w-6" />
          <span>Histology Hub</span>
        </Link>
        <nav>
          <Link href="/upload" passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-2 hover:shadow-sm animation-lift">
              <PlusCircle className="h-4 w-4" />
              Subir Pregunta
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
