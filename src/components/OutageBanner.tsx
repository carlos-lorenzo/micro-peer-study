import { AlertTriangle } from 'lucide-react';

export function OutageBanner() {
  // Controlled via NEXT_PUBLIC_IMAGE_SERVICE_OUTAGE, set to 'spain' to show
  const outage = process.env.NEXT_PUBLIC_IMAGE_SERVICE_OUTAGE;

  if (!outage || outage !== 'spain') return null;

  return (
    <div className="w-full"> 
      <div className="container mx-auto px-4 py-3">
        <div className="max-w-5xl mx-auto bg-surface border border-muted-bg rounded-lg shadow-sm p-3 flex items-start gap-4">
          {/* Accent stripe */}
          <div className="w-1 rounded-full bg-yellow-400 mt-1" />

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="bg-yellow-50 text-yellow-700 rounded-md p-2 border border-yellow-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="font-semibold text-foreground">Aviso — Problemas con la visualización de imágenes</div>
            <div className="text-sm text-muted mt-1">Debido a causas externas, la obtención y renderizado de imágenes está fallando en España. Las subidas de imágenes funcionan con normalidad.</div>
            <div className="mt-2 text-xs text-muted font-medium">Sugerencia: si no ves las imágenes, prueba conectarte mediante una VPN a otro país temporalmente.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutageBanner;
